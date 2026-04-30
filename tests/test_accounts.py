"""Tests for /accounts/* endpoints."""
import pytest

_REG = {"full_name": "Bob Tester", "email": "bob@test.bank", "password": "Pass1234!"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _register_and_login(client):
    client.post("/auth/register", json=_REG)
    login = client.post(
        "/auth/login",
        data={"username": _REG["email"], "password": _REG["password"]},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _accounts(client, headers):
    return client.get("/accounts", headers=headers).json()


# ── Accounts list ─────────────────────────────────────────────────────────────

def test_register_creates_checking_and_savings(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    types = {a["account_type"] for a in accs}
    assert len(accs) == 2
    assert "CHECKING" in types
    assert "SAVINGS" in types


def test_list_accounts_requires_auth(client):
    r = client.get("/accounts")
    assert r.status_code == 401


# ── Deposit ───────────────────────────────────────────────────────────────────

def test_deposit_increases_balance(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")

    r = client.post(
        "/accounts/deposit",
        json={"account_id": checking["id"], "amount": "500.00"},
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["new_balance"] == 500.0


def test_deposit_zero_rejected(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")

    r = client.post(
        "/accounts/deposit",
        json={"account_id": checking["id"], "amount": "0"},
        headers=headers,
    )
    assert r.status_code == 400


# ── Withdraw ──────────────────────────────────────────────────────────────────

def test_withdraw_decreases_balance(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")
    acc_id = checking["id"]

    client.post(
        "/accounts/deposit",
        json={"account_id": acc_id, "amount": "300.00"},
        headers=headers,
    )
    r = client.post(
        "/accounts/withdraw",
        json={"account_id": acc_id, "amount": "100.00"},
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["new_balance"] == 200.0


def test_withdraw_insufficient_funds(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")

    r = client.post(
        "/accounts/withdraw",
        json={"account_id": checking["id"], "amount": "9999.00"},
        headers=headers,
    )
    assert r.status_code == 400
    assert "insufficient" in r.json()["detail"].lower()


# ── Transfer ──────────────────────────────────────────────────────────────────

def test_transfer_between_own_accounts(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")
    savings = next(a for a in accs if a["account_type"] == "SAVINGS")

    client.post(
        "/accounts/deposit",
        json={"account_id": checking["id"], "amount": "500.00"},
        headers=headers,
    )
    r = client.post(
        "/accounts/transfer",
        json={
            "sender_account_id": checking["id"],
            "receiver_account_id": savings["id"],
            "amount": "200.00",
        },
        headers=headers,
    )
    assert r.status_code == 200

    accs_after = _accounts(client, headers)
    chk = next(a for a in accs_after if a["id"] == checking["id"])
    sav = next(a for a in accs_after if a["id"] == savings["id"])
    assert float(chk["balance"]) == 300.0
    assert float(sav["balance"]) == 200.0


def test_transfer_insufficient_funds(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")
    savings = next(a for a in accs if a["account_type"] == "SAVINGS")

    r = client.post(
        "/accounts/transfer",
        json={
            "sender_account_id": checking["id"],
            "receiver_account_id": savings["id"],
            "amount": "500.00",
        },
        headers=headers,
    )
    assert r.status_code == 400


# ── Open account ──────────────────────────────────────────────────────────────

def test_open_additional_account(client):
    headers = _register_and_login(client)
    r = client.post(
        "/accounts/open",
        json={"account_type": "MONEY_MARKET"},
        headers=headers,
    )
    assert r.status_code == 201
    assert r.json()["account_type"] == "MONEY_MARKET"

    accs = _accounts(client, headers)
    assert len(accs) == 3


def test_open_account_invalid_type(client):
    headers = _register_and_login(client)
    r = client.post(
        "/accounts/open",
        json={"account_type": "INVALID_TYPE"},
        headers=headers,
    )
    assert r.status_code == 422


# ── Transactions ──────────────────────────────────────────────────────────────

def test_all_transactions_empty_initially(client):
    headers = _register_and_login(client)
    r = client.get("/accounts/transactions", headers=headers)
    assert r.status_code == 200
    assert r.json() == []


def test_transactions_appear_after_deposit(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")

    client.post(
        "/accounts/deposit",
        json={"account_id": checking["id"], "amount": "250.00", "description": "Paycheck"},
        headers=headers,
    )
    txs = client.get("/accounts/transactions", headers=headers).json()
    assert len(txs) == 1
    assert txs[0]["type"] == "DEPOSIT"


def test_transaction_type_filter(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")
    acc_id = checking["id"]

    client.post("/accounts/deposit", json={"account_id": acc_id, "amount": "400.00"}, headers=headers)
    client.post("/accounts/withdraw", json={"account_id": acc_id, "amount": "50.00"}, headers=headers)

    deposits = client.get("/accounts/transactions?tx_type=DEPOSIT", headers=headers).json()
    assert all(t["type"] == "DEPOSIT" for t in deposits)
    assert len(deposits) == 1

    withdrawals = client.get("/accounts/transactions?tx_type=WITHDRAWAL", headers=headers).json()
    assert all(t["type"] == "WITHDRAWAL" for t in withdrawals)
    assert len(withdrawals) == 1


def test_transaction_description_search(client):
    headers = _register_and_login(client)
    accs = _accounts(client, headers)
    checking = next(a for a in accs if a["account_type"] == "CHECKING")
    acc_id = checking["id"]

    client.post(
        "/accounts/deposit",
        json={"account_id": acc_id, "amount": "100.00", "description": "Monthly Salary"},
        headers=headers,
    )
    client.post(
        "/accounts/withdraw",
        json={"account_id": acc_id, "amount": "20.00", "description": "Grocery Store"},
        headers=headers,
    )

    r = client.get("/accounts/transactions?q=salary", headers=headers)
    txs = r.json()
    assert len(txs) == 1
    assert "Salary" in txs[0]["description"]
