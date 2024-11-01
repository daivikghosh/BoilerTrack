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

def create_categories_table():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'ItemListings.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS CATEGORIES (
                CategoryName TEXT PRIMARY KEY,
                ItemCount INTEGER NOT NULL DEFAULT 0
            )
        ''')
        
        print("CATEGORIES table created successfully")
        
        conn.commit()
        
    except sqlite3.Error as e:
        print(f"An error occurred while creating CATEGORIES table: {e}")
    finally:
        if conn:
            conn.close()

def prepopulate_categories():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'ItemListings.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if CATEGORIES table is already populated
        cursor.execute("SELECT COUNT(*) FROM CATEGORIES")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print("CATEGORIES table is already populated.")
            return
        
        # Fetch all descriptions from FOUNDITEMS
        cursor.execute("SELECT Description FROM FOUNDITEMS")
        descriptions = cursor.fetchall()
        
        category_counts = {}
        
        for desc_tuple in descriptions:
            description = desc_tuple[0]
            if description:
                # Split by comma and take the first keyword as category
                category = description.split(',')[0].strip()
                if category:
                    category_counts[category] = category_counts.get(category, 0) + 1
        
        # Insert categories into CATEGORIES table
        for category, count in category_counts.items():
            cursor.execute("INSERT INTO CATEGORIES (CategoryName, ItemCount) VALUES (?, ?)", (category, count))
        
        conn.commit()
        print("CATEGORIES table pre-populated successfully.")
        
    except sqlite3.Error as e:
        print(f"An error occurred while pre-populating CATEGORIES table: {e}")
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
    create_categories_table()
    prepopulate_categories()
    verify_table_structure()