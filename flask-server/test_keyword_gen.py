import os
import sqlite3
import pytest
from unittest.mock import patch
from PIL import Image
from hashlib import sha512


from keyword_gen import image_keywords, KEYWORD_CACHE

# Create a test image for the purpose of testing


def create_test_image(image_path):
    image = Image.new('RGB', (100, 100))
    image.save(image_path)

# Setup and teardown for test database


@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Create a test image
    test_image_path = 'test_image.jpg'
    create_test_image(test_image_path)

    # Connect to the keyword cache DB and create a table
    conn = sqlite3.connect(KEYWORD_CACHE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS images 
                      ('image-name' TEXT, 'hash' TEXT, 'gapi-response-labels' TEXT, 'gapi-response-logos' TEXT)''')
    conn.commit()
    conn.close()

    yield

    # Clean up the test image
    if os.path.exists(test_image_path):
        os.remove(test_image_path)

    # Clear the keyword cache DB
    conn = sqlite3.connect(KEYWORD_CACHE)
    cursor = conn.cursor()
    cursor.execute('''DELETE FROM images''')
    conn.commit()
    conn.close()


def test_file_not_found():
    result = image_keywords(image_path='nonexistent.jpg')
    assert result == "File not found or invalid path."


@patch('keyword_gen.detect_labels')
@patch('keyword_gen.detect_logos')
def test_image_processing(mock_detect_labels, mock_detect_logos):
    mock_detect_labels.return_value = [
        {'description': 'label1'}, {'description': 'label2'}]
    mock_detect_logos.return_value = [
        {'description': 'logo1'}, {'description': 'logo2'}]

    test_image_path = 'test_image.jpg'
    result = image_keywords(image_path=test_image_path)

    keywords = [{'description': 'label1'}, {'description': 'label2'}]
    logos = [{'description': 'logo1'}, {'description': 'logo2'}]
    assert result == (logos, keywords, 0)

# Test case: Fetch data from cache


def test_cache_hit():
    test_image_path = 'test_image.jpg'

    # Insert test data into the cache
    conn = sqlite3.connect(KEYWORD_CACHE)
    cursor = conn.cursor()
    with open(test_image_path, "rb") as image_file:
        content = image_file.read()
    im_hash = sha512(content).hexdigest()

    cursor.execute(
        '''INSERT INTO images ('image-name', 'hash', 'gapi-response-labels', 'gapi-response-logos') VALUES (?,?,?,?)''',
        (os.path.basename(test_image_path),
         im_hash, "label1, label2", "logo1, logo2")
    )
    conn.commit()
    conn.close()

    result = image_keywords(image_path=test_image_path)
    keywords = "label1, label2"
    logos = "logo1, logo2"
    assert result == (keywords, logos, 1)

# Test case: Error handling in Google API calls


@patch('keyword_gen.detect_labels', side_effect=Exception("API error"))
def test_api_error(mock_detect_labels):
    test_image_path = 'test_image.jpg'
    result = image_keywords(image_path=test_image_path)
    assert result == ("", "", 2)
