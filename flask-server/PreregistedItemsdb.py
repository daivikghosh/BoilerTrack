import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')


def convert_to_binary(filename):
    """
    Convert digital data to binary format for storing images in the database.
    """
    if not isinstance(filename, str) or '\0' in filename:
        with open("uploads/TestImage.png", 'rb') as file:
            data = file.read()
         
    
    with open(filename, 'rb') as file:
        data = file.read()
    return data


def insert_preregistered_item(item_name, color, brand, description, photo, date, qr_code, user_email):
    """
    Insert a pre-registered item into the PREREGISTERED table.
    :param ItemName: Name of the item
    :param Color: Color of the item
    :param Brand: Brand of the item
    :param Description: Description of the item
    :param Photo: Path to the item's photo file 
    :param Date: Date of registration
    :param QRCode: Path to the QR code image file
    :param UserEmail: Email of the user who registered the item
    """
    connection = None
    try:
        connection = sqlite3.connect(USERS_DB)
        cursor = connection.cursor()

        # Ensure the PREREGISTERED table exists
        cursor.execute('''CREATE TABLE IF NOT EXISTS PREREGISTERED
                          (pre_reg_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                           ItemName         TEXT NOT NULL,
                           Color            TEXT,
                           Brand            TEXT,
                           Description      TEXT,
                           Photo            BLOB,
                           Date             TEXT,
                           qr_code_image    BLOB, 
                           UserEmail        TEXT NOT NULL);''')

        print("Table created successfully or already exists.")

        # Prepare the SQL insert query
        sqlite_insert_query = """ INSERT INTO PREREGISTERED
                                  (ItemName, Color, Brand, Description, Photo, Date, qr_code_image, UserEmail) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""

        # Convert photo and QR code image to binary data
        binary_photo = convert_to_binary(photo)
        binary_qr_code = convert_to_binary(qr_code)

        # Create the tuple with the data
        data_tuple = (item_name, color, brand, description,
                      binary_photo, date, binary_qr_code, user_email)

        # Execute the insert query
        cursor.execute(sqlite_insert_query, data_tuple)
        connection.commit()

        print("Item inserted into db successfully")

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)
        raise  # Re-raise the exception to be caught in the calling function
    finally:
        if connection:
            connection.close()
            print("The sqlite connection is closed")


# Uncomment these lines for testing
if __name__ == "__main__":
    insert_preregistered_item("Bike", "Black", "Walmart", "Functional black bike",
                              "uploads/bike.png", "2024-10-20", "uploads/care.png", "laxminag@purdue.edu")
    insert_preregistered_item("another Bike", "white", "macys", "imposter bike",
                              "uploads/TestImage.png", "2024-10-20", "uploads/care.png", "whiffy@purdue.edu")
