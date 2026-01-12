import sqlite3

def inspect_data():
    try:
        conn = sqlite3.connect('sql_app.db')
        cursor = conn.cursor()
        
        print("--- TASKS (Last 5) ---")
        cursor.execute("SELECT id, title, task_type, task_data FROM tasks ORDER BY id DESC LIMIT 5")
        tasks = cursor.fetchall()
        for t in tasks:
            print(f"ID: {t[0]}")
            print(f"Title: {t[1]}")
            print(f"Type: {t[2]}")
            print(f"Data: {t[3]}")
            print("-" * 20)

        conn.close()
    except Exception as e:
        print(f"Inspection failed: {e}")

if __name__ == "__main__":
    inspect_data()
