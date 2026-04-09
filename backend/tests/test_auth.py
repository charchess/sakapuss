"""Unit tests for backend.app.core.auth — password hashing, JWT creation/decoding."""

from datetime import UTC, datetime, timedelta

from backend.app.core.auth import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_returns_bcrypt_hash():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)
    # bcrypt hashes start with $2b$ (or $2a$)
    assert hashed.startswith("$2")


def test_verify_password_correct():
    hashed = hash_password("correct-horse-battery")
    assert verify_password("correct-horse-battery", hashed) is True


def test_verify_password_incorrect():
    hashed = hash_password("correct-horse-battery")
    assert verify_password("wrong-password", hashed) is False


def test_create_access_token_returns_jwt_string():
    token = create_access_token("user-123")
    assert isinstance(token, str)
    # JWT has three dot-separated segments
    assert len(token.split(".")) == 3


def test_decode_token_valid():
    token = create_access_token("user-456")
    user_id = decode_token(token)
    assert user_id == "user-456"


def test_decode_token_expired():
    """A token whose expiry is in the past should return None."""
    from jose import jwt

    from backend.app.core.config import settings

    past = datetime.now(UTC) - timedelta(seconds=10)
    payload = {"sub": "user-expired", "exp": past}
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    assert decode_token(token) is None


def test_decode_token_invalid_string():
    assert decode_token("not.a.valid.jwt") is None
    assert decode_token("garbage") is None
    assert decode_token("") is None
