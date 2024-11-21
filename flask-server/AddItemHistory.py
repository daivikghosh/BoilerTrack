import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')

def inserthistory(item_id, user_email, change):
    connection = None
    try:
        connection = sqlite3.connect(USERS_DB)
        cursor = connection.cursor()

        # Ensure the table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS ITEMHISTORY
         (ItemID            INTEGER NOT NULL,
         UserEmail          TEXT,
         Change        TEXT);''')

        print("Table created successfully")

        sqlite_insert_query = """ INSERT INTO ITEMHISTORY
                                  (ItemID, UserEmail, Change) 
                                  VALUES (?, ?, ?)"""

        # Convert data into tuple format
        data_tuple = (item_id, user_email, change)
        cursor.execute(sqlite_insert_query, data_tuple)
        connection.commit()

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if connection:
            connection.close()
            print("The sqlite connection is closed")