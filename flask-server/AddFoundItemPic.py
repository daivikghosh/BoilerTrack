import sqlite3

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blobData = file.read()
    return blobData

def insertItem(ItemID,Keywords,LocationFound,LocationTurnedIn,Photo):
    try:
        sqliteConnection = sqlite3.connect('ItemListings.db')
        cursor = sqliteConnection.cursor()
        print("Connected to SQLite")
        
        cursor.execute('''CREATE TABLE IF NOT EXISTS FOUNDITEMS
         (ItemID            INT     PRIMARY KEY     NOT NULL,
         Keywords           TEXT    NOT NULL,
         LocationFound      TEXT    NOT NULL,
         LocationTurnedIn   TEXT    NOT NULL,
         Photo              BLOB    NOT NULL);''')
        
        print("Table created successfully")
        
        sqlite_insert_query = """ INSERT INTO FOUNDITEMS
                                  (ItemID,Keywords,LocationFound,LocationTurnedIn,Photo) VALUES (?, ?, ?, ?, ?)"""

        binaryPhoto = convertToBinaryData(Photo)
        # Convert data into tuple format
        data_tuple = (ItemID,Keywords,LocationFound,LocationTurnedIn,binaryPhoto)
        cursor.execute(sqlite_insert_query, data_tuple)
        sqliteConnection.commit()
        print("Item inserted successfully")
        cursor.close()

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("the sqlite connection is closed")
