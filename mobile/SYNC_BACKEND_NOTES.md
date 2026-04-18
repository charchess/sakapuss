# Backend Sync Requirements for Mobile

This document describes what the Sakapuss FastAPI backend needs to support in order to fully enable mobile sync.

---

## 1. Batch Event Push

**Endpoint:** `POST /sync/push`

Accept an array of events with a `local_id` field so the mobile client can reconcile local records with server-assigned IDs.

**Request body:**
```json
{
  "events": [
    {
      "local_id": "local_1713437622_x7f3a",
      "pet_id": "uuid",
      "type": "weight",
      "payload": { "grams": 4250 },
      "occurred_at": "2026-04-18T08:30:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "synced": [
    { "local_id": "local_1713437622_x7f3a", "server_id": "uuid-from-db" }
  ],
  "errors": []
}
```

Batch size limit: up to **50 events per request**. Return 207 Multi-Status if some events succeed and others fail.

---

## 2. Delta Pull

**Endpoint:** `GET /sync/pull?since=<ISO8601>`

Return all events created or updated for the authenticated user's household since the given timestamp. Used on app launch to catch up on changes made from the web app or other devices.

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "pet_id": "uuid",
      "pet_name": "Mochi",
      "type": "weight",
      "payload": { "grams": 4250 },
      "occurred_at": "2026-04-18T08:30:00.000Z",
      "created_at": "2026-04-18T08:30:05.000Z",
      "updated_at": "2026-04-18T08:30:05.000Z"
    }
  ],
  "pulled_at": "2026-04-18T09:00:00.000Z"
}
```

The mobile client should persist `pulled_at` and use it as the `since` value for the next pull.

---

## 3. Device Registration (Push Notifications)

**Endpoint:** `POST /devices`

Register a device FCM token for push notification delivery (reminders, household alerts).

**Request body:**
```json
{
  "fcm_token": "APA91bH...",
  "platform": "android",
  "app_version": "1.0.0"
}
```

**Response:** `201 Created` with `{ "device_id": "uuid" }`

Also implement:
- `DELETE /devices/{device_id}` — called on logout to stop notifications on that device.

---

## 4. Conflict Strategy

- **Last-write-wins** based on `occurred_at` timestamp.
- The server assigns the canonical `id`; mobile `local_id` is only used for client-side reconciliation.
- If two events have the same `pet_id + type + occurred_at` (within a 1-second window), treat as duplicate and return the existing server record's ID mapped to the provided `local_id`.

---

## 5. Authentication

No changes needed. The mobile app uses the **same JWT token** issued by `POST /auth/login`. The token is stored in AsyncStorage and sent as `Authorization: Bearer <token>` on every request.

Token expiry handling: when the API returns `401`, the mobile app should redirect to LoginScreen and clear AsyncStorage.

---

## 6. Rate Limiting

Mobile clients may batch up to **50 events per push request**. Recommended server-side rate limits:
- `POST /sync/push`: 10 req/min per user
- `GET /sync/pull`: 30 req/min per user
- `POST /events` (single): 60 req/min per user (used as fallback by current PoC)

---

## 7. Current PoC Behaviour

The current mobile PoC (v1.0.0) does **not** use `/sync/push` or `/sync/pull` — it falls back to `POST /pets/{id}/events` individually per queued event. Implement the batch endpoints to unlock efficient sync for production.
