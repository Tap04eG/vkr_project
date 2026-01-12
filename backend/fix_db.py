from database import engine
from models import Base
from sqlalchemy import inspect, text

def fix_database():
    print("Checking database state...")
    
    # 1. Ensure tables exist (Create if missing)
    print("Running create_all()...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Check for missing columns in 'tasks' table
    insp = inspect(engine)
    columns = [c['name'] for c in insp.get_columns('tasks')]
    print(f"Existing columns in 'tasks': {columns}")
    
    with engine.connect() as conn:
        if 'task_type' not in columns:
            print("Adding missing column: task_type")
            conn.execute(text("ALTER TABLE tasks ADD COLUMN task_type VARCHAR DEFAULT 'text'"))
            
        if 'task_data' not in columns:
            print("Adding missing column: task_data")
            conn.execute(text("ALTER TABLE tasks ADD COLUMN task_data VARCHAR DEFAULT '{}'"))
            
        conn.commit()
    
    print("Database fixed successfully.")

if __name__ == "__main__":
    fix_database()
