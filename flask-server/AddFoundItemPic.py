import sqlite3

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blobData = file.read()
    return blobData

def insertItem(ItemName,Color,Brand,LocationFound,LocationTurnedIn,Description,Photo):
    try:
        sqliteConnection = sqlite3.connect('databases/ItemListings.db')
        cursor = sqliteConnection.cursor()
        
        cursor.execute('''CREATE TABLE IF NOT EXISTS FOUNDITEMS
         (ItemID            INTEGER PRIMARY KEY,
         ItemName           TEXT    NOT NULL,
         Color              TEXT,
         Brand              TEXT,
         LocationFound      TEXT,
         LocationTurnedIn   TEXT,
         Description        TEXT,
         Photo              BLOB);''')
        
        print("Table created successfully")
        
        sqlite_insert_query = """ INSERT INTO FOUNDITEMS
                                  (ItemName,Color,Brand,LocationFound,LocationTurnedIn,Description,Photo) VALUES (?, ?, ?, ?, ?, ?, ?)"""

        binaryPhoto = convertToBinaryData(Photo)
        # Convert data into tuple format
        data_tuple = (ItemName,Color,Brand,LocationFound,LocationTurnedIn,Description,binaryPhoto)
        cursor.execute(sqlite_insert_query, data_tuple)
        sqliteConnection.commit()
        print("Item inserted into db successfully")
        cursor.close()

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("the sqlite connection is closed")


#insertItem("C", "Rainbow", "NA", "WALC", "HICKS", "Flag")
#insertItem("B", "Blue", "Sony", "HICKS", "HICKS", "NAusdfkubfdvsguk, asrufyhkdfhg")
