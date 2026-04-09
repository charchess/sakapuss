"""Unit tests for the anomaly detection service."""

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

from backend.app.services.anomaly import detect_weight_anomalies


def _make_weight_event(value: float, days_ago: int) -> MagicMock:
    """Create a mock Event with weight payload."""
    event = MagicMock()
    event.pet_id = "pet-1"
    event.type = "weight"
    event.occurred_at = datetime.now(UTC) - timedelta(days=days_ago)
    event.payload = {"value": value}
    return event


def _mock_db_with_events(events: list) -> MagicMock:
    """Return a mock db session whose query chain returns the given events."""
    db = MagicMock()
    query = db.query.return_value
    filtered = query.filter.return_value
    filtered2 = filtered.filter.return_value
    ordered = filtered2.filter.return_value.order_by.return_value
    # Chain through all three filter calls then order_by
    ordered.all.return_value = events

    # The actual code chains: db.query(Event).filter(...).filter(...).filter(...).order_by(...).all()
    # But sqlalchemy chaining is: query.filter().filter().filter().order_by().all()
    # We need to handle the varying chain. Let's use a simpler approach:
    # Mock the query chain so any .filter() returns itself, then .order_by() returns itself
    chain = MagicMock()
    chain.filter.return_value = chain
    chain.order_by.return_value = chain
    chain.all.return_value = events
    db.query.return_value = chain
    return db


def test_no_anomaly_with_fewer_than_3_weights():
    events = [_make_weight_event(5.0, 10), _make_weight_event(4.9, 5)]
    db = _mock_db_with_events(events)
    result = detect_weight_anomalies(db, "pet-1")
    assert result == []


def test_no_anomaly_with_stable_weight():
    events = [
        _make_weight_event(5.0, 20),
        _make_weight_event(5.0, 10),
        _make_weight_event(5.0, 1),
    ]
    db = _mock_db_with_events(events)
    result = detect_weight_anomalies(db, "pet-1")
    assert result == []


def test_detects_anomaly_on_5pct_decline():
    """A decline of exactly > 5% should trigger an anomaly."""
    # 10.0 -> 9.4 = -6% decline
    events = [
        _make_weight_event(10.0, 20),
        _make_weight_event(9.7, 10),
        _make_weight_event(9.4, 1),
    ]
    db = _mock_db_with_events(events)
    result = detect_weight_anomalies(db, "pet-1")
    assert len(result) == 1
    assert result[0]["type"] == "weight_decline"


def test_no_anomaly_on_4pct_decline():
    """A 4% decline should NOT trigger an anomaly (threshold is > 5%)."""
    # 10.0 -> 9.6 = -4% decline
    events = [
        _make_weight_event(10.0, 20),
        _make_weight_event(9.8, 10),
        _make_weight_event(9.6, 1),
    ]
    db = _mock_db_with_events(events)
    result = detect_weight_anomalies(db, "pet-1")
    assert result == []


def test_anomaly_includes_correct_details():
    """Verify the anomaly dict contains the expected fields and values."""
    # 10.0 -> 9.0 = -10% decline
    events = [
        _make_weight_event(10.0, 20),
        _make_weight_event(9.5, 10),
        _make_weight_event(9.0, 1),
    ]
    db = _mock_db_with_events(events)
    result = detect_weight_anomalies(db, "pet-1")
    assert len(result) == 1

    anomaly = result[0]
    assert anomaly["pet_id"] == "pet-1"
    assert anomaly["type"] == "weight_decline"
    assert anomaly["severity"] == "warning"
    assert anomaly["dismissed"] is False
    assert "details" in anomaly

    details = anomaly["details"]
    assert details["start_weight"] == 10.0
    assert details["end_weight"] == 9.0
    assert details["decline_percent"] == 10.0
    assert details["change_amount"] == -1.0
