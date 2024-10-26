import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ClaimRequest.db')

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blobData = file.read()
    return blobData

def insertclaim(ItemID, Comments, Photo, UserEmail):
    sqliteConnection = None
    try:
        sqliteConnection = sqlite3.connect(USERS_DB)
        cursor = sqliteConnection.cursor()
        
        # Ensure the table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS CLAIMREQUETS
         (ItemID            INTEGER NOT NULL,
         Comments           TEXT    NOT NULL,
         PhotoProof         BLOB,
         UserEmail          TEXT    NOT NULL);''')
        
        print("Table created successfully")
        
        sqlite_insert_query = """ INSERT INTO CLAIMREQUETS
                                  (ItemID, Comments, PhotoProof, UserEmail) 
                                  VALUES (?, ?, ?, ?)"""
        binaryPhoto = convertToBinaryData(Photo)
        # Convert data into tuple format
        data_tuple = (ItemID, Comments, binaryPhoto, UserEmail)
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
