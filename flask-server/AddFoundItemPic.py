import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE = os.path.join(base_dir, 'Databases', 'ItemListings.db')

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blobData = file.read()
    return blobData

def insertItem(ItemName, Color, Brand, LocationFound, LocationTurnedIn, Description, Photo, ItemStatus):
    sqliteConnection = None
    try:
        sqliteConnection = sqlite3.connect(DATABASE)
        cursor = sqliteConnection.cursor()
        
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
         Archived           INTEGER DEFAULT 0);''')
        
        print("Table created successfully")
        
        sqlite_insert_query = """ INSERT INTO FOUNDITEMS
                                  (ItemName, Color, Brand, LocationFound, LocationTurnedIn, Description, Photo, ItemStatus, Archived) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)"""
        binaryPhoto = convertToBinaryData(Photo)
        # Convert data into tuple format
        data_tuple = (ItemName, Color, Brand, LocationFound, LocationTurnedIn, Description, binaryPhoto, ItemStatus)
        cursor.execute(sqlite_insert_query, data_tuple)
        sqliteConnection.commit()
        print("Item inserted into db successfully")

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("The sqlite connection is closed")

# Uncomment these lines for testing
# if __name__ == "__main__":
#     insertItem("C", "Rainbow", "NA", "WALC", "HICKS", "Flag", "path/to/photo.jpg")
#     insertItem("B", "Blue", "Sony", "HICKS", "HICKS", "NAusdfkubfdvsguk, asrufyhkdfhg", "path/to/another/photo.jpg")