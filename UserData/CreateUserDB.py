import sqlite3

def create_user_database():
    conn = sqlite3.connect('Databases/Accounts.db')
    cursor = conn.cursor()

    #TODO: Add Pre-Registered Items Field

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserListing 
        (
            UserID      INTEGER PRIMARY KEY AUTOINCREMENT,
            Email       TEXT    NOT NULL    UNIQUE,
            Password    TEXT    NOT NULL,
            isStudent   INTEGER,
            isStaff     INTEGER
        )''')
    
    print("Table created succesfully")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_user_database()
