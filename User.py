import sqlite3

class User:
    def __init__(self, UserID=None, Email=None, Password=None, Name=None, isStudent=False, isStaff=False):
        self.Email = Email
        self.Password = Password
        self.Name = Name
        self.isStudent = isStudent
        self.isStaff = isStaff
        self.UserID = UserID
        self.conn = sqlite3.connect('Databases/Accounts.db')
        self.cursor = self.conn.cursor()

    #TODO: Add managePreRegistered()

    def addUser(self):
        self.cursor.execute('''
            INSERT INTO UserListing (Email, Password, Name, isStudent, isStaff)
            VALUES (?, ?, ?, ?, ?)
        ''', (self.Email, self.Password, self.Name, int(self.isStudent), int(self.isStaff)))
        self.conn.commit()
    
    def modifyUser(self):
        if self.UserID is None:
            raise ValueError("UserID is not set. Cannot modify user without UserID.")
        self.cursor.execute('''
            UPDATE UserListing
            SET Email = ?, Password = ?, Name = ?, isStudent = ?, isStaff = ?
            WHERE UserID = ?
        ''', (self.Email, self.Password, self.Name, int(self.isStudent), int(self.isStaff), self.UserID))
        self.conn.commit()
    
    def deleteUser(self):
        if self.UserID is None:
            raise ValueError("UserID is not set. Cannot delete user without UserID.")
        self.cursor.execute('DELETE FROM UserListing WHERE UserID = ?', (self.UserID,))
        self.conn.commit()
    

    
