import os
import re

QUESTS_DIR = r"g:\vkr_project-master\vkr-quests"

css_link = '    <link rel="stylesheet" href="../style/stylefortests.css">\n'

# mapping of html files to their actual script files
script_mapping = {
    'гласные и согласные.html': '../script/game-glasn-soglasn.js',
    'нб (1).html': '../script/game-find-letter.js',  # Assuming find-letter for НБ
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

def process_html_file(filepath, filename):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. replace style block with link
    style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
    if style_pattern.search(content):
        content = style_pattern.sub(css_link, content)
    
    # 2. replace script block with link if mapping exists
    if filename in script_mapping:
        script_link = f'    <script src="{script_mapping[filename]}"></script>\n'
        script_pattern = re.compile(r'<script>.*?</script>', re.DOTALL)
        if script_pattern.search(content):
            content = script_pattern.sub(script_link, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")

def main():
    if not os.path.exists(QUESTS_DIR):
        print("Directory not found")
        return

    for filename in os.listdir(QUESTS_DIR):
        if filename.endswith(".html"):
            filepath = os.path.join(QUESTS_DIR, filename)
            process_html_file(filepath, filename)

if __name__ == "__main__":
    main()
