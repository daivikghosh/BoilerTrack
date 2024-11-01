import sqlite3
import threading

DATABASE_PATH = "../databases/StaffAccounts.db"

def approve_staff_account(staff_id):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE StaffListing SET isApproved = 1 WHERE StaffID = ?", (staff_id,))
    conn.commit()
    conn.close()
    print(f"Staff ID {staff_id} approved.")

def reject_staff_account(staff_id):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM StaffListing WHERE StaffID = ?", (staff_id,))
    conn.commit()
    conn.close()
    print(f"Staff ID {staff_id} rejected and deleted.")

def process_approvals():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT StaffID, Email, Name FROM StaffListing WHERE isApproved = 0")
    pending = cursor.fetchall()
    conn.close()

    for staff in pending:
        staff_id, email, name = staff
        print(f"Approve account for {name} ({email})? (yes/no): ", end="")
        decision = input().strip().lower()
        if decision == "yes":
            approve_staff_account(staff_id)
        elif decision == "no":
            reject_staff_account(staff_id)
        else:
            print("Invalid input. Skipping approval.")

def run():
    while True:
        process_approvals()

if __name__ == "__main__":
    print("Waiting for Staff Approval Requests...")

    approval_thread = threading.Thread(target=run, daemon=True)
    approval_thread.start()
    approval_thread.join()
