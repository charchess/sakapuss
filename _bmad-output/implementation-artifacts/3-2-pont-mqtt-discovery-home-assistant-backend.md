# Story 3.2: Pont MQTT & Discovery Home Assistant (Backend)

## Status: done

## Implemented

- MQTT Bridge module at `backend/app/core/mqtt/bridge.py`
- gmqtt async client with HA Discovery payload publishing
- Graceful degradation when no broker configured
- Health endpoint `/health/mqtt` reporting status
- 3/3 ATDD tests GREEN
