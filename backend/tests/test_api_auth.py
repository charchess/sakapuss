"""Integration tests for /auth endpoints."""


class TestRegister:
    def test_register_success(self, client):
        resp = client.post(
            "/auth/register",
            json={
                "email": "new@example.com",
                "password": "Str0ngP@ss!",
                "display_name": "New User",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "new@example.com"
        assert data["user"]["display_name"] == "New User"

    def test_register_duplicate_email(self, client):
        payload = {
            "email": "dup@example.com",
            "password": "Str0ngP@ss!",
            "display_name": "First",
        }
        resp1 = client.post("/auth/register", json=payload)
        assert resp1.status_code == 201

        resp2 = client.post("/auth/register", json=payload)
        assert resp2.status_code == 409

    def test_register_weak_password(self, client):
        """Password shorter than 8 chars should be rejected by Pydantic validation."""
        resp = client.post(
            "/auth/register",
            json={"email": "weak@example.com", "password": "short"},
        )
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        # Register first
        client.post(
            "/auth/register",
            json={"email": "login@example.com", "password": "Str0ngP@ss!"},
        )
        resp = client.post(
            "/auth/login",
            json={"email": "login@example.com", "password": "Str0ngP@ss!"},
        )
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client):
        client.post(
            "/auth/register",
            json={"email": "wrong@example.com", "password": "Str0ngP@ss!"},
        )
        resp = client.post(
            "/auth/login",
            json={"email": "wrong@example.com", "password": "badpassword"},
        )
        assert resp.status_code == 401


class TestMe:
    def test_get_me_with_token(self, client, auth_header):
        resp = client.get("/auth/me", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "test@example.com"
        assert data["display_name"] == "Test User"

    def test_get_me_without_token(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_patch_me_update_name(self, client, auth_header):
        resp = client.patch(
            "/auth/me",
            json={"display_name": "Updated Name"},
            headers=auth_header,
        )
        assert resp.status_code == 200
        assert resp.json()["display_name"] == "Updated Name"
