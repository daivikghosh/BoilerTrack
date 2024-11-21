# File: flask-server/AddFoundItemPic.py

import os
import sqlite3

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')

# Existing imports and functions...

def convert_to_binary(filename):
    with open(filename, 'rb') as file:
        blob_data = file.read()
    return blob_data

def insertItem(item_name, color, brand, location_found, location_turned_in, description, photo, item_status, date):
    connection = None
    try:
        connection = sqlite3.connect(USERS_DB)
        cursor = connection.cursor()

        # Ensure the FOUNDITEMS table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS FOUNDITEMS
         (ItemID            INTEGER PRIMARY KEY,
         ItemName           TEXT    NOT NULL,
         Color              TEXT,
         Brand              TEXT,
         LocationFound      TEXT,
         LocationTurnedIn   TEXT,
         Description        TEXT,
         Photo              BLOB,
         ItemStatus         INTEGER,
         Date               TEXT,
         Archived           INTEGER DEFAULT 0);''')

        print("FOUNDITEMS table ensured to exist")

        sqlite_insert_query = """ INSERT INTO FOUNDITEMS
                                  (ItemName, Color, Brand, LocationFound, LocationTurnedIn, Description, Photo, Archived, ItemStatus, Date) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)"""
        photo_bin = convert_to_binary(photo)
        # Convert data into tuple format
        data_tuple = (item_name, color, brand, location_found,
                      location_turned_in, description, photo_bin, item_status, date)
        cursor.execute(sqlite_insert_query, data_tuple)
        connection.commit()
        new_item_id = cursor.lastrowid
        print("Item inserted into FOUNDITEMS successfully")

        # Parse category from description
        category = description.split(',')[0].strip()

        # Update CATEGORIES table
        cursor.execute('''CREATE TABLE IF NOT EXISTS CATEGORIES (
                            CategoryName TEXT PRIMARY KEY,
                            ItemCount INTEGER NOT NULL DEFAULT 0
                          );''')

        cursor.execute("SELECT ItemCount FROM CATEGORIES WHERE CategoryName = ?", (category,))
        result = cursor.fetchone()
        if result:
            cursor.execute("UPDATE CATEGORIES SET ItemCount = ItemCount + 1 WHERE CategoryName = ?", (category,))
            print(f"Incremented ItemCount for category '{category}'")
        else:
            cursor.execute("INSERT INTO CATEGORIES (CategoryName, ItemCount) VALUES (?, ?)", (category, 1))
            print(f"Inserted new category '{category}' with ItemCount = 1")

        connection.commit()
        return new_item_id

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if connection:
            connection.close()
            print("The sqlite connection is closed")