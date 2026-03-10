        // Слова для задания с правильными ответами (слоги, буквы, звуки)
        const wordsData = [
            // Уровень 1
            [
                {word: "Письмо", syllables: 2, letters: 6, sounds: 5},
                {word: "Ёжик", syllables: 2, letters: 4, sounds: 5},
                {word: "Юла", syllables: 2, letters: 3, sounds: 4}
            ],
            // Уровень 2
            [
                {word: "Яблоня", syllables: 3, letters: 6, sounds: 7},
                {word: "Пальто", syllables: 2, letters: 6, sounds: 5},
                {word: "Подушка", syllables: 3, letters: 7, sounds: 7}
            ],
            // Уровень 3
            [
                {word: "Морковка", syllables: 3, letters: 8, sounds: 8},
                {word: "Варежки", syllables: 3, letters: 7, sounds: 7},
                {word: "Карандаш", syllables: 3, letters: 8, sounds: 8}
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
            taskTitle.textContent = 'Определи количество слогов, звуков и букв';
            
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
                const syllablesRow = document.createElement('div');
                syllablesRow.className = 'input-row';
                
                const syllablesLabel = document.createElement('div');
                syllablesLabel.className = 'input-label';
                syllablesLabel.textContent = 'Слоги:';
                
                const syllablesInput = document.createElement('input');
                syllablesInput.type = 'number';
                syllablesInput.min = '1';
                syllablesInput.max = '6';
                syllablesInput.className = 'number-input';
                syllablesInput.id = `${cardId}-syllables`;
                syllablesInput.dataset.word = wordData.word;
                syllablesInput.dataset.type = 'syllables';
                syllablesInput.dataset.correct = wordData.syllables;
                
                // Обработчик изменения значения
                syllablesInput.addEventListener('input', function() {
                    handleInputChange(this);
                });
                
                syllablesRow.appendChild(syllablesLabel);
                syllablesRow.appendChild(syllablesInput);
                wordCard.appendChild(syllablesRow);
                
                // Добавляем поле для букв
                const lettersRow = document.createElement('div');
                lettersRow.className = 'input-row';
                
                const lettersLabel = document.createElement('div');
                lettersLabel.className = 'input-label';
                lettersLabel.textContent = 'Буквы:';
                
                const lettersInput = document.createElement('input');
                lettersInput.type = 'number';
                lettersInput.min = '1';
                lettersInput.max = '10';
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
                
                // Добавляем поле для звуков
                const soundsRow = document.createElement('div');
                soundsRow.className = 'input-row';
                
                const soundsLabel = document.createElement('div');
                soundsLabel.className = 'input-label';
                soundsLabel.textContent = 'Звуки:';
                
                const soundsInput = document.createElement('input');
                soundsInput.type = 'number';
                soundsInput.min = '1';
                soundsInput.max = '10';
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
                userAnswers.set(word, {syllables: null, letters: null, sounds: null});
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
                if (!userAnswer || userAnswer.syllables === null || userAnswer.letters === null || userAnswer.sounds === null) {
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
                const syllablesInput = card.querySelector(`input[data-type="syllables"]`);
                const lettersInput = card.querySelector(`input[data-type="letters"]`);
                const soundsInput = card.querySelector(`input[data-type="sounds"]`);
                
                // Проверяем правильность
                const isSyllablesCorrect = userAnswer.syllables === wordData.syllables;
                const isLettersCorrect = userAnswer.letters === wordData.letters;
                const isSoundsCorrect = userAnswer.sounds === wordData.sounds;
                
                // Обновляем стили полей ввода
                if (isSyllablesCorrect) {
                    syllablesInput.classList.add('correct');
                    syllablesInput.classList.remove('incorrect');
                } else {
                    syllablesInput.classList.add('incorrect');
                    syllablesInput.classList.remove('correct');
                }
                
                if (isLettersCorrect) {
                    lettersInput.classList.add('correct');
                    lettersInput.classList.remove('incorrect');
                } else {
                    lettersInput.classList.add('incorrect');
                    lettersInput.classList.remove('correct');
                }
                
                if (isSoundsCorrect) {
                    soundsInput.classList.add('correct');
                    soundsInput.classList.remove('incorrect');
                } else {
                    soundsInput.classList.add('incorrect');
                    soundsInput.classList.remove('correct');
                }
                
                // Обновляем стиль карточки
                if (isSyllablesCorrect && isLettersCorrect && isSoundsCorrect) {
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
                if (answer && answer.syllables !== null && answer.letters !== null && answer.sounds !== null) {
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
            levelCompleteMessage.textContent = `Отлично! Ты правильно определил количество слогов, звуков и букв!`;
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            finalRewardMessageElement.textContent = `Ты справился со всеми заданиями!`;
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
                alert('Молодец! Ты успешно определил количество слогов, звуков и букв во всех словах!');
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