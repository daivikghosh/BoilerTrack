# DeleteStaffDB.py

import os

def delete_staff_database():
    # Get the absolute path to the databases directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/StaffAccounts.db')
    
    # Check if the database file exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Staff database deleted successfully")
    else:
        print("Staff database file does not exist")

if __name__ == '__main__':
    delete_staff_database()