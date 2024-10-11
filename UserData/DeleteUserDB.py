import os

def delete_user_database():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../databases/Accounts.db')
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Database deleted successfully")
    else:
        print("Database file does not exist")

if __name__ == '__main__':
    delete_user_database()