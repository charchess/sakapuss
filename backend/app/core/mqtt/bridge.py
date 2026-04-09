"""MQTT Bridge for Home Assistant integration.

Provides HA Discovery, proactive notifications, and bidirectional validation.
Gracefully degrades if no broker is configured (mqtt_broker_host empty).
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class MqttBridge:
    """Async MQTT client wrapper for Home Assistant integration."""

    def __init__(self) -> None:
        self._client: Any = None
        self._connected = False
        self._discovery_published = False
        self._enabled = bool(settings.mqtt_broker_host)

    @property
    def enabled(self) -> bool:
        return self._enabled

    @property
    def connected(self) -> bool:
        return self._connected

    @property
    def discovery_published(self) -> bool:
        return self._discovery_published

    async def connect(self) -> None:
        """Connect to the MQTT broker. No-op if not configured."""
        if not self._enabled:
            logger.info("MQTT bridge disabled (no broker configured)")
            return

        try:
            from gmqtt import Client as MqttClient

            self._client = MqttClient("sakapuss-bridge")

            self._client.on_connect = self._on_connect
            self._client.on_message = self._on_message
            self._client.on_disconnect = self._on_disconnect

            if settings.mqtt_username:
                self._client.set_auth_credentials(settings.mqtt_username, settings.mqtt_password)

            await self._client.connect(
                settings.mqtt_broker_host,
                settings.mqtt_broker_port,
            )
            self._connected = True
            logger.info(
                "MQTT connected to %s:%d",
                settings.mqtt_broker_host,
                settings.mqtt_broker_port,
            )
        except Exception:
            logger.exception("Failed to connect to MQTT broker")
            self._connected = False

    async def disconnect(self) -> None:
        """Disconnect from the MQTT broker."""
        if self._client and self._connected:
            await self._client.disconnect()
            self._connected = False
            logger.info("MQTT disconnected")

    async def publish_ha_discovery(self, pets: list[dict]) -> None:
        """Publish Home Assistant MQTT Discovery payloads for each pet.

        Creates sensor entities for last_weight and binary_sensor for vaccine_status.
        """
        if not self._connected or not self._client:
            logger.debug("MQTT not connected, skipping HA Discovery")
            return

        prefix = settings.mqtt_discovery_prefix

        for pet in pets:
            pet_id = pet["id"]
            pet_name = pet["name"]
            slug = pet_name.lower().replace(" ", "_")

            # Weight sensor
            weight_config = {
                "name": f"{pet_name} Last Weight",
                "unique_id": f"sakapuss_{pet_id}_weight",
                "state_topic": f"sakapuss/{pet_id}/weight",
                "unit_of_measurement": "kg",
                "device": {
                    "identifiers": [f"sakapuss_{pet_id}"],
                    "name": pet_name,
                    "manufacturer": "Sakapuss",
                },
            }
            self._client.publish(
                f"{prefix}/sensor/sakapuss/{slug}_weight/config",
                json.dumps(weight_config),
                retain=True,
            )

            # Vaccine status binary sensor
            vaccine_config = {
                "name": f"{pet_name} Vaccine Status",
                "unique_id": f"sakapuss_{pet_id}_vaccine",
                "state_topic": f"sakapuss/{pet_id}/vaccine_status",
                "payload_on": "up_to_date",
                "payload_off": "overdue",
                "device": {
                    "identifiers": [f"sakapuss_{pet_id}"],
                    "name": pet_name,
                    "manufacturer": "Sakapuss",
                },
            }
            self._client.publish(
                f"{prefix}/binary_sensor/sakapuss/{slug}_vaccine/config",
                json.dumps(vaccine_config),
                retain=True,
            )

            # Subscribe to command topics for bidirectional validation
            self._client.subscribe(f"sakapuss/{pet_id}/command/#")

        self._discovery_published = True
        logger.info("HA Discovery published for %d pet(s)", len(pets))

    async def publish_notification(
        self,
        pet_name: str,
        pet_id: str,
        reminder_type: str,
        reminder_name: str,
        due_date: str,
    ) -> None:
        """Publish a proactive notification via MQTT."""
        if not self._connected or not self._client:
            return

        payload = json.dumps(
            {
                "pet_name": pet_name,
                "type": reminder_type,
                "name": reminder_name,
                "due_date": due_date,
            }
        )
        self._client.publish(f"sakapuss/{pet_id}/notification", payload)
        logger.info("Notification sent for %s: %s due %s", pet_name, reminder_name, due_date)

    async def publish_state(self, pet_id: str, topic_suffix: str, value: str) -> None:
        """Publish a state update to a pet's topic."""
        if not self._connected or not self._client:
            return
        self._client.publish(f"sakapuss/{pet_id}/{topic_suffix}", value, retain=True)

    def _on_connect(self, client: Any, flags: Any, rc: Any, properties: Any) -> None:
        logger.info("MQTT connected, rc=%s", rc)

    def _on_message(self, client: Any, topic: str, payload: bytes, qos: int, properties: Any) -> int:
        """Handle incoming MQTT commands for bidirectional validation."""
        logger.info("MQTT message received: topic=%s payload=%s", topic, payload.decode())
        # Store the callback handler for processing
        if self._message_handler:
            asyncio.get_event_loop().create_task(self._message_handler(topic, json.loads(payload.decode())))
        return 0

    def _on_disconnect(self, client: Any, packet: Any, exc: Any = None) -> None:
        self._connected = False
        logger.info("MQTT disconnected")

    _message_handler: Any = None

    def set_message_handler(self, handler: Any) -> None:
        """Set a callback for incoming MQTT messages."""
        self._message_handler = handler

    def health_status(self) -> dict:
        """Return MQTT health status."""
        return {
            "enabled": self._enabled,
            "connected": self._connected,
            "discovery_published": self._discovery_published,
        }


# Singleton instance
mqtt_bridge = MqttBridge()
