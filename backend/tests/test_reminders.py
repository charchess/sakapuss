"""Unit tests for reminder business logic (compute_status, create, complete, postpone)."""

from datetime import UTC, date, datetime, timedelta

from backend.app.api.reminders import compute_status


class _FakeReminder:
    """Lightweight stand-in for Reminder that avoids SQLAlchemy instrumentation."""

    def __init__(self, **kwargs):
        defaults = {
            "id": "rem-1",
            "pet_id": "pet-1",
            "type": "health",
            "name": "Flea treatment",
            "next_due_date": datetime.now(UTC),
            "frequency_days": 30,
            "product": None,
            "last_done_date": None,
        }
        defaults.update(kwargs)
        for k, v in defaults.items():
            setattr(self, k, v)


def _make_reminder(**kwargs):
    return _FakeReminder(**kwargs)


class TestComputeStatus:
    def test_compute_status_today(self):
        r = _make_reminder(next_due_date=date.today())
        assert compute_status(r) == "today"

    def test_compute_status_overdue(self):
        r = _make_reminder(next_due_date=date.today() - timedelta(days=3))
        assert compute_status(r) == "overdue"

    def test_compute_status_upcoming(self):
        r = _make_reminder(next_due_date=date.today() + timedelta(days=5))
        assert compute_status(r) == "upcoming"


class TestCreateReminderCalculatesNextDue:
    def test_create_reminder_calculates_next_due(self, client, auth_header, test_pet):
        """POST /pets/{id}/reminders without next_due_date should default to today + frequency_days."""
        pet_id = test_pet["id"]
        resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Worming", "frequency_days": 90},
            headers=auth_header,
        )
        assert resp.status_code == 201
        data = resp.json()
        expected = (date.today() + timedelta(days=90)).isoformat()
        assert data["next_due_date"] == expected


class TestCompleteReminder:
    def test_complete_reminder_updates_last_done_and_next_due(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        # Create a reminder
        create_resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Vaccination", "frequency_days": 365},
            headers=auth_header,
        )
        assert create_resp.status_code == 201
        reminder_id = create_resp.json()["id"]

        # Complete it
        resp = client.post(f"/reminders/{reminder_id}/complete", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()

        assert data["last_done_date"] is not None
        # next_due_date should now be ~365 days from today
        new_due = date.fromisoformat(data["next_due_date"])
        assert new_due >= date.today() + timedelta(days=364)


class TestPostponeReminder:
    def test_postpone_reminder_adds_days(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        create_resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Checkup", "frequency_days": 180},
            headers=auth_header,
        )
        assert create_resp.status_code == 201
        reminder_id = create_resp.json()["id"]
        original_due = create_resp.json()["next_due_date"]

        resp = client.post(
            f"/reminders/{reminder_id}/postpone",
            json={"delay_days": 7},
            headers=auth_header,
        )
        assert resp.status_code == 200
        new_due = date.fromisoformat(resp.json()["next_due_date"])
        expected = date.fromisoformat(original_due) + timedelta(days=7)
        assert new_due == expected
