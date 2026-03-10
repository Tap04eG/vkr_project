let currentLevel = 1;
let currentVoicedUnpaired = [];
let currentVoicelessUnpaired = [];
        let placedVoicedUnpaired = [];
        let placedVoicelessUnpaired = [];
        let isCompleted = false;
        let usedLetters = new Map(); // Храним ID буквы и её тип
        
        // Элементы DOM
        const lettersContainer = document.getElementById('letters-container');
        const voicedUnpairedDropzone = document.getElementById('voiced-unpaired-dropzone');
        const voicelessUnpairedDropzone = document.getElementById('voiceless-unpaired-dropzone');
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
        const voicedUnpairedCountElement = document.getElementById('voiced-unpaired-count');
        const voicelessUnpairedCountElement = document.getElementById('voiceless-unpaired-count');
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
                currentVoicedUnpaired = [...level1VoicedUnpaired];
                currentVoicelessUnpaired = [...level1VoicelessUnpaired];
                levelInfoElement.textContent = 'Уровень 1 из 2';
                taskTitle.textContent = 'Распредели непарные согласные по звонкости/глухости';
            } else {
                currentVoicedUnpaired = [...level2VoicedUnpaired];
                currentVoicelessUnpaired = [...level2VoicelessUnpaired];
                levelInfoElement.textContent = 'Уровень 2 из 2';
                taskTitle.textContent = 'Распредели непарные согласные по звонкости/глухости';
            }
            
            // Всегда по 4 буквы в каждой колонке
            voicedUnpairedDropzone.dataset.max = '4';
            voicelessUnpairedDropzone.dataset.max = '4';
            voicedUnpairedCountElement.textContent = 'Только звонких: 0/4';
            voicelessUnpairedCountElement.textContent = 'Только глухих: 0/4';
            
            // Сброс состояния
            placedVoicedUnpaired = [];
            placedVoicelessUnpaired = [];
            usedLetters.clear();
            
            // Очистка контейнеров
            lettersContainer.innerHTML = '';
            voicedUnpairedDropzone.innerHTML = '';
            voicelessUnpairedDropzone.innerHTML = '';
            taskStatus.textContent = '';
            taskStatus.className = 'task-status';
            
            // Сбрасываем стили зон
            voicedUnpairedDropzone.classList.remove('full');
            voicelessUnpairedDropzone.classList.remove('full');
            
            // Обновляем прогресс
            updateProgress();
            
            // Создание букв для перетаскивания (в перемешанном порядке)
            createDraggableLetters();
            
            // Добавляем обработчики событий для зон перетаскивания
            setupDropzones();
        }
        
        // Настройка зон перетаскивания
        function setupDropzones() {
            // Для зоны только звонких
            voicedUnpairedDropzone.addEventListener('dragover', handleDragOverDropzone);
            voicedUnpairedDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            voicedUnpairedDropzone.addEventListener('drop', handleDropDropzone);
            
            // Для зоны только глухих
            voicelessUnpairedDropzone.addEventListener('dragover', handleDragOverDropzone);
            voicelessUnpairedDropzone.addEventListener('dragleave', handleDragLeaveDropzone);
            voicelessUnpairedDropzone.addEventListener('drop', handleDropDropzone);
            
            // Также добавляем обработчики для самих контейнеров с буквами
            lettersContainer.addEventListener('dragover', handleDragOverContainer);
            lettersContainer.addEventListener('dragleave', handleDragLeaveContainer);
            lettersContainer.addEventListener('drop', handleDropContainer);
        }
        
        // Создание перетаскиваемых букв
        function createDraggableLetters() {
            // Объединяем буквы для текущего уровня
            const levelLetters = [...currentVoicedUnpaired, ...currentVoicelessUnpaired];
            
            // Перемешиваем буквы
            const shuffledLetters = [...levelLetters].sort(() => Math.random() - 0.5);
            
            shuffledLetters.forEach((letter, index) => {
                const letterElement = document.createElement('div');
                letterElement.className = 'letter';
                letterElement.textContent = letter;
                letterElement.draggable = true;
                letterElement.dataset.letter = letter;
                letterElement.dataset.index = index;
                letterElement.dataset.type = currentVoicedUnpaired.includes(letter) ? 'voiced-unpaired' : 'voiceless-unpaired';
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
            if (dropzoneType === 'voiced-unpaired') {
                placedVoicedUnpaired.push(letter);
            } else {
                placedVoicelessUnpaired.push(letter);
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
                if (zone.dataset.type === 'voiced-unpaired') {
                    const index = placedVoicedUnpaired.indexOf(letter);
                    if (index > -1) placedVoicedUnpaired.splice(index, 1);
                } else {
                    const index = placedVoicelessUnpaired.indexOf(letter);
                    if (index > -1) placedVoicelessUnpaired.splice(index, 1);
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
            const voicedUnpairedCount = placedVoicedUnpaired.length;
            const voicelessUnpairedCount = placedVoicelessUnpaired.length;
            
            voicedUnpairedCountElement.textContent = `Только звонких: ${voicedUnpairedCount}/4`;
            voicelessUnpairedCountElement.textContent = `Только глухих: ${voicelessUnpairedCount}/4`;
            
            // Обновляем стили зон, если они заполнены
            if (voicedUnpairedCount >= 4) {
                voicedUnpairedDropzone.classList.add('full');
            } else {
                voicedUnpairedDropzone.classList.remove('full');
            }
            
            if (voicelessUnpairedCount >= 4) {
                voicelessUnpairedDropzone.classList.add('full');
            } else {
                voicelessUnpairedDropzone.classList.remove('full');
            }
        }
        
        // Проверка завершения уровня
        function checkIfLevelComplete() {
            const totalLetters = currentVoicedUnpaired.length + currentVoicelessUnpaired.length;
            
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
            
            // Проверяем, все ли только звонкие размещены правильно
            const allVoicedUnpairedPlaced = arraysEqualIgnoreOrder(placedVoicedUnpaired, currentVoicedUnpaired);
            
            // Проверяем, все ли только глухие размещены правильно
            const allVoicelessUnpairedPlaced = arraysEqualIgnoreOrder(placedVoicelessUnpaired, currentVoicelessUnpaired);
            
            // Проверяем правильность каждой буквы в зонах
            const voicedUnpairedLetters = document.querySelectorAll('#voiced-unpaired-dropzone .dropped-letter');
            const voicelessUnpairedLetters = document.querySelectorAll('#voiceless-unpaired-dropzone .dropped-letter');
            
            // Подсвечиваем правильные и неправильные буквы
            voicedUnpairedLetters.forEach(letter => {
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
            
            voicelessUnpairedLetters.forEach(letter => {
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
            
            if (allCorrect && allVoicedUnpairedPlaced && allVoicelessUnpairedPlaced) {
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
            placedVoicedUnpaired = [];
            placedVoicelessUnpaired = [];
            
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
                'Отлично! Ты правильно распределил непарные согласные Л, М, Н, Р (только звонкие) и Ч, Щ, Ц, Х (только глухие)!',
                'Отлично! Ты правильно распределил непарные согласные Й, Л, М, Н (только звонкие) и Ч, Щ, Ц, Х (только глухие)!'
            ];
            
            levelCompleteTitle.textContent = 'Уровень пройден!';
            levelCompleteMessage.textContent = messages[currentLevel - 1];
            levelCompleteContainer.style.display = 'block';
            levelCompleteContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Показ финальных результатов
        function showFinalResults() {
            isCompleted = true;
            finalRewardMessageElement.textContent = 'Поздравляем! Ты справился со всеми непарными согласными!';
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
            const totalLetters = 8; // 4+4 на каждом уровне
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
                window.parent.postMessage({ type: 'TASK_COMPLETED' }, '*');
                alert('Молодец! Ты успешно распределил все непарные согласные!');
            } else {
                window.parent.postMessage({ type: 'TASK_COMPLETED' }, '*');
                alert('Возвращайся, чтобы завершить все два уровня!');
            }
        });