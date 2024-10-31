"""
This module contains unit tests for the password reset functionality in the app.
It tests the successful password reset, user not found, incorrect password, 
and missing email scenarios.
"""

from unittest.mock import patch, MagicMock
import pytest
from app import app


@pytest.fixture
def client():
    """
    Fixture to provide a test client for the app.
    """
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_password_reset_success(client):
    """
    Test case for successful password reset.
    """

    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = (
        'user_id', 'user_name', 'old_password', 'email@example.com', 0)

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email@example.com',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 200
    assert response.json == {'success': 'Password reset successfully'}
    mock_cursor.execute.assert_called_with(
        'UPDATE UserListing SET password = ? WHERE Email = ?', ('new_password', 'email@example.com'))
    mock_conn.commit.assert_called_once()


def test_password_reset_user_not_found(client):
    """
    Test case for password reset when the user is not found.
    """

    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = None

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email@example.com',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 404
    assert response.json == {'error': 'User Not Found'}


def test_password_reset_incorrect_password(client):
    """
    Test case for password reset when the old password is incorrect.
    """

    mock_conn = MagicMock()
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = (
        'user_id', 'user_name', 'wrong_password', 'email@example.com', 0)

    # Patch the create_connection_users function to return the mock connection
    with patch('app.create_connection_users', return_value=mock_conn):
        response = client.post('/reset_password', json={
            'email': 'email@example.com',
            'oldPassword': 'old_password',
            'newPassword': 'new_password'
        })

    assert response.status_code == 401
    assert response.json == {'error': 'Incorrect Password'}
