# DeleteFoundReports.py
import os
def delete_found_reports_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/FoundReports.db')
    if os.path.exists(db_path):
        os.remove(db_path)
        print("FoundReports.db deleted successfully.")
    else:
        print("FoundReports.db does not exist.")
if __name__ == '__main__':
    delete_found_reports_db()