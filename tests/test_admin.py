def _admin_login_headers(client):
    r = client.post(
        '/auth/login',
        data={'username': 'admin@potbnk.app', 'password': 'AdminTest#2026'},
    )
    assert r.status_code == 200
    token = r.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_admin_can_credit_user_checking(client):
    reg = {
        'full_name': 'Credit Target',
        'email': 'credit-target@test.bank',
        'password': 'Secure1234!',
    }
    client.post('/auth/register', json=reg)

    headers = _admin_login_headers(client)
    r = client.post(
        '/admin/credit',
        headers=headers,
        json={
            'user_email': reg['email'],
            'account_type': 'CHECKING',
            'amount': 150.75,
            'description': 'Comp adjustment',
        },
    )

    assert r.status_code == 200
    body = r.json()
    assert body['status'] == 'success'
    assert body['credited_amount'] == 150.75
    assert body['account_type'] == 'CHECKING'


def test_non_admin_cannot_credit_user_account(client):
    reg = {
        'full_name': 'Regular User',
        'email': 'regular-user@test.bank',
        'password': 'Secure1234!',
    }
    client.post('/auth/register', json=reg)

    login = client.post('/auth/login', data={'username': reg['email'], 'password': reg['password']})
    token = login.json()['access_token']

    r = client.post(
        '/admin/credit',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'user_email': reg['email'],
            'account_type': 'CHECKING',
            'amount': 25,
        },
    )
    assert r.status_code == 403
