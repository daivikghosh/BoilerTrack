import sqlite3
import os

def alter_accounts_table():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'Accounts.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if Pronouns column already exists
        cursor.execute("PRAGMA table_info(UserListing)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'Pronouns' not in columns:
            cursor.execute("ALTER TABLE UserListing ADD COLUMN Pronouns TEXT")
            print("Added 'Pronouns' column to UserListing table")
        else:
            print("'Pronouns' column already exists")
        
        conn.commit()
        print("Database alteration completed successfully")
        
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:
            conn.close()

def verify_table_structure():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'Accounts.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(UserListing)")
        columns = cursor.fetchall()
        
        print("\nUserListing table structure:")
        for column in columns:
            print(f"Column: {column[1]}, Type: {column[2]}")
    
    except sqlite3.Error as e:
        print(f"An error occurred while verifying: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    alter_accounts_table()
    verify_table_structure()