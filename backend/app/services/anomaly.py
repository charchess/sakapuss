"""Anomaly detection service — detects unusual patterns in pet health data."""

from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from backend.app.modules.health.models import Event


def detect_weight_anomalies(db: Session, pet_id: str) -> list[dict]:
    """Check for weight decline > 5% in recent weight entries (at least 3 entries)."""
    # Look back 30 days to capture broader trends
    lookback = datetime.now(UTC) - timedelta(days=30)

    weight_events = (
        db.query(Event)
        .filter(
            Event.pet_id == pet_id,
            Event.type == "weight",
            Event.occurred_at >= lookback,
        )
        .order_by(Event.occurred_at.asc())
        .all()
    )

    if len(weight_events) < 3:
        return []

    anomalies = []

    # Get earliest and latest weight values
    weights = []
    for event in weight_events:
        payload = event.payload or {}
        value = payload.get("value")
        if value is not None:
            weights.append((event.occurred_at, float(value)))

    if len(weights) < 3:
        return []

    start_weight = weights[0][1]
    end_weight = weights[-1][1]

    if start_weight > 0:
        change_pct = (end_weight - start_weight) / start_weight * 100

        if change_pct < -5:
            anomalies.append(
                {
                    "id": f"anomaly-{pet_id}-weight",
                    "pet_id": pet_id,
                    "type": "weight_decline",
                    "description": (
                        f"Weight declined {abs(end_weight - start_weight):.1f} kg ({abs(change_pct):.0f}%) recently"
                    ),
                    "severity": "warning",
                    "dismissed": False,
                    "detected_at": datetime.now(UTC).isoformat(),
                    "details": {
                        "start_weight": start_weight,
                        "end_weight": end_weight,
                        "decline_percent": round(abs(change_pct), 1),
                        "change_amount": round(end_weight - start_weight, 2),
                    },
                }
            )

    return anomalies
