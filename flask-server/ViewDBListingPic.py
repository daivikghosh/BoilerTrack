import sqlite3
import os


def write_to_file(data, filename):
    # Convert binary data to proper format and write it on Hard Disk
    with open(filename, 'wb') as file:
        file.write(data)
    print("Stored blob data into: ", filename, "\n")


def read_data(Id):
    try:
        connection = sqlite3.connect('databases/ItemListings.db')
        cursor = connection.cursor()
        print("Connected to SQLite")

        sql_fetch_query = """SELECT * from FOUNDITEMS where ItemID = ?"""
        cursor.execute(sql_fetch_query, (Id,))
        record = cursor.fetchall()

        if (len(record) == 0):
            print("No data exists for this ItemID:", Id)

        for row in record:
            print("ItemID = ", row[0])
            print("ItemName = ", row[1])
            print("Color = ", row[2])
            print("Brand = ", row[3])
            print("LocationFound = ", row[4])
            print("LocationTurnedIn = ", row[5])
            print("Description = ", row[6])

            name = row[1]
            Photo = row[7]
            print("Storing image on disk \n")
            photoPath = name + ".png"
            write_to_file(Photo, photoPath)

        cursor.close()

    except sqlite3.Error as error:
        print("Failed to read data from sqlite table", error)
    finally:
        if connection:
            connection.close()
            print("sqlite connection is closed")

# readData(1)
