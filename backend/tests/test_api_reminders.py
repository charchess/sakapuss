"""Integration tests for reminder endpoints."""


class TestReminderEndpoints:
    def test_create_reminder_requires_auth(self, client, test_pet):
        """POST /pets/{id}/reminders without auth should return 401."""
        pet_id = test_pet["id"]
        resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Flea", "frequency_days": 30},
        )
        assert resp.status_code == 401

    def test_create_reminder_with_auth(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Flea treatment", "frequency_days": 30, "type": "health"},
            headers=auth_header,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Flea treatment"
        assert data["frequency_days"] == 30
        assert data["pet_id"] == pet_id
        assert "id" in data

    def test_complete_reminder(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        create_resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Deworming", "frequency_days": 90},
            headers=auth_header,
        )
        assert create_resp.status_code == 201
        reminder_id = create_resp.json()["id"]

        resp = client.post(f"/reminders/{reminder_id}/complete", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert data["last_done_date"] is not None

    def test_postpone_reminder(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        create_resp = client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "Vet visit", "frequency_days": 365},
            headers=auth_header,
        )
        assert create_resp.status_code == 201
        reminder_id = create_resp.json()["id"]
        original_due = create_resp.json()["next_due_date"]

        resp = client.post(
            f"/reminders/{reminder_id}/postpone",
            json={"delay_days": 14},
            headers=auth_header,
        )
        assert resp.status_code == 200
        from datetime import date, timedelta

        expected = date.fromisoformat(original_due) + timedelta(days=14)
        assert resp.json()["next_due_date"] == expected.isoformat()

    def test_list_pending_reminders(self, client, auth_header, test_pet):
        pet_id = test_pet["id"]
        # Create two reminders
        client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "R1", "frequency_days": 30},
            headers=auth_header,
        )
        client.post(
            f"/pets/{pet_id}/reminders",
            json={"name": "R2", "frequency_days": 60},
            headers=auth_header,
        )

        resp = client.get("/reminders/pending")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 2
