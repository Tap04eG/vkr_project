        // Слова для задания с правильными ответами (звуки, буквы)
        const wordsData = [
            // Уровень 1
            [
                {word: "Дуб", sounds: 3, letters: 3},
                {word: "Ель", sounds: 3, letters: 3},
                {word: "Стол", sounds: 4, letters: 4},
                {word: "Стул", sounds: 4, letters: 4}
            ],
            // Уровень 2
            [
                {word: "Лист", sounds: 4, letters: 4},
                {word: "Листва", sounds: 6, letters: 6},
                {word: "Парта", sounds: 5, letters: 5},
                {word: "Береза", sounds: 6, letters: 6}
            ],
            // Уровень 3
            [
                {word: "Смородина", sounds: 9, letters: 9},
                {word: "Пшеница", sounds: 7, letters: 7},
                {word: "Клён", sounds: 4, letters: 4},
                {word: "Тепло", sounds: 5, letters: 5}
            ],
            // Уровень 4
            [
                {word: "Солнце", sounds: 5, letters: 6},
                {word: "Облака", sounds: 6, letters: 6},
                {word: "Телефон", sounds: 7, letters: 7},
                {word: "Мишка", sounds: 5, letters: 5}
            ]
        ];
        
        // Переменные состояния игры
        let currentLevel = 1;
        let score = 0;
        let totalScore = 0;
        let isCompleted = false;
        let userAnswers = new Map(); // Храним ответы пользователя
        let checkedAnswers = new Map(); // Храним проверенные ответы
        
        // Элементы DOM
        const wordsContainer = document.getElementById('words-container');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const taskStatus = document.getElementById('task-status');
        const levelCompleteContainer = document.getElementById('level-complete-container');
        const levelCompleteTitle = document.getElementById('level-complete-title');
        const levelCompleteMessage = document.getElementById('level-complete-message');
        const finalResultContainer = document.getElementById('final-result-container');
        const finalRewardMessageElement = document.getElementById('final-reward-message');
        const taskTitle = document.getElementById('task-title');
        const restartBtn = document.getElementById('restart-btn');
        const exitBtn = document.getElementById('exit-btn');
        const nextLevelButton = document.getElementById('next-level-button');
        const levelInfoElement = document.getElementById('level-info');
        const checkAnswersButton = document.getElementById('check-answers-button');
        const scoreDisplay = document.getElementById('score');
        const totalWordsDisplay = document.getElementById('total-words');
        
        // Инициализация игры
        function initGame() {
            // Сброс состояния игры
            currentLevel = 1;
            score = 0;
            totalScore = 0;
            isCompleted = false;
            userAnswers.clear();
            checkedAnswers.clear();
            updateProgress();
            updateScore();
            finalResultContainer.style.display = 'none';
            levelCompleteContainer.style.display = 'none';
            
            // Загрузка первого уровня
            loadLevel(1);
        }
        
        // Загрузка уровня
        function loadLevel(level) {
            currentLevel = level;
            
            // Устанавливаем данные для текущего уровня
            const levelWords = wordsData[level - 1];
            levelInfoElement.textContent = `Уровень ${level} из ${wordsData.length}`;
            taskTitle.textContent = 'Определи количество звуков и букв';
            
            // Сброс состояния
            userAnswers.clear();
            checkedAnswers.clear();
            
            // Очистка контейнера
            wordsContainer.innerHTML = '';
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Обновляем общее количество слов
            totalScore = levelWords.length;
            totalWordsDisplay.textContent = totalScore;
            
            // Создание карточек со словами
            createWordCards(levelWords);
            
            // Обновляем прогресс
            updateProgress();
            
            // Сбрасываем счет
            score = 0;
            updateScore();
            
            // Активируем кнопку проверки
            checkAnswersButton.disabled = false;
            checkAnswersButton.textContent = "Проверить все ответы";
        }
        
        // Создание карточек со словами
        function createWordCards(levelWords) {
            levelWords.forEach((wordData, index) => {
                const wordCard = document.createElement('div');
                wordCard.className = 'word-card';
                wordCard.dataset.word = wordData.word;
                wordCard.dataset.index = index;
                
                // Создаем уникальный ID для карточки
                const cardId = `word-${currentLevel}-${index}`;
                wordCard.id = cardId;
                
                // Добавляем слово
                const wordElement = document.createElement('div');
                wordElement.className = 'word';
                wordElement.textContent = wordData.word;
                wordCard.appendChild(wordElement);
                
                // Добавляем поле для звуков
                const soundsRow = document.createElement('div');
                soundsRow.className = 'input-row';
                
                const soundsLabel = document.createElement('div');
                soundsLabel.className = 'input-label';
                soundsLabel.textContent = 'Звуки:';
                
                const soundsInput = document.createElement('input');
                soundsInput.type = 'number';
                soundsInput.min = '1';
                soundsInput.max = '15';
                soundsInput.className = 'number-input';
                soundsInput.id = `${cardId}-sounds`;
                soundsInput.dataset.word = wordData.word;
                soundsInput.dataset.type = 'sounds';
                soundsInput.dataset.correct = wordData.sounds;
                
                // Обработчик изменения значения
                soundsInput.addEventListener('input', function() {
                    handleInputChange(this);
                });
                
                soundsRow.appendChild(soundsLabel);
                soundsRow.appendChild(soundsInput);
                wordCard.appendChild(soundsRow);
                
                // Добавляем поле для букв
                const lettersRow = document.createElement('div');
                lettersRow.className = 'input-row';
                
                const lettersLabel = document.createElement('div');
                lettersLabel.className = 'input-label';
                lettersLabel.textContent = 'Буквы:';
                
                const lettersInput = document.createElement('input');
                lettersInput.type = 'number';
                lettersInput.min = '1';
                lettersInput.max = '15';
                lettersInput.className = 'number-input';
                lettersInput.id = `${cardId}-letters`;
                lettersInput.dataset.word = wordData.word;
                lettersInput.dataset.type = 'letters';
                lettersInput.dataset.correct = wordData.letters;
                
                // Обработчик изменения значения
                lettersInput.addEventListener('input', function() {
                    handleInputChange(this);
                });
                
                lettersRow.appendChild(lettersLabel);
                lettersRow.appendChild(lettersInput);
                wordCard.appendChild(lettersRow);
                
                // Добавляем карточку в контейнер
                wordsContainer.appendChild(wordCard);
            });
        }
        
        // Обработчик изменения значения в поле ввода
        function handleInputChange(inputElement) {
            const word = inputElement.dataset.word;
            const type = inputElement.dataset.type;
            const value = parseInt(inputElement.value) || 0;
            
            // Сбрасываем стиль при новом вводе
            inputElement.classList.remove('correct', 'incorrect');
            
            // Сбрасываем стиль карточки
            const card = inputElement.closest('.word-card');
            card.classList.remove('correct', 'incorrect');
            
            // Сохраняем ответ пользователя
            if (!userAnswers.has(word)) {
                userAnswers.set(word, {sounds: null, letters: null});
            }
            
            const answer = userAnswers.get(word);
            answer[type] = value;
            userAnswers.set(word, answer);
            
            // Сбрасываем проверку для этого слова
            checkedAnswers.delete(word);
            
            // Обновляем прогресс
            updateProgress();
        }
        
        // Проверка всех ответов
        function checkAllAnswers() {
            const levelWords = wordsData[currentLevel - 1];
            let correctCount = 0;
            let allFilled = true;
            
            // Проверяем, все ли поля заполнены
            levelWords.forEach(wordData => {
                const userAnswer = userAnswers.get(wordData.word);
                if (!userAnswer || userAnswer.sounds === null || userAnswer.letters === null) {
                    allFilled = false;
                }
            });
            
            if (!allFilled) {
                taskStatus.textContent = 'Заполни все поля!';
                taskStatus.className = 'task-status not-completed';
                return;
            }
            
            // Проверяем каждый ответ
            levelWords.forEach(wordData => {
                const userAnswer = userAnswers.get(wordData.word);
                const card = document.querySelector(`.word-card[data-word="${wordData.word}"]`);
                const soundsInput = card.querySelector(`input[data-type="sounds"]`);
                const lettersInput = card.querySelector(`input[data-type="letters"]`);
                
                // Проверяем правильность
                const isSoundsCorrect = userAnswer.sounds === wordData.sounds;
                const isLettersCorrect = userAnswer.letters === wordData.letters;
                
                // Обновляем стили полей ввода
                if (isSoundsCorrect) {
                    soundsInput.classList.add('correct');
                    soundsInput.classList.remove('incorrect');
                } else {
                    soundsInput.classList.add('incorrect');
                    soundsInput.classList.remove('correct');
                }
                
                if (isLettersCorrect) {
                    lettersInput.classList.add('correct');
                    lettersInput.classList.remove('incorrect');
                } else {
                    lettersInput.classList.add('incorrect');
                    lettersInput.classList.remove('correct');
                }
                
                // Обновляем стиль карточки
                if (isSoundsCorrect && isLettersCorrect) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                    correctCount++;
                    checkedAnswers.set(wordData.word, true);
                } else {
                    card.classList.add('incorrect');
                    card.classList.remove('correct');
                    checkedAnswers.set(wordData.word, false);
                    
                    // Анимация тряски для карточки с ошибкой
                    setTimeout(() => {
                        card.classList.remove('incorrect');
                    }, 500);
                }
            });
            
            // Обновляем счет
            score = correctCount;
            updateScore();
            
            // Проверяем, все ли ответы правильные
            if (correctCount === levelWords.length) {
                // Все ответы правильные
                taskStatus.textContent = 'Отлично! Все ответы верные!';
                taskStatus.className = 'task-status completed';
                
                // Отключаем кнопку проверки
                checkAnswersButton.disabled = true;
                checkAnswersButton.textContent = "Все ответы проверены";
                
                // Показываем экран завершения уровня
                if (currentLevel < wordsData.length) {
                    setTimeout(() => {
                        showLevelComplete();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        showFinalResults();
                    }, 1000);
                }
            } else {
                taskStatus.textContent = `Есть ошибки! Правильно: ${correctCount} из ${levelWords.length}`;
                taskStatus.className = 'task-status not-completed';
                
                // Оставляем правильные ответы подсвеченными
                // Неправильные уже подсвечены красным
            }
        }
        
        // Обновление прогресса
        function updateProgress() {
            const levelWords = wordsData[currentLevel - 1];
            const totalWords = levelWords.length;
            
            // Считаем, сколько слов заполнено полностью
            let filledCount = 0;
            levelWords.forEach(wordData => {
                const answer = userAnswers.get(wordData.word);
                if (answer && answer.sounds !== null && answer.letters !== null) {
                    filledCount++;
                }
            });
            
            const progressPercentage = (filledCount / totalWords) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `Прогресс: ${filledCount}/${totalWords}`;
        }
        
        // Обновление счета
        function updateScore() {
            scoreDisplay.textContent = score;
        }
        
        // Показ экрана завершения уровня
        function showLevelComplete() {
            levelCompleteTitle.textContent = 'Уровень пройден!';
            levelCompleteMessage.textContent = `Отлично! Ты правильно определил количество звуков и букв в ${score} словах!`;
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            const totalPossible = wordsData.reduce((sum, level) => sum + level.length, 0);
            finalRewardMessageElement.textContent = `Ты справился со всеми заданиями! Правильных ответов: ${score} из ${totalPossible}`;
            finalResultContainer.style.display = 'block';
            finalResultContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', initGame);
        
        // Обработчик кнопки проверки всех ответов
        checkAnswersButton.addEventListener('click', checkAllAnswers);
        
        // Обработчик кнопки перехода на следующий уровень
        nextLevelButton.addEventListener('click', () => {
            levelCompleteContainer.style.display = 'none';
            loadLevel(currentLevel + 1);
        });
        
        // Обработчики финальных кнопок
        restartBtn.addEventListener('click', () => {
            finalResultContainer.style.display = 'none';
            initGame();
        });
        
        exitBtn.addEventListener('click', () => {
            if (isCompleted) {
                alert('Молодец! Ты успешно определил количество звуков и букв во всех словах!');
            } else {
                alert('Возвращайся, чтобы завершить задание!');
            }
        });
        
        // Обработчик нажатия клавиши Enter в полях ввода
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // Если нажат Enter, проверяем все ответы
                checkAllAnswers();
            }
        });