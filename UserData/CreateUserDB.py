import sqlite3

def create_user_database():
    conn = sqlite3.connect('Databases/Accounts.db')
    cursor = conn.cursor()

    #TODO: Add Pre-Registered Items Field

    cursor.execute('DROP TABLE IF EXISTS UserListing') #Delete the Table if it already exists to re create it

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserListing 
        (
            UserID      INTEGER PRIMARY KEY AUTOINCREMENT,
            Email       TEXT    NOT NULL    UNIQUE,
            Password    TEXT    NOT NULL,
            Name        TEXT    NOT NULL,
            isStudent   INTEGER,
            isStaff     INTEGER
        )''')
    
    print("Table created succesfully")
    
    conn.commit()
    conn.close()
