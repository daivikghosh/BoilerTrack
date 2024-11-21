import os
import sqlite3

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')

if __name__ == "__main__":
    # modify item status in FOUNDITEMS table
    try:

        conn = sqlite3.connect(USERS_DB)
        cursor = conn.cursor()
        # Create SQL UPDATE statement
        SQL_UPDATE_QUERY = "UPDATE FOUNDITEMS SET ItemStatus = 3 WHERE ItemID = 2"
        # Execute the query
        cursor.execute(SQL_UPDATE_QUERY)
        # Commit the changes to the database
        conn.commit()
        # Get the number of rows updated
        rows_updated = cursor.rowcount
        print(f"{rows_updated} rows were updated in the FOUNDITEMS table.")
    except sqlite3.Error as error:
        print(f"Error while working with SQLite: {error}")
    finally:
        if conn:
            conn.close()
