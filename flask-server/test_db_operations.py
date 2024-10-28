import sqlite3
from AddFoundItemPic import insertItem


def get_item_by_name(ItemName):
    """
    Helper function to retrieve an item from the database by ItemID.
    """
    conn = sqlite3.connect('databases/ItemListings.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM FOUNDITEMS WHERE ItemName = ?", (ItemName,))
    item = cursor.fetchone()

    conn.close()
    return item


def main():
    # Create an item in the database
    # insertItem(1, "Red wallet, leather", "Library", "Lost and Found")
    insertItem("UnitTest", "TESTColor", "TESTBrand", "TESTFound",
               "TESTTurned", "TESTDesc", "uploads/TestImage.png")
    print("\nItem added to the database.")

    # Test Added Item
    retrieved_item = get_item_by_name("UnitTest")
    if retrieved_item:
        print("\nItem retrieved from the database:")
        print(f"ItemID: {retrieved_item[0]}, Keywords: {retrieved_item[1]}, {retrieved_item[2]}, {retrieved_item[3]}, {retrieved_item[4]}, LocationFound: {retrieved_item[5]}, LocationTurnedIn: {retrieved_item[6]}")
# ---------------------------------------------------------
#               enshrining this as the weirdest string operation I have ever seen
#        print(f"ItemID: {retrieved_item[0]}, Keywords: {retrieved_item[1]+", "+retrieved_item[2]+", "+retrieved_item[3]}, LocationFound: {retrieved_item[4]}, LocationTurnedIn: {retrieved_item[5]}")
# ---------------------------------------------------------

    else:
        print("\nError: Item not found in the database.")


if __name__ == "__main__":
    main()
