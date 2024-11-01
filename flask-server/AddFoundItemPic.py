import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')


def convert_to_binary(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blob_data = file.read()
    return blob_data


def insertItem(item_name, color, brand, location_found, location_turned_in, description, photo, item_status, date):
    connection = None
    try:
        connection = sqlite3.connect(USERS_DB)
        cursor = connection.cursor()

        # Ensure the table exists
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

        print("Table created successfully")

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
        print("Item inserted into db successfully")
        return new_item_id

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if connection:
            connection.close()
            print("The sqlite connection is closed")

# Uncomment these lines for testing
# if __name__ == "__main__":
#     insertItem("C", "Rainbow", "NA", "WALC", "HICKS", "Flag", "path/to/photo.jpg")
#     insertItem("B", "Blue", "Sony", "HICKS", "HICKS", "NAusdfkubfdvsguk, asrufyhkdfhg", "path/to/another/photo.jpg")
