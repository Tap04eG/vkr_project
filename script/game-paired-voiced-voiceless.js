// Парные согласные по звонкости/глухости из вашего задания
        const voicedConsonants = ['Б', 'В', 'Д', 'З', 'Ж', 'Г']; // Звонкие (парные)
        const voicelessConsonants = ['П', 'Ф', 'Т', 'С', 'Ш', 'К']; // Глухие (парные)
        
        // Разделяем на два уровня по 3 пары в каждом
        const level1Voiced = ['Б', 'В', 'Д']; // 3 звонкие для уровня 1
        const level1Voiceless = ['П', 'Ф', 'Т']; // 3 глухие для уровня 1
        
        const level2Voiced = ['З', 'Ж', 'Г']; // 3 звонкие для уровня 2
        const level2Voiceless = ['С', 'Ш', 'К']; // 3 глухие для уровня 2
        
        // Переменные состояния игры
        let currentLevel = 1;
        let currentVoiced = [];
        let currentVoiceless = [];
        let placedVoiced = [];
        let placedVoiceless = [];
        let isCompleted = false;
        let usedLetters = new Map(); // Храним ID буквы и её тип
        
        // Элементы DOM
        const lettersContainer = document.getElementById('letters-container');
        const voicedDropzone = document.getElementById('voiced-dropzone');
        const voicelessDropzone = document.getElementById('voiceless-dropzone');
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
        const voicedCountElement = document.getElementById('voiced-count');
        const voicelessCountElement = document.getElementById('voiceless-count');
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
                currentVoiced = [...level1Voiced];
                currentVoiceless = [...level1Voiceless];
                levelInfoElement.textContent = 'Уровень 1 из 2';
                taskTitle.textContent = 'Распредели парные согласные по звонкости/глухости';
            } else {
                currentVoiced = [...level2Voiced];
                currentVoiceless = [...level2Voiceless];
                levelInfoElement.textContent = 'Уровень 2 из 2';
                taskTitle.textContent = 'Распредели парные согласные по звонкости/глухости';
            }
            
            // Всегда по 3 буквы в каждой колонке
            voicedDropzone.dataset.max = '3';
            voicelessDropzone.dataset.max = '3';
            voicedCountElement.textContent = 'Звонких: 0/3';
            voicelessCountElement.textContent = 'Глухих: 0/3';
            
            // Сброс состояния
            placedVoiced = [];
            placedVoiceless = [];
            usedLetters.clear();
            
            // Очистка контейнеров
            lettersContainer.innerHTML = '';
            voicedDropzone.innerHTML = '';
            voicelessDropzone.innerHTML = '';
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Сбрасываем стили зон
            voicedDropzone.classList.remove('full');
            voicelessDropzone.classList.remove('full');
            
            // Обновляем прогресс
            updateProgress();
            
            // Создание букв для перетаскивания (в перемешанном порядке)
            createDraggableLetters();
            
            // Добавляем обработчики событий для зон перетаскивания
            setupDropzones();
        }
        
        // Настройка зон перетаскивания
        function setupDropzones() {
            // Для зоны звонких
            voicedDropzone.addEventListener('dragover', handleDragOverDropzone);
            voicedDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            voicedDropzone.addEventListener('drop', handleDropDropzone);
            
            // Для зоны глухих
            voicelessDropzone.addEventListener('dragover', handleDragOverDropzone);
            voicelessDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            voicelessDropzone.addEventListener('drop', handleDropDropzone);
            
            // Также добавляем обработчики для самих контейнеров с буквами
            lettersContainer.addEventListener('dragover', handleDragOverContainer);
            lettersContainer.addEventListener('dragleave', handleDragLeaveContainer);
            lettersContainer.addEventListener('drop', handleDropContainer);
        }
        
        // Создание перетаскиваемых букв
        function createDraggableLetters() {
            // Объединяем буквы для текущего уровня
            const levelLetters = [...currentVoiced, ...currentVoiceless];
            
            // Перемешиваем буквы
            const shuffledLetters = [...levelLetters].sort(() => Math.random() - 0.5);
            
            shuffledLetters.forEach((letter, index) => {
                const letterElement = document.createElement('div');
                letterElement.className = 'letter';
                letterElement.textContent = letter;
                letterElement.draggable = true;
                letterElement.dataset.letter = letter;
                letterElement.dataset.index = index;
                letterElement.dataset.type = currentVoiced.includes(letter) ? 'voiced' : 'voiceless';
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
            if (dropzoneType === 'voiced') {
                placedVoiced.push(letter);
            } else {
                placedVoiceless.push(letter);
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
                if (zone.dataset.type === 'voiced') {
                    const index = placedVoiced.indexOf(letter);
                    if (index > -1) placedVoiced.splice(index, 1);
                } else {
                    const index = placedVoiceless.indexOf(letter);
                    if (index > -1) placedVoiceless.splice(index, 1);
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
            const voicedCount = placedVoiced.length;
            const voicelessCount = placedVoiceless.length;
            
            voicedCountElement.textContent = `Звонких: ${voicedCount}/3`;
            voicelessCountElement.textContent = `Глухих: ${voicelessCount}/3`;
            
            // Обновляем стили зон, если они заполнены
            if (voicedCount >= 3) {
                voicedDropzone.classList.add('full');
            } else {
                voicedDropzone.classList.remove('full');
            }
            
            if (voicelessCount >= 3) {
                voicelessDropzone.classList.add('full');
            } else {
                voicelessDropzone.classList.remove('full');
            }
        }
        
        // Проверка завершения уровня
        function checkIfLevelComplete() {
            const totalLetters = currentVoiced.length + currentVoiceless.length;
            
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
            
            // Проверяем, все ли звонкие размещены правильно
            const allVoicedPlaced = arraysEqualIgnoreOrder(placedVoiced, currentVoiced);
            
            // Проверяем, все ли глухие размещены правильно
            const allVoicelessPlaced = arraysEqualIgnoreOrder(placedVoiceless, currentVoiceless);
            
            // Проверяем правильность каждой буквы в зонах
            const voicedLetters = document.querySelectorAll('#voiced-dropzone .dropped-letter');
            const voicelessLetters = document.querySelectorAll('#voiceless-dropzone .dropped-letter');
            
            // Подсвечиваем правильные и неправильные буквы
            voicedLetters.forEach(letter => {
                const isCorrect = letter.dataset.isCorrect === 'true';
                if (isCorrect) {
                    letter.style.backgroundColor = '#BBDEFB';
                    letter.style.borderColor = '#1976D2';
                } else {
                    letter.style.backgroundColor = '#FFCDD2';
                    letter.style.borderColor = '#F44336';
                    allCorrect = false;
                }
            });
            
            voicelessLetters.forEach(letter => {
                const isCorrect = letter.dataset.isCorrect === 'true';
                if (isCorrect) {
                    letter.style.backgroundColor = '#FFE0B2';
                    letter.style.borderColor = '#F57C00';
                } else {
                    letter.style.backgroundColor = '#FFCDD2';
                    letter.style.borderColor = '#F44336';
                    allCorrect = false;
                }
            });
            
            if (allCorrect && allVoicedPlaced && allVoicelessPlaced) {
                // Уровень пройден успешно
                taskStatus.textContent = 'Правильно! Все буквы распределены верно!';
                taskStatus.className = 'task-status completed';
                
                // Обновляем прогресс
                updateProgress();
                
                // Показываем экран завершения уровня
                if (currentLevel < 2) {
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
            placedVoiced = [];
            placedVoiceless = [];
            
            // Сбрасываем статус
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Сбрасываем счетчики
            updateCounters();
            
            // Обновляем прогресс
            updateProgress();
        }
        
        // Показ экрана завершения уровня
        function showLevelComplete() {
            const messages = [
                'Отлично! Ты правильно распределил парные согласные Б-П, В-Ф, Д-Т!',
                'Отлично! Ты правильно распределил парные согласные З-С, Ж-Ш, Г-К!'
            ];
            
            levelCompleteTitle.textContent = 'Уровень пройден!';
            levelCompleteMessage.textContent = messages[currentLevel - 1];
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            finalRewardMessageElement.textContent = 'Поздравляем! Ты справился со всеми 6 парами согласных по звонкости/глухости!';
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
            const totalLetters = 6; // Всегда 3+3 на каждом уровне
            const placedLetters = usedLetters.size;
            
            const progressPercentage = (placedLetters / totalLetters) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `Прогресс: ${placedLetters}/${totalLetters}`;
        }
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', initGame);
        
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
                alert('Молодец! Ты успешно распределил все 6 пар согласных по звонкости/глухости!');
            } else {
                alert('Возвращайся, чтобы завершить все два уровня!');
            }
        });