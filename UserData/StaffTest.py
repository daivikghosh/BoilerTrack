# StaffTest.py

import sqlite3
import os
from CreateStaffDB import create_staff_database

class Staff:
    def __init__(self, StaffID=None, Email=None, Password=None, Name=None, Dept=None, isApproved=0):
        self.Email = Email
        self.Password = Password
        self.Name = Name
        self.Dept = Dept
        self.isApproved = isApproved
        self.StaffID = StaffID
        self.conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../databases/StaffAccounts.db'))
        self.cursor = self.conn.cursor()

    def addStaff(self):
        self.cursor.execute('''
            INSERT INTO StaffListing (Email, Password, Name, Dept, isApproved)
            VALUES (?, ?, ?, ?, ?)
        ''', (self.Email, self.Password, self.Name, self.Dept, self.isApproved))
        self.conn.commit()
    
    def modifyStaff(self):
        if self.StaffID is None:
            raise ValueError("StaffID is not set. Cannot modify staff without StaffID.")
        self.cursor.execute('''
            UPDATE StaffListing
            SET Email = ?, Password = ?, Name = ?, Dept = ?, isApproved = ?
            WHERE StaffID = ?
        ''', (self.Email, self.Password, self.Name, self.Dept, self.isApproved, self.StaffID))
        self.conn.commit()
    
    def deleteStaff(self):
        if self.StaffID is None:
            raise ValueError("StaffID is not set. Cannot delete staff without StaffID.")
        self.cursor.execute('DELETE FROM StaffListing WHERE StaffID = ?', (self.StaffID,))
        self.conn.commit()

def get_staff_by_email(email):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/StaffAccounts.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM StaffListing WHERE Email = ?', (email,))
    staff = cursor.fetchone()
    conn.close()
    return staff

def main():
    create_staff_database()  # Create the database and table

    # Add a staff to the database
    staff = Staff(Email='staffuser@example.com', Password='securepassword', Name='Staff User', Dept='Engineering')
    staff.addStaff()
    print("\nStaff added to the database.")

    # Test Added Staff
    retrieved_staff = get_staff_by_email('staffuser@example.com')
    if retrieved_staff:
        print("\nStaff retrieved from the database:")
        print(f"StaffID: {retrieved_staff[0]}, Email: {retrieved_staff[1]}, Name: {retrieved_staff[3]}, Dept: {retrieved_staff[4]}, isApproved: {retrieved_staff[5]}")
    else:
        print("\nError: Staff not found in the database.")

    # Modify the staff's data
    staff.Name = 'Modified Staff'
    staff.Password = 'newsecurepassword'
    staff.Dept = 'Research and Development'
    staff.isApproved = 1
    staff.StaffID = retrieved_staff[0]  # Assuming StaffID is at index 0
    staff.modifyStaff()
    print("\nStaff data modified.")

    # Test Staff Data Modification
    modified_staff = get_staff_by_email('staffuser@example.com')
    if modified_staff:
        print("\nModified staff data:")
        print(f"StaffID: {modified_staff[0]}, Email: {modified_staff[1]}, Name: {modified_staff[3]}, Dept: {modified_staff[4]}, isApproved: {modified_staff[5]}")
    else:
        print("\nError: Staff not found in the database.")

    # Delete the staff
    staff.deleteStaff()
    print("\nStaff deleted from the database.")

    # Test Staff deletion
    deleted_staff = get_staff_by_email('staffuser@example.com')
    if deleted_staff:
        print("\nError: Staff still exists in the database:")
        print(f"StaffID: {deleted_staff[0]}, Email: {deleted_staff[1]}, Name: {deleted_staff[3]}, Dept: {deleted_staff[4]}, isApproved: {deleted_staff[5]}")
    else:
        print("\nStaff successfully deleted from the database.")

if __name__ == "__main__":
    main()