import os
import re

SCRIPT_DIR = r"g:\vkr_project-master\script"

def process_js_file(filepath, filename):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The same logic as in the HTML extractor:
    # Find the start of the game state block (`let ` or DOM queries)
    # Remove everything before it
    split_match = re.search(r'\n\s*(let current|let level|let isCompleted|const [a-zA-Z]+Container = document|const lettersContainer|const wordsContainer = document|const taskStatus = document|const syllablesDropzones = document)', content)
    
    if split_match:
        split_index = split_match.start()
        # Keep only the part from game state onwards
        new_content = content[split_index:].strip()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Processed {filename}")
    else:
        print(f"Skipped {filename} - could not find main logic block")

def main():
    if not os.path.exists(SCRIPT_DIR):
        print("Directory not found")
        return

    for filename in os.listdir(SCRIPT_DIR):
        if filename.endswith(".js"):
            filepath = os.path.join(SCRIPT_DIR, filename)
            process_js_file(filepath, filename)

if __name__ == "__main__":
    main()
