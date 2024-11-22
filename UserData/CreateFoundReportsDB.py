# CreateFoundReportsDB.py
import sqlite3
import os
def create_found_reports_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, '../databases/FoundReports.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS FoundReports (
            ReportID INTEGER PRIMARY KEY AUTOINCREMENT,
            location_found TEXT NOT NULL,
            item_description TEXT NOT NULL,
            additional_details TEXT,
            email TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    print("FoundReports.db created successfully.")
if __name__ == '__main__':
    create_found_reports_db()