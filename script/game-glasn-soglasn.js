// Все гласные и согласные буквы русского алфавита
        const allVowels = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
        const allConsonants = ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'Й', 'К', 'Л', 'М', 'Н', 'П', 'Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ'];
        
        // Разделяем буквы на два уровня
        const level1Vowels = ['А', 'Е', 'И', 'О', 'У']; // 5 гласных для уровня 1
        const level1Consonants = ['Б', 'В', 'Г', 'Д', 'Ж', 'З', 'К', 'Л', 'М', 'Н', 'П']; // 11 согласных для уровня 1
        
        const level2Vowels = ['Ё', 'Ы', 'Э', 'Ю', 'Я']; // Оставшиеся 5 гласных для уровня 2
        const level2Consonants = ['Р', 'С', 'Т', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Й']; // Оставшиеся 10 согласных для уровня 2
        
        // Переменные состояния игры
        let currentLevel = 1;
        let currentVowels = [];
        let currentConsonants = [];
        let placedVowels = [];
        let placedConsonants = [];
        let isCompleted = false;
        let usedLetters = new Map(); // Храним ID буквы и её тип
        
        // Элементы DOM
        const lettersContainer = document.getElementById('letters-container');
        const vowelsDropzone = document.getElementById('vowels-dropzone');
        const consonantsDropzone = document.getElementById('consonants-dropzone');
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
        const vowelsCountElement = document.getElementById('vowels-count');
        const consonantsCountElement = document.getElementById('consonants-count');
        const levelInfoElement = document.getElementById('level-info');
        
        // Переменные для отслеживания перетаскивания
        let dragOverTarget = null;
        
        // Инициализация игры
        function initGame() {
            // Сброс состояния игры
            currentLevel = 1;
            isCompleted = false;
            usedLetters.clear();
            updateProgress();
            finalResultContainer.style.display = 'none';
            levelCompleteContainer.style.display = 'none';
            
            // Загрузка первого уровня
            loadLevel(1);
        }
        
        // Загрузка уровня
        function loadLevel(level) {
            currentLevel = level;
            
            // Устанавливаем буквы для текущего уровня
            if (level === 1) {
                currentVowels = [...level1Vowels];
                currentConsonants = [...level1Consonants];
                levelInfoElement.textContent = 'Уровень 1 из 2';
                taskTitle.textContent = 'Распредели буквы по столбцам';
                vowelsDropzone.dataset.max = '5';
                consonantsDropzone.dataset.max = '11';
                vowelsCountElement.textContent = 'Гласных: 0/5';
                consonantsCountElement.textContent = 'Согласных: 0/11';
            } else {
                currentVowels = [...level2Vowels];
                currentConsonants = [...level2Consonants];
                levelInfoElement.textContent = 'Уровень 2 из 2';
                taskTitle.textContent = 'Распредели оставшиеся буквы';
                vowelsDropzone.dataset.max = '5';
                consonantsDropzone.dataset.max = '10';
                vowelsCountElement.textContent = 'Гласных: 0/5';
                consonantsCountElement.textContent = 'Согласных: 0/10';
            }
            
            // Сброс состояния
            placedVowels = [];
            placedConsonants = [];
            usedLetters.clear();
            
            // Очистка контейнеров
            lettersContainer.innerHTML = '';
            vowelsDropzone.innerHTML = '';
            consonantsDropzone.innerHTML = '';
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Сбрасываем стили зон
            vowelsDropzone.classList.remove('full');
            consonantsDropzone.classList.remove('full');
            
            // Обновляем прогресс
            updateProgress();
            
            // Создание букв для перетаскивания (в перемешанном порядке)
            createDraggableLetters();
            
            // Добавляем обработчики событий для зон перетаскивания
            setupDropzones();
        }
        
        // Настройка зон перетаскивания
        function setupDropzones() {
            // Для зоны гласных
            vowelsDropzone.addEventListener('dragover', handleDragOverDropzone);
            vowelsDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            vowelsDropzone.addEventListener('drop', handleDropDropzone);
            
            // Для зоны согласных
            consonantsDropzone.addEventListener('dragover', handleDragOverDropzone);
            consonantsDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            consonantsDropzone.addEventListener('drop', handleDropDropzone);
            
            // Также добавляем обработчики для самих контейнеров с буквами
            lettersContainer.addEventListener('dragover', handleDragOverContainer);
            lettersContainer.addEventListener('dragleave', handleDragLeaveContainer);
            lettersContainer.addEventListener('drop', handleDropContainer);
        }
        
        // Создание перетаскиваемых букв
        function createDraggableLetters() {
            // Объединяем буквы для текущего уровня
            const levelLetters = [...currentVowels, ...currentConsonants];
            
            // Перемешиваем буквы
            const shuffledLetters = [...levelLetters].sort(() => Math.random() - 0.5);
            
            shuffledLetters.forEach((letter, index) => {
                const letterElement = document.createElement('div');
                letterElement.className = 'letter';
                letterElement.textContent = letter;
                letterElement.draggable = true;
                letterElement.dataset.letter = letter;
                letterElement.dataset.index = index;
                letterElement.dataset.type = currentVowels.includes(letter) ? 'vowel' : 'consonant';
                letterElement.id = `letter-${currentLevel}-${index}`;
                
                // Добавляем обработчики событий для перетаскивания
                letterElement.addEventListener('dragstart', handleDragStart);
                letterElement.addEventListener('dragend', handleDragEnd);
                
                lettersContainer.appendChild(letterElement);
            });
        }
        
        // Обработчик начала перетаскивания
        function handleDragStart(e) {
            if (e.target.classList.contains('used')) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', e.target.dataset.letter);
            e.dataTransfer.setData('index', e.target.dataset.index);
            e.dataTransfer.setData('type', e.target.dataset.type);
            e.dataTransfer.setData('id', e.target.id);
            e.target.classList.add('dragging');
        }
        
        // Обработчик окончания перетаскивания
        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
            // Убираем highlight со всех зон
            document.querySelectorAll('.column-dropzone, #letters-container').forEach(zone => {
                zone.classList.remove('highlight');
            });
        }
        
        // Обработчик наведения на зону перетаскивания
        function handleDragOverDropzone(e) {
            e.preventDefault();
            const dropzoneType = e.target.dataset.type;
            const maxCount = parseInt(e.target.dataset.max);
            const currentCount = e.target.children.length;
            
            // Подсвечиваем только если есть место
            if (currentCount < maxCount) {
                e.target.classList.add('highlight');
                dragOverTarget = e.target;
            } else {
                e.target.classList.add('full');
            }
        }
        
        // Обработчик наведения на контейнер с буквами
        function handleDragOverContainer(e) {
            e.preventDefault();
            e.target.classList.add('highlight');
            dragOverTarget = e.target;
        }
        
        // Обработчик ухода с зоны перетаскивания
        function handleDragLeaveDropzone(e) {
            e.preventDefault();
            e.target.classList.remove('highlight');
            e.target.classList.remove('full');
        }
        
        // Обработчик ухода с контейнера с буквами
        function handleDragLeaveContainer(e) {
            e.preventDefault();
            e.target.classList.remove('highlight');
        }
        
        // Обработчик сброса на зону перетаскивания
        function handleDropDropzone(e) {
            e.preventDefault();
            e.target.classList.remove('highlight');
            e.target.classList.remove('full');
            
            const letter = e.dataTransfer.getData('text/plain');
            const index = e.dataTransfer.getData('index');
            const letterId = e.dataTransfer.getData('id');
            const letterType = e.dataTransfer.getData('type');
            const dropzoneType = e.target.dataset.type;
            const maxCount = parseInt(e.target.dataset.max);
            
            // Проверяем, есть ли место в зоне
            if (e.target.children.length >= maxCount) {
                taskStatus.textContent = 'В этом столбце уже достаточно букв!';
                taskStatus.className = 'task-status not-completed';
                setTimeout(() => {
                    taskStatus.textContent = '';
                    taskStatus.className = 'task-status';
                }, 1500);
                return;
            }
            
            // Проверяем, правильный ли тип зоны для этой буквы
            const isCorrectType = letterType === dropzoneType;
            
            // Если буква уже была использована, удаляем ее из предыдущей зоны
            if (usedLetters.has(letterId)) {
                removeLetterFromZone(letterId);
            }
            
            // Создаем элемент для буквы в зоне
            const droppedLetter = document.createElement('div');
            droppedLetter.className = 'dropped-letter';
            droppedLetter.textContent = letter;
            droppedLetter.dataset.letterId = letterId;
            droppedLetter.dataset.letter = letter;
            droppedLetter.dataset.type = letterType;
            droppedLetter.dataset.isCorrect = isCorrectType;
            
            // Добавляем обработчик для возврата буквы обратно
            droppedLetter.addEventListener('click', handleReturnLetter);
            
            // Добавляем в соответствующую зону
            e.target.appendChild(droppedLetter);
            
            // Обновляем массивы с расставленными буквами
            if (dropzoneType === 'vowel') {
                placedVowels.push(letter);
            } else {
                placedConsonants.push(letter);
            }
            
            // Помечаем букву как использованную
            const draggedElement = document.getElementById(letterId);
            if (draggedElement) {
                draggedElement.classList.add('used');
                draggedElement.draggable = false;
                usedLetters.set(letterId, {type: letterType, element: draggedElement});
            }
            
            // Обновляем счетчики
            updateCounters();
            
            // Проверяем, все ли буквы расставлены
            checkIfLevelComplete();
        }
        
        // Обработчик сброса на контейнер с буквами
        function handleDropContainer(e) {
            e.preventDefault();
            e.target.classList.remove('highlight');
            
            const letterId = e.dataTransfer.getData('id');
            
            // Если буква уже была использована, возвращаем ее обратно
            if (usedLetters.has(letterId)) {
                removeLetterFromZone(letterId);
            }
        }
        
        // Обработчик возврата буквы обратно в контейнер
        function handleReturnLetter(e) {
            const droppedLetter = e.currentTarget;
            const letterId = droppedLetter.dataset.letterId;
            
            removeLetterFromZone(letterId);
        }
        
        // Удаление буквы из зоны
        function removeLetterFromZone(letterId) {
            // Находим букву в зонах
            const droppedLetter = document.querySelector(`.dropped-letter[data-letter-id="${letterId}"]`);
            if (droppedLetter) {
                const zone = droppedLetter.parentElement;
                const letter = droppedLetter.dataset.letter;
                
                // Удаляем из соответствующего массива
                if (zone.dataset.type === 'vowel') {
                    const index = placedVowels.indexOf(letter);
                    if (index > -1) placedVowels.splice(index, 1);
                } else {
                    const index = placedConsonants.indexOf(letter);
                    if (index > -1) placedConsonants.splice(index, 1);
                }
                
                // Удаляем элемент
                droppedLetter.remove();
            }
            
            // Возвращаем букву в исходное состояние
            const letterInfo = usedLetters.get(letterId);
            if (letterInfo) {
                const originalLetter = letterInfo.element;
                originalLetter.classList.remove('used');
                originalLetter.draggable = true;
                usedLetters.delete(letterId);
            }
            
            // Обновляем счетчики
            updateCounters();
            
            // Обновляем прогресс
            updateProgress();
            
            // Очищаем статус
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
        }
        
        // Обновление счетчиков букв
        function updateCounters() {
            const vowelCount = placedVowels.length;
            const consonantCount = placedConsonants.length;
            
            vowelsCountElement.textContent = `Гласных: ${vowelCount}/${currentLevel === 1 ? '5' : '5'}`;
            consonantsCountElement.textContent = `Согласных: ${consonantCount}/${currentLevel === 1 ? '11' : '10'}`;
            
            // Обновляем стили зон, если они заполнены
            const maxVowels = currentLevel === 1 ? 5 : 5;
            const maxConsonants = currentLevel === 1 ? 11 : 10;
            
            if (vowelCount >= maxVowels) {
                vowelsDropzone.classList.add('full');
            } else {
                vowelsDropzone.classList.remove('full');
            }
            
            if (consonantCount >= maxConsonants) {
                consonantsDropzone.classList.add('full');
            } else {
                consonantsDropzone.classList.remove('full');
            }
        }
        
        // Проверка завершения уровня
        function checkIfLevelComplete() {
            const totalLetters = currentVowels.length + currentConsonants.length;
            
            if (usedLetters.size === totalLetters) {
                // Проверяем правильность распределения
                setTimeout(() => {
                    checkLevelDistribution();
                }, 300);
            }
        }
        
        // Проверка правильности распределения букв на уровне
        function checkLevelDistribution() {
            let allCorrect = true;
            
            // Проверяем, все ли гласные размещены правильно
            const allVowelsPlaced = arraysEqualIgnoreOrder(placedVowels, currentVowels);
            
            // Проверяем, все ли согласные размещены правильно
            const allConsonantsPlaced = arraysEqualIgnoreOrder(placedConsonants, currentConsonants);
            
            // Проверяем правильность каждой буквы в зонах
            const vowelLetters = document.querySelectorAll('#vowels-dropzone .dropped-letter');
            const consonantLetters = document.querySelectorAll('#consonants-dropzone .dropped-letter');
            
            // Подсвечиваем правильные и неправильные буквы
            vowelLetters.forEach(letter => {
                const isCorrect = letter.dataset.isCorrect === 'true';
                if (isCorrect) {
                    letter.style.backgroundColor = '#C8E6C9';
                    letter.style.borderColor = '#4CAF50';
                } else {
                    letter.style.backgroundColor = '#FFCDD2';
                    letter.style.borderColor = '#F44336';
                    allCorrect = false;
                }
            });
            
            consonantLetters.forEach(letter => {
                const isCorrect = letter.dataset.isCorrect === 'true';
                if (isCorrect) {
                    letter.style.backgroundColor = '#C8E6C9';
                    letter.style.borderColor = '#4CAF50';
                } else {
                    letter.style.backgroundColor = '#FFCDD2';
                    letter.style.borderColor = '#F44336';
                    allCorrect = false;
                }
            });
            
            if (allCorrect && allVowelsPlaced && allConsonantsPlaced) {
                // Уровень пройден успешно
                taskStatus.textContent = 'Правильно! Все буквы распределены верно!';
                taskStatus.className = 'task-status completed';
                
                // Обновляем прогресс
                updateProgress();
                
                // Показываем экран завершения уровня
                if (currentLevel === 1) {
                    showLevelComplete();
                } else {
                    showFinalResults();
                }
            } else {
                taskStatus.textContent = 'Есть ошибки! Попробуй еще раз.';
                taskStatus.className = 'task-status not-completed';
                
                // Автоматический сброс уровня через 2 секунды
                setTimeout(() => {
                    resetLevel();
                }, 2000);
            }
        }
        
        // Автоматический сброс уровня
        function resetLevel() {
            // Возвращаем все буквы в исходный контейнер
            const usedLetterIds = Array.from(usedLetters.keys());
            usedLetterIds.forEach(letterId => {
                removeLetterFromZone(letterId);
            });
            
            // Сбрасываем массивы
            placedVowels = [];
            placedConsonants = [];
            
            // Сбрасываем статус
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Обновляем счетчики
            updateCounters();
            
            // Обновляем прогресс
            updateProgress();
        }
        
        // Показ экрана завершения уровня
        function showLevelComplete() {
            levelCompleteTitle.textContent = 'Уровень пройден!';
            levelCompleteMessage.textContent = 'Отлично! Ты правильно распределил 5 гласных и 11 согласных букв!';
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            finalRewardMessageElement.textContent = 'Ты справился со всеми заданиями!';
            finalResultContainer.style.display = 'block';
            finalResultContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Сравнение массивов без учета порядка
        function arraysEqualIgnoreOrder(arr1, arr2) {
            if (arr1.length !== arr2.length) return false;
            const sorted1 = [...arr1].sort();
            const sorted2 = [...arr2].sort();
            return sorted1.every((value, index) => value === sorted2[index]);
        }
        
        // Обновление прогресса
        function updateProgress() {
            let totalLetters, placedLetters;
            
            if (currentLevel === 1) {
                totalLetters = 16; // 5 гласных + 11 согласных
                placedLetters = usedLetters.size;
            } else {
                totalLetters = 15; // 5 гласных + 10 согласных
                placedLetters = usedLetters.size;
            }
            
            const progressPercentage = (placedLetters / totalLetters) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `Прогресс: ${placedLetters}/${totalLetters}`;
        }
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', initGame);
        
        // Обработчик кнопки перехода на следующий уровень
        nextLevelButton.addEventListener('click', () => {
            levelCompleteContainer.style.display = 'none';
            loadLevel(2);
        });
        
        // Обработчики финальных кнопок
        restartBtn.addEventListener('click', () => {
            finalResultContainer.style.display = 'none';
            initGame();
        });
        
        exitBtn.addEventListener('click', () => {
            if (isCompleted) {
                alert('Молодец! Ты успешно распределил все буквы русского алфавита!');
            } else {
                alert('Возвращайся, чтобы завершить задание!');
            }
        });