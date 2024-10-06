import sqlite3

def writeTofile(data, filename):
    # Convert binary data to proper format and write it on Hard Disk
    with open(filename, 'wb') as file:
        file.write(data)
    print("Stored blob data into: ", filename, "\n")

def readData(Id):
    try:
        sqliteConnection = sqlite3.connect('ItemListings.db')
        cursor = sqliteConnection.cursor()
        print("Connected to SQLite")

        sql_fetch_query = """SELECT * from FOUNDITEMS where ItemID = ?"""
        cursor.execute(sql_fetch_query, (Id,))
        record = cursor.fetchall()
        for row in record:
            print("ItemID = ", row[0])
            print("Keywords = ", row[1])
            print("LocationFound = ", row[2])
            print("LocationTurnedIn = ", row[3])
            name = row[1]
            #Photo = row[4]

            print("Storing image on disk \n")
            #photoPath = name + ".png"
            #writeTofile(Photo, photoPath)

        cursor.close()

    except sqlite3.Error as error:
        print("Failed to read data from sqlite table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("sqlite connection is closed")

readData(1)









'''
import sqlite3

def writeTofile(data, filename):
    # Convert binary data to proper format and write it on Hard Disk
    with open(filename, 'wb') as file:
        file.write(data)
    print("Stored blob data into: ", filename, "\n")

def readData(Id):
    try:
        sqliteConnection = sqlite3.connect('ItemListings.db')
        cursor = sqliteConnection.cursor()
        print("Connected to SQLite")

        sql_fetch_query = """SELECT * from FOUNDITEMS where ItemID = ?"""
        cursor.execute(sql_fetch_query, (Id,))
        record = cursor.fetchall()
        for row in record:
            print("ItemID = ", row[0])
            print("Keywords = ", row[1])
            print("LocationFound = ", row[2])
            print("LocationTurnedIn = ", row[3])
            name = row[1]
            Photo = row[4]

            print("Storing image on disk \n")
            photoPath = name + ".png"
            writeTofile(Photo, photoPath)

        cursor.close()

    except sqlite3.Error as error:
        print("Failed to read data from sqlite table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("sqlite connection is closed")

readData(1)
'''