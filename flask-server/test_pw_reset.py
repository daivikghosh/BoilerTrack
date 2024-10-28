import pytest
from app import app, create_connection_users, password_reset
from flask import json, Flask, request
from unittest.mock import patch, MagicMock


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_password_reset_success(client):
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = (
        'user_id', 'user_name', 'old_password', 'email', 0)

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 200
    assert response.json == {'success': 'Password reset successfully'}
    mock_cursor.execute.assert_called_with(
        'UPDATE UserListing SET password = ? WHERE Email = ?', ('new_password', 'email'))
    mock_conn.commit.assert_called_once()


def test_password_reset_user_not_found(client):
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = None

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 404
    assert response.json == {'error': 'User Not Found'}


def test_password_reset_incorrect_password(client):
    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = (
        'user_id', 'user_name', 'wrong_password', 'email', 0)

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 401
    assert response.json == {'error': 'Incorrect Password'}


def test_password_reset_no_email(client):
    mock_conn = MagicMock()

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    # Assuming this should be a bad request, since email is missing
    assert response.status_code == 400
