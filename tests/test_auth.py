"""Tests for /auth/* endpoints."""

_REG = {
    "full_name": "Alice Test",
    "email": "alice@test.bank",
    "password": "Secure1234!",
}


# ── Registration ──────────────────────────────────────────────────────────────

def test_register_success(client):
    r = client.post("/auth/register", json=_REG)
    assert r.status_code == 201
    data = r.json()
    assert "user_id" in data
    assert data["status"] == "success"


def test_register_duplicate_email(client):
    client.post("/auth/register", json=_REG)
    r = client.post("/auth/register", json=_REG)
    assert r.status_code == 400
    assert "already exists" in r.json()["detail"].lower()


def test_register_invalid_email(client):
    bad = {**_REG, "email": "not-an-email"}
    r = client.post("/auth/register", json=bad)
    assert r.status_code == 422


# ── Login ─────────────────────────────────────────────────────────────────────

def test_login_returns_token(client):
    client.post("/auth/register", json=_REG)
    r = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": _REG["password"]},
    )
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/auth/register", json=_REG)
    r = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": "WrongPass99!"},
    )
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post(
        "/auth/login",
        data={"username": "nobody@example.com", "password": "anything"},
    )
    assert r.status_code == 401


# ── Profile ───────────────────────────────────────────────────────────────────

def test_profile_requires_auth(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_profile_returns_user(client):
    client.post("/auth/register", json=_REG)
    login = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": _REG["password"]},
    )
    token = login.json()["access_token"]
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == _REG["email"]


# ── Forgot / Reset password ───────────────────────────────────────────────────

def test_forgot_password_returns_reset_token(client):
    client.post("/auth/register", json=_REG)
    r = client.post("/auth/forgot-password", json={"email": _REG["email"]})
    assert r.status_code == 200
    body = r.json()
    assert body["reset_token"] is not None


def test_forgot_password_unknown_email_is_generic(client):
    """Must return 200 and no identifiable detail (no email enumeration)."""
    r = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})
    assert r.status_code == 200
    assert r.json()["reset_token"] is None


def test_reset_password_flow(client):
    client.post("/auth/register", json=_REG)
    fp = client.post("/auth/forgot-password", json={"email": _REG["email"]})
    token = fp.json()["reset_token"]

    r = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "NewPass5678!"},
    )
    assert r.status_code == 200

    # Old password must no longer work
    old = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": _REG["password"]},
    )
    assert old.status_code == 401

    # New password must work
    new = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": "NewPass5678!"},
    )
    assert new.status_code == 200


def test_reset_password_invalid_token(client):
    r = client.post(
        "/auth/reset-password",
        json={"token": "bogus-token", "new_password": "Whatever1!"},
    )
    assert r.status_code == 400


def test_reset_password_token_single_use(client):
    """After a successful reset, the same token must be rejected."""
    client.post("/auth/register", json=_REG)
    fp = client.post("/auth/forgot-password", json={"email": _REG["email"]})
    token = fp.json()["reset_token"]

    client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "FirstReset1!"},
    )
    r2 = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "SecondReset1!"},
    )
    assert r2.status_code == 400
