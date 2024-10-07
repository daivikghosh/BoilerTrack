# UserTest.py

import sqlite3
from CreateUserDB import create_user_database
from User import User

def get_user_by_email(email):
    """
    Helper function to retrieve a user from the database by email.
    """
    conn = sqlite3.connect('Databases/Accounts.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM UserListing WHERE Email = ?", (email,))
    user = cursor.fetchone()

    conn.close()
    return user

def main():
    create_user_database() # Create the database and table

    # Add a user to the database
    user = User(Email='testuser@example.com', Password='password123', Name='Test User', isStudent=True, isStaff=False)
    user.addUser()
    print("\nUser added to the database.")

    # Test Added User
    retrieved_user = get_user_by_email('testuser@example.com')
    if retrieved_user:
        print("\nUser retrieved from the database:")
        print(f"UserID: {retrieved_user[0]}, Email: {retrieved_user[1]}, Name: {retrieved_user[3]}, isStudent: {retrieved_user[4]}, isStaff: {retrieved_user[5]}")
    else:
        print("\nError: User not found in the database.")

    # Modify the user's data
    user.Name = 'Modified User'
    user.Password = 'newpassword456'
    # Set the UserID for modification
    user.UserID = retrieved_user[0]  # Assuming UserID is at index 0
    user.modifyUser()
    print("\nUser data modified.")

    # Test User Data Modification
    modified_user = get_user_by_email('testuser@example.com')
    if modified_user:
        print("\nModified user data:")
        print(f"UserID: {modified_user[0]}, Email: {modified_user[1]}, Name: {modified_user[3]}, isStudent: {modified_user[4]}, isStaff: {modified_user[5]}")
    else:
        print("\nError: User not found in the database.")

    # Delete the user
    user.deleteUser()
    print("\nUser deleted from the database.")

    # Test User deletion
    deleted_user = get_user_by_email('testuser@example.com')
    if deleted_user:
        print("\nError: User still exists in the database:")
        print(f"UserID: {deleted_user[0]}, Email: {deleted_user[1]}, Name: {deleted_user[3]}, isStudent: {deleted_user[4]}, isStaff: {deleted_user[5]}")
    else:
        print("\nUser successfully deleted from the database.")

if __name__ == "__main__":
    main()
