# unit tests for viewing claim requests
import pytest
from unittest.mock import patch, MagicMock
from app import app  # Assuming your Flask app is named 'app'

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Helper function to create sample claim request data
def mock_claim_requests():
    return [
        (1, "Test Comment", b"\x89PNG\r\n\x1a\n", "user@example.com", 1),
    ]

def mock_found_items():
    return [
        (1, "Test Item", "Red", "BrandX", "Library", "Main Office", "Test Description", b"\x89PNG\r\n\x1a\n", 0, 1, "2023-01-01"),
    ]

# Test for successfully fetching claim requests
@patch('app.get_all_claim_requests')
@patch('app.get_found_items_by_ids')
def test_view_claim_requests_success(mock_get_found_items_by_ids, mock_get_all_claim_requests, client):
    mock_get_all_claim_requests.return_value = mock_claim_requests()
    mock_get_found_items_by_ids.return_value = mock_found_items()
    
    response = client.get('/claim-requests')
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert len(data) == 1
    assert data[0]['ItemID'] == 1
    assert data[0]['Comments'] == "Test Comment"
    assert data[0]['PhotoProof'] is not None
    assert data[0]['ItemName'] == "Test Item"
    assert data[0]['Color'] == "Red"
    assert data[0]['Brand'] == "BrandX"
    assert data[0]['LocationFound'] == "Library"
    assert data[0]['LocationTurnedIn'] == "Main Office"
    assert data[0]['Description'] == "Test Description"
    assert data[0]['Date'] == "2023-01-01"

# Test for handling an empty list of claim requests
@patch('app.get_all_claim_requests')
@patch('app.get_found_items_by_ids')
def test_view_claim_requests_empty(mock_get_found_items_by_ids, mock_get_all_claim_requests, client):
    mock_get_all_claim_requests.return_value = []
    mock_get_found_items_by_ids.return_value = []
    
    response = client.get('/claim-requests')
    
    assert response.status_code == 200
    data = response.get_json()
    assert data == []

# Test for handling a database error
@patch('app.get_all_claim_requests')
def test_view_claim_requests_db_error(mock_get_all_claim_requests, client):
    mock_get_all_claim_requests.side_effect = Exception("Database error")
    
    response = client.get('/claim-requests')
    
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == 'Failed to fetch claim requests due to server error.'

# Test for invalid item ID handling
@patch('app.get_all_claim_requests')
@patch('app.get_found_items_by_ids')
def test_view_claim_requests_missing_item(mock_get_found_items_by_ids, mock_get_all_claim_requests, client):
    mock_get_all_claim_requests.return_value = mock_claim_requests()
    mock_get_found_items_by_ids.return_value = []
    
    response = client.get('/claim-requests')
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert len(data) == 1
    assert data[0]['ItemName'] is None
    assert data[0]['error'] == "Item details not found for claim request."
