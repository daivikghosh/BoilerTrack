import sqlite3

def delete_deleted_items(db_path, table_name):
    """
    Delete all rows in the specified table where the isDeleted column is set to TRUE (1).
    
    :param db_path: Path to the SQLite database file
    :param table_name: Name of the table to delete rows from
    """
    try:

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create SQL DELETE statement
        sql_delete_query = f"DELETE FROM {table_name} WHERE isDeleted = 1"
        
        # Execute the query
        cursor.execute(sql_delete_query)
        
        # Commit the changes to the database
        conn.commit()
        
        # Get the number of rows deleted
        rows_deleted = cursor.rowcount
        print(f"{rows_deleted} rows were deleted from the table {table_name}.")
        
    except sqlite3.Error as error:
        print(f"Error while working with SQLite: {error}")
    
    finally:

        if conn:
            conn.close()


