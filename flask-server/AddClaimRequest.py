import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ClaimRequest.db')


def convert_to_binary(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blob_data = file.read()
    return blob_data


def insertclaim(item_id, comments, photo, user_email, claim_status):
    connection = None
    try:
        connection = sqlite3.connect(USERS_DB)
        cursor = connection.cursor()

        # Ensure the table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS CLAIMREQUETS
         (ItemID            INTEGER NOT NULL,
         Comments           TEXT,
         PhotoProof         BLOB,
         UserEmail          TEXT,
         ClaimStatus        INTEGER NOT NULL);''')

        print("Table created successfully")

        sqlite_insert_query = """ INSERT INTO CLAIMREQUETS
                                  (ItemID, Comments, PhotoProof, UserEmail, ClaimStatus) 
                                  VALUES (?, ?, ?, ?, ?)"""
        photo_bin = convert_to_binary(photo)
        # Convert data into tuple format
        data_tuple = (item_id, comments, photo_bin, user_email, claim_status)
        cursor.execute(sqlite_insert_query, data_tuple)
        connection.commit()
        print("Item inserted into db successfully")

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if connection:
            connection.close()
            print("The sqlite connection is closed")
