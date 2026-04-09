"""Integration tests for /pets endpoints."""


class TestPetsCRUD:
    def test_create_pet(self, client):
        resp = client.post(
            "/pets",
            json={"name": "Felix", "species": "Cat", "birth_date": "2021-03-10"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Felix"
        assert data["species"] == "Cat"
        assert data["birth_date"] == "2021-03-10"
        assert "id" in data

    def test_list_pets(self, client):
        client.post("/pets", json={"name": "A", "species": "Cat", "birth_date": "2020-01-01"})
        client.post("/pets", json={"name": "B", "species": "Dog", "birth_date": "2019-05-01"})
        resp = client.get("/pets")
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_get_pet(self, client, test_pet):
        pet_id = test_pet["id"]
        resp = client.get(f"/pets/{pet_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == pet_id
        assert resp.json()["name"] == "Minou"

    def test_update_pet(self, client, test_pet):
        pet_id = test_pet["id"]
        resp = client.put(
            f"/pets/{pet_id}",
            json={"name": "Minou Updated"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Minou Updated"

    def test_delete_pet(self, client, test_pet):
        pet_id = test_pet["id"]
        resp = client.delete(f"/pets/{pet_id}")
        assert resp.status_code == 204

        # Confirm it is gone
        resp2 = client.get(f"/pets/{pet_id}")
        assert resp2.status_code == 404

    def test_get_nonexistent_pet(self, client):
        resp = client.get("/pets/does-not-exist-id")
        assert resp.status_code == 404
