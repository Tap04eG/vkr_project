        // Слова для задания с правильными ответами (количество слогов)
        const wordsData = [
            // Уровень 1 (слова из первого блока)
            [
                {word: "Телевизор", syllables: 4},
                {word: "Дерево", syllables: 3},
                {word: "Лампочка", syllables: 3},
                {word: "Чашка", syllables: 2}
            ],
            // Уровень 2 (слова из второго блока)
            [
                {word: "Вилка", syllables: 2},
                {word: "Кружка", syllables: 2},
                {word: "Полка", syllables: 2},
                {word: "Красный", syllables: 2}
            ],
            // Уровень 3 (слова из третьего блока)
            [
                {word: "Зеркало", syllables: 3},
                {word: "Телефон", syllables: 3},
                {word: "Обои", syllables: 3},
                {word: "Слон", syllables: 1}
            ],
            // Уровень 4 (слова из четвертого блока)
            [
                {word: "Тигр", syllables: 1},
                {word: "Лев", syllables: 1},
                {word: "Собака", syllables: 3},
                {word: "Йод", syllables: 1}
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
            taskTitle.textContent = 'Определи количество слогов';
            
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
                
                // Добавляем поле для слогов
                const syllablesLabel = document.createElement('div');
                syllablesLabel.className = 'syllables-input-label';
                syllablesLabel.textContent = 'Слоги:';
                wordCard.appendChild(syllablesLabel);
                
                const syllablesInput = document.createElement('input');
                syllablesInput.type = 'number';
                syllablesInput.min = '1';
                syllablesInput.max = '6';
                syllablesInput.className = 'syllables-input';
                syllablesInput.id = `${cardId}-syllables`;
                syllablesInput.dataset.word = wordData.word;
                syllablesInput.dataset.correct = wordData.syllables;
                
                // Обработчик изменения значения
                syllablesInput.addEventListener('input', function() {
                    handleInputChange(this);
                });
                
                wordCard.appendChild(syllablesInput);
                
                // Добавляем карточку в контейнер
                wordsContainer.appendChild(wordCard);
            });
        }
        
        // Обработчик изменения значения в поле ввода
        function handleInputChange(inputElement) {
            const word = inputElement.dataset.word;
            const value = parseInt(inputElement.value) || 0;
            
            // Сбрасываем стиль при новом вводе
            inputElement.classList.remove('correct', 'incorrect');
            
            // Сбрасываем стиль карточки
            const card = inputElement.closest('.word-card');
            card.classList.remove('correct', 'incorrect');
            
            // Сохраняем ответ пользователя
            userAnswers.set(word, value);
            
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
                if (!userAnswer || userAnswer === 0) {
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
                const syllablesInput = card.querySelector(`input.syllables-input`);
                
                // Проверяем правильность
                const isCorrect = userAnswer === wordData.syllables;
                
                // Обновляем стили полей ввода
                if (isCorrect) {
                    syllablesInput.classList.add('correct');
                    syllablesInput.classList.remove('incorrect');
                    correctCount++;
                    checkedAnswers.set(wordData.word, true);
                } else {
                    syllablesInput.classList.add('incorrect');
                    syllablesInput.classList.remove('correct');
                    checkedAnswers.set(wordData.word, false);
                }
                
                // Обновляем стиль карточки
                if (isCorrect) {
                    card.classList.add('correct');
                    card.classList.remove('incorrect');
                } else {
                    card.classList.add('incorrect');
                    card.classList.remove('correct');
                    
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
                if (answer && answer !== 0) {
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
            levelCompleteMessage.textContent = `Отлично! Ты правильно определил количество слогов в ${score} словах!`;
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            const totalPossible = wordsData.reduce((sum, level) => sum + level.length, 0);
            const finalScore = score; // Последний счет уровня
            finalRewardMessageElement.textContent = `Ты справился со всеми заданиями! Правильных ответов: ${finalScore} из ${totalPossible}`;
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
                alert('Молодец! Ты успешно определил количество слогов во всех словах!');
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