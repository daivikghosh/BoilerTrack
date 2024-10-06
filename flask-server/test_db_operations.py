import sqlite3
from AddFoundItemPic import insertItem

def get_item_by_id(ItemID):
    """
    Helper function to retrieve an item from the database by ItemID.
    """
    conn = sqlite3.connect('databases/ItemListings.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM FOUNDITEMS WHERE ItemID = ?", (ItemID,))
    item = cursor.fetchone()

    conn.close()
    return item

def main():
    # Create an item in the database
    insertItem(1, "Red wallet, leather", "Library", "Lost and Found")
    print("\nItem added to the database.")

    # Test Added Item
    retrieved_item = get_item_by_id(1)
    if retrieved_item:
        print("\nItem retrieved from the database:")
        print(f"ItemID: {retrieved_item[0]}, Keywords: {retrieved_item[1]}, LocationFound: {retrieved_item[2]}, LocationTurnedIn: {retrieved_item[3]}")
    else:
        print("\nError: Item not found in the database.")

if __name__ == "__main__":
    main()