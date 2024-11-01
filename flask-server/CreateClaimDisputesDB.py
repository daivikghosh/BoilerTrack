import sqlite3
import os

# Get the absolute path to the Databases directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITEMS_DB = os.path.join(base_dir, 'Databases', 'ItemListings.db')

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        blobData = file.read()
    return blobData

def create_claim_disputes_table():
    sqliteConnection = None
    try:
        sqliteConnection = sqlite3.connect(ITEMS_DB)
        cursor = sqliteConnection.cursor()

        # Create the ClaimDisputes table if it does not already exist
        cursor.execute('''CREATE TABLE IF NOT EXISTS ClaimDisputes (
                            ItemID             INTEGER NOT NULL,
                            ClaimedBy          TEXT NOT NULL,
                            DisputeBy          TEXT NOT NULL,
                            Reason             TEXT NOT NULL,
                            AdditionalComments TEXT,
                            DisputePhotoProof  BLOB,
                            FOREIGN KEY (ItemID) REFERENCES FoundItems(ItemID)
                        );''')
        
        print("ClaimDisputes table created successfully.")

    except sqlite3.Error as error:
        print("Failed to create ClaimDisputes table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("The sqlite connection is closed.")

def insert_dispute(ItemID, ClaimedBy, DisputeBy, Reason, AdditionalComments, DisputePhotoProof):
    sqliteConnection = None
    try:
        sqliteConnection = sqlite3.connect(ITEMS_DB)
        cursor = sqliteConnection.cursor()
        
        # Insert a record into ClaimDisputes
        sqlite_insert_query = """INSERT INTO ClaimDisputes 
                                 (ItemID, ClaimedBy, DisputeBy, Reason, AdditionalComments, DisputePhotoProof)
                                 VALUES (?, ?, ?, ?, ?, ?)"""
        
        # Convert files to binary data
        binaryDisputePhotoProof = convertToBinaryData(DisputePhotoProof) if DisputePhotoProof else None
        # binaryPhoto = convertToBinaryData(Photo) if Photo else None
        
        # Data tuple to insert
        data_tuple = (ItemID, ClaimedBy, DisputeBy, Reason, AdditionalComments, binaryDisputePhotoProof)
        
        cursor.execute(sqlite_insert_query, data_tuple)
        sqliteConnection.commit()
        print("Dispute inserted into ClaimDisputes table successfully.")

    except sqlite3.Error as error:
        print("Failed to insert data into ClaimDisputes table", error)
    finally:
        if sqliteConnection:
            sqliteConnection.close()
            print("The sqlite connection is closed.")

if __name__ == "__main__":
    # Create the ClaimDisputes table
    
    # delete the whole table
    '''
    sqliteConnection = sqlite3.connect(ITEMS_DB)
    cursor = sqliteConnection.cursor()
    cursor.execute("DROP TABLE ClaimDisputes")
    sqliteConnection.commit()
    sqliteConnection.close()
    print("deleted")
    create_claim_disputes_table()
    '''
    
    # Example of inserting a dispute record
    insert_dispute(ItemID=1, ClaimedBy="laxminag@purdue.edu", DisputeBy="whiffy@purdue.edu",
                    Reason="Incorrect claim", AdditionalComments="Please verify the details.",
                    DisputePhotoProof="uploads/bitcoinClaim.jpeg")
