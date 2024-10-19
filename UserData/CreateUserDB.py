import sqlite3
import os

def create_user_database():
    # Get the absolute path to the databases directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/Accounts.db')

    # Ensure the databases directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('DROP TABLE IF EXISTS UserListing')  # Delete the table if it already exists to recreate it

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserListing 
        (
            UserID      INTEGER PRIMARY KEY AUTOINCREMENT,
            Email       TEXT    NOT NULL    UNIQUE,
            Password    TEXT    NOT NULL,
            Name        TEXT    NOT NULL,
            isStudent   INTEGER,
            isStaff     INTEGER,
            isDeleted   INTEGER DEFAULT 0
        )
    ''')

    print("Table created successfully")
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_user_database()