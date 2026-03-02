import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('test.db')
        cursor = conn.cursor()
        
        # Check if columns exist
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'task_type' not in columns:
            print("Adding task_type column...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN task_type VARCHAR DEFAULT 'text'")
            
        if 'task_data' not in columns:
            print("Adding task_data column...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN task_data VARCHAR DEFAULT '{}'")
            
        conn.commit()
        print("Migration successful!")
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
