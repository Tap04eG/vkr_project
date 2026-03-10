import os
import re

QUESTS_DIR = r"g:\vkr_project-master\vkr-quests-backup"
OUT_DIR = r"g:\vkr_project-master\vkr-quests"

css_link = '    <link rel="stylesheet" href="../style/stylefortests.css">\n'

script_mapping = {
    'гласные и согласные.html': '../script/game-glasn-soglasn.js',
    'нб (1).html': '../script/game-find-letter.js',  
    'нб (2).html': '../script/game-find-letter.js',
    'нб (3).html': '../script/game-find-letter.js',
    'нб (4).html': '../script/game-find-letter.js',
    'нб (5).html': '../script/game-find-letter.js',
    'нб (6).html': '../script/game-find-letter.js',
    'нб (7).html': '../script/game-find-letter.js',
    'нб (8).html': '../script/game-find-letter.js',
    'нб (9).html': '../script/game-find-letter.js',
    'установи верный порядок букв.html': '../script/game-letter-order.js',
    'установи верный порядок букв1.html': '../script/game-letter-order.js',
    'установи верный порядок букв2.html': '../script/game-letter-order.js',
    'установи верный порядок букв3.html': '../script/game-letter-order.js',
    'установи верный порядок букв4.html': '../script/game-letter-order.js',
    'установи верный порядок букв5.html': '../script/game-letter-order.js',
    'установи верный порядок букв6.html': '../script/game-letter-order.js',
    'установи верный порядок букв7.html': '../script/game-letter-order.js',
    'установи верный порядок букв8.html': '../script/game-letter-order.js',
    'установи верный порядок букв9.html': '../script/game-letter-order.js',
    'запиши буквы в правильном порядке1.html': '../script/game-letter-order-v2.js',
    'запиши буквы в правильном порядке2.html': '../script/game-letter-order-v2.js',
    'запиши буквы в правильном порядке3.html': '../script/game-letter-order-v2.js',
    'запиши буквы в правильном порядке4.html': '../script/game-letter-order-v2.js',
    'запиши буквы в правильном порядке5.html': '../script/game-letter-order-v2.js',
    'запиши буквы в правильном порядке6.html': '../script/game-letter-order-v2.js',
    'парные согласные(по твердости, мягкости).html': '../script/game-paired-hard-soft.js',
    'непарные согласные(по твердости, мягкости).html': '../script/game-unpaired-hard-soft.js',
    'согласные(парные)(звонкие и глухие).html': '../script/game-paired-voiced-voiceless.js',
    'согласные(непарные)(звонкие и глухие).html': '../script/game-unpaired-voiced-voiceless.js',
    'определите количество звуков и букв в слове(1).html': '../script/game-sounds-letters.js',
    'определите количество звуков и букв в слове(2).html': '../script/game-sounds-letters.js',
    'определите количество слогов(1).html': '../script/game-syllables.js',
    'определите количество слогов(2).html': '../script/game-syllables.js',
    'определите количество слогов, звуков и букв в слове(1).html': '../script/game-syllables-sounds-letters.js',
    'определите количество слогов, звуков и букв в слове(2).html': '../script/game-syllables-sounds-letters.js',
}

def process_html_file(filename):
    in_path = os.path.join(QUESTS_DIR, filename)
    out_path = os.path.join(OUT_DIR, filename)
    
    with open(in_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. replace style block with link
    style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
    if style_pattern.search(content):
        content = style_pattern.sub(css_link, content)
    
    # 2. replace script block with link and preserve data
    if filename in script_mapping:
        script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL)
        script_match = script_pattern.search(content)
        
        if script_match:
            original_script = script_match.group(1).lstrip()
            
            # The data variables are usually defined at the very top as `const ... = ...;`
            # The game state variables usually start with `let `
            # We want to extract everything from the start of the script up to the first `let ` or `const ` that selects a DOM element (like `document.getElementById`)
            
            # Look for the start of game state / DOM elements
            split_match = re.search(r'\n\s*(let current|let level|let isCompleted|const [a-zA-Z]+Container = document|const lettersContainer)', original_script)
            
            data_script = ""
            if split_match:
                split_index = split_match.start()
                data_script_content = original_script[:split_index].strip()
                if data_script_content:
                    data_script = f'<script>\n        {data_script_content}\n    </script>\n'
            
            script_link = f'{data_script}    <script src="{script_mapping[filename]}"></script>\n</body>'
            
            replace_pattern = re.compile(r'<script>.*?</script>\s*</body>', re.DOTALL)
            if replace_pattern.search(content):
                 content = replace_pattern.sub(script_link, content)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")

def main():
    if not os.path.exists(QUESTS_DIR):
        print("Backup directory not found")
        return

    for filename in os.listdir(QUESTS_DIR):
        if filename.endswith(".html"):
            process_html_file(filename)

if __name__ == "__main__":
    main()
