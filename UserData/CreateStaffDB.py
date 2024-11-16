# CreateStaffDB.py

import sqlite3
import os

def create_staff_database():
    # Get the absolute path to the databases directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/StaffAccounts.db')

    # Ensure the databases directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop the StaffListing table if it exists
    cursor.execute('DROP TABLE IF EXISTS StaffListing')

    # Create the StaffListing table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS StaffListing 
        (
            StaffID     INTEGER PRIMARY KEY AUTOINCREMENT,
            Email       TEXT    NOT NULL    UNIQUE,
            Password    TEXT    NOT NULL,
            Name        TEXT    NOT NULL,
            Dept        TEXT    NOT NULL,
            isApproved  INTEGER DEFAULT 0
        )
    ''')

    # Commit changes and close the connection
    conn.commit()
    conn.close()

    print("Staff table created successfully")

if __name__ == '__main__':
    create_staff_database()