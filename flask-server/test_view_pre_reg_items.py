import pytest
from unittest.mock import patch, MagicMock
from app import app  # Ensure 'app' refers to the correct Flask app instance

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Helper function to create sample pre-registered item data
def mock_pre_registered_items():
    return [
        (1, "Sample Item", "Blue", "BrandY", "Test Description", b"\x89PNG\r\n\x1a\n", "2024-10-31", b"\x89PNG\r\n\x1a\n", "user@example.com"),
    ]

# Test for successfully fetching pre-registered items
@patch('app.get_all_pre_registered_items')
def test_view_pre_registered_items_success(mock_get_all_pre_registered_items, client):
    mock_get_all_pre_registered_items.return_value = mock_pre_registered_items()
    
    response = client.get('/pre-registered-items')
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert len(data) == 1
    assert data[0]['pre_reg_item_id'] == 1
    assert data[0]['ItemName'] == "Sample Item"
    assert data[0]['Color'] == "Blue"
    assert data[0]['Brand'] == "BrandY"
    assert data[0]['Description'] == "Test Description"
    assert data[0]['Photo'] is not None
    assert data[0]['Date'] == "2024-10-31"
    assert data[0]['QRCodeImage'] is not None
    assert data[0]['UserEmail'] == "user@purdue.edu"

# Test for handling an empty list of pre-registered items
@patch('app.get_all_pre_registered_items')
def test_view_pre_registered_items_empty(mock_get_all_pre_registered_items, client):
    mock_get_all_pre_registered_items.return_value = []
    
    response = client.get('/pre-registered-items')
    
    assert response.status_code == 200
    data = response.get_json()
    assert data == []

# Test for handling a database error
@patch('app.get_all_pre_registered_items')
def test_view_pre_registered_items_db_error(mock_get_all_pre_registered_items, client):
    mock_get_all_pre_registered_items.side_effect = Exception("Database error")
    
    response = client.get('/pre-registered-items')
    
    assert response.status_code == 500
    data = response.get_json()
    assert 'error' in data
    assert data['error'] == 'Failed to fetch pre-registered items due to server error.'

# Test for handling missing image or QR code data
@patch('app.get_all_pre_registered_items')
def test_view_pre_registered_items_missing_images(mock_get_all_pre_registered_items, client):
    mock_pre_registered_items_with_missing_images = [
        (1, "Sample Item", "Blue", "BrandY", "Test Description", None, "2024-10-31", None, "user@example.com"),
    ]
    mock_get_all_pre_registered_items.return_value = mock_pre_registered_items_with_missing_images
    
    response = client.get('/pre-registered-items')
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert len(data) == 1
    assert data[0]['pre_reg_item_id'] == 1
    assert data[0]['ItemName'] == "Sample Item"
    assert data[0]['Color'] == "Blue"
    assert data[0]['Brand'] == "BrandY"
    assert data[0]['Description'] == "Test Description"
    assert data[0]['Photo'] is not None  # Placeholder image should be used
    assert data[0]['QRCodeImage'] is not None  # Placeholder QR code should be used
    assert data[0]['UserEmail'] == "user@purdue.edu"
