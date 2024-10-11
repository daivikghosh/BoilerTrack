import os

def delete_user_database():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../Databases/Accounts.db')
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Table deleted successfully")
    else:
        print("Table file does not exist")

if __name__ == '__main__':
    delete_user_database()