import sqlite3
import pytest
from flask import json
from app import app, insertItem


def get_item_by_name(item_name):
    """
    Helper function to retrieve an item from the database by ItemName.
    """
    conn = sqlite3.connect('databases/ItemListings.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM FOUNDITEMS WHERE ItemName = ?", (item_name,))
    item = cursor.fetchone()
    conn.close()
    return item


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_archive_item(client):
    """
    Test function to verify that an item can be archived correctly via the /item/archive/<int:item_id> endpoint.
    """
    # Insert a test item
    insertItem("TestItem", "Red", "TestBrand", "Library",
               "Lost and Found", "Test Description", "uploads/TestImage.png")
    item = get_item_by_name("TestItem")
    assert item is not None, "Item should exist in the database."
    item_id = item[0]

    # Send a POST request to archive the item
    response = client.post(f'/item/archive/{item_id}')
    assert response.status_code == 200, "Archiving the item should return status code 200."

    # Check if the item is archived in the database
    item = get_item_by_name("TestItem")
    assert item[-1] == 1, "Item should be archived (Archived = 1)."
    print(f"Test passed: {item[1]} has been archived successfully.")


def test_unarchive_item(client):
    """
    Test function to verify that an item can be unarchived correctly via the /item/unarchive/<int:item_id> endpoint.
    """
    # Retrieve the previously archived item
    item = get_item_by_name("TestItem")
    assert item is not None, "Item should exist in the database."
    item_id = item[0]

    # Send a POST request to unarchive the item
    response = client.post(f'/item/unarchive/{item_id}')
    assert response.status_code == 200, "Unarchiving the item should return status code 200."

    # Check if the item is unarchived in the database
    item = get_item_by_name("TestItem")
    assert item[-1] == 0, "Item should be unarchived (Archived = 0)."
    print(f"Test passed: {item[1]} has been unarchived successfully.")


if __name__ == "__main__":
    pytest.main(["-v"])
