 (function() {
            const tasks = [
                { id: 0, correctSequence: ['А', 'Б', 'В', 'Г'], letters: ['Б', 'В', 'А', 'Г'] },
                { id: 1, correctSequence: ['К', 'Л', 'М', 'Н'], letters: ['Л', 'Н', 'К', 'М'] },
                { id: 2, correctSequence: ['Ж', 'З', 'И', 'К'], letters: ['З', 'К', 'Ж', 'И'] },
                { id: 3, correctSequence: ['Щ', 'Э', 'Ю', 'Я'], letters: ['Ю', 'Щ', 'Э', 'Я'] }
            ];

            let currentTaskIndex = 0;
            let completedTasks = [false, false, false, false];
            let usedLetters = new Set();
            let isCurrentTaskCompleted = false;
            let autoTransitionTimer = null;
            let resetTimer = null;

            const lettersContainer = document.getElementById('letters-container');
            const sequenceContainer = document.getElementById('sequence-container');
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            const resultContainer = document.getElementById('result-container');
            const rewardMessage = document.getElementById('reward-message');
            const taskTitle = document.getElementById('task-title');
            const restartBtn = document.getElementById('restart-btn');
            const exitBtn = document.getElementById('exit-btn');
            const checkButton = document.getElementById('check-button');

            function updateProgressBar() {
                const completedCount = completedTasks.filter(v => v).length;
                progressBar.style.width = (completedCount / tasks.length * 100) + '%';
                progressText.textContent = `${completedCount}/${tasks.length}`;
            }

            function fullResetCurrentTask() {
                if (isCurrentTaskCompleted) return;

                const slots = document.querySelectorAll('.sequence-slot');
                slots.forEach(slot => {
                    const letterId = slot.dataset.letterId;
                    if (letterId) {
                        const letterEl = document.getElementById(letterId);
                        if (letterEl) {
                            letterEl.classList.remove('used');
                            letterEl.draggable = true;
                            usedLetters.delete(letterId);
                        }
                    }
                    slot.textContent = '';
                    slot.classList.remove('filled', 'correct', 'wrong');
                    delete slot.dataset.letterId;
                });

                document.querySelectorAll('.letter.used').forEach(l => {
                    if (!usedLetters.has(l.id)) {
                        l.classList.remove('used');
                        l.draggable = true;
                    }
                });

                checkButton.disabled = true;
            }

            function loadTask(taskIdx) {
                const task = tasks[taskIdx];
                usedLetters.clear();
                isCurrentTaskCompleted = false;

                taskTitle.textContent = '';

                lettersContainer.innerHTML = '';
                sequenceContainer.innerHTML = '';

                checkButton.style.display = 'block';
                checkButton.disabled = true;

                for (let i = 0; i < 4; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'sequence-slot';
                    slot.dataset.position = i;

                    slot.addEventListener('dragover', handleDragOverSlot);
                    slot.addEventListener('dragleave', handleDragLeaveSlot);
                    slot.addEventListener('drop', handleDropSlot);
                    slot.addEventListener('click', handleSlotClick);

                    sequenceContainer.appendChild(slot);

                    if (i < 3) {
                        const connector = document.createElement('div');
                        connector.className = 'connector';
                        connector.textContent = '→';
                        sequenceContainer.appendChild(connector);
                    }
                }

                const shuffled = [...task.letters].sort(() => Math.random() - 0.5);
                shuffled.forEach((letter, idx) => {
                    const letterEl = document.createElement('div');
                    letterEl.className = 'letter';
                    letterEl.textContent = letter;
                    letterEl.draggable = true;
                    letterEl.dataset.letter = letter;
                    letterEl.dataset.index = idx;
                    letterEl.id = `l-${taskIdx}-${idx}-${Date.now()}-${Math.random()}`;

                    letterEl.addEventListener('dragstart', handleDragStart);
                    letterEl.addEventListener('dragend', handleDragEnd);

                    lettersContainer.appendChild(letterEl);
                });

                if (completedTasks[taskIdx]) {
                    lockTaskAsCompleted(taskIdx);
                }

                resultContainer.style.display = 'none';
            }

            function lockTaskAsCompleted(taskIdx) {
                const task = tasks[taskIdx];
                document.querySelectorAll('.letter').forEach(l => {
                    l.draggable = false;
                    l.classList.add('used');
                });
                const slots = document.querySelectorAll('.sequence-slot');
                slots.forEach((slot, idx) => {
                    slot.textContent = task.correctSequence[idx];
                    slot.classList.add('filled', 'correct');
                    slot.classList.remove('wrong', 'highlight');
                });
                checkButton.style.display = 'none';
                isCurrentTaskCompleted = true;
            }

            function handleDragStart(e) {
                if (e.target.classList.contains('used') || isCurrentTaskCompleted) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData('text/plain', e.target.dataset.letter);
                e.dataTransfer.setData('id', e.target.id);
                e.target.classList.add('dragging');
            }

            function handleDragEnd(e) {
                e.target.classList.remove('dragging');
                document.querySelectorAll('.sequence-slot').forEach(s => s.classList.remove('highlight'));
            }

            function handleDragOverSlot(e) {
                e.preventDefault();
                if (isCurrentTaskCompleted) return;
                e.target.classList.add('highlight');
            }

            function handleDragLeaveSlot(e) {
                e.preventDefault();
                e.target.classList.remove('highlight');
            }

            function returnLetterToContainer(letterId) {
                const letterEl = document.getElementById(letterId);
                if (letterEl) {
                    letterEl.classList.remove('used');
                    letterEl.draggable = true;
                    usedLetters.delete(letterId);
                }
                const slots = document.querySelectorAll('.sequence-slot');
                slots.forEach(slot => {
                    if (slot.dataset.letterId === letterId) {
                        delete slot.dataset.letterId;
                    }
                });
            }

            function handleSlotClick(e) {
                if (isCurrentTaskCompleted) return;
                const slot = e.currentTarget;
                const letterId = slot.dataset.letterId;
                if (!letterId) return;

                returnLetterToContainer(letterId);
                slot.textContent = '';
                slot.classList.remove('filled', 'correct', 'wrong');
                delete slot.dataset.letterId;

                const filled = document.querySelectorAll('.sequence-slot.filled').length;
                checkButton.disabled = (filled !== 4);
            }

            function handleDropSlot(e) {
                e.preventDefault();
                if (isCurrentTaskCompleted) return;
                e.target.classList.remove('highlight');

                const letter = e.dataTransfer.getData('text/plain');
                const letterId = e.dataTransfer.getData('id');

                if (e.target.textContent !== '') {
                    const oldLetterId = e.target.dataset.letterId;
                    if (oldLetterId) {
                        returnLetterToContainer(oldLetterId);
                    }
                }

                const draggedEl = document.getElementById(letterId);
                if (draggedEl && !draggedEl.classList.contains('used')) {
                    draggedEl.classList.add('used');
                    draggedEl.draggable = false;
                    usedLetters.add(letterId);
                }

                e.target.textContent = letter;
                e.target.classList.add('filled');
                e.target.dataset.letterId = letterId;

                const filled = document.querySelectorAll('.sequence-slot.filled').length;
                checkButton.disabled = (filled !== 4);
            }

            function goToNextTask() {
                if (currentTaskIndex + 1 < tasks.length) {
                    currentTaskIndex++;
                    loadTask(currentTaskIndex);
                } else {
                    // показываем только "молодец! всё верно." (уже в разметке)
                    resultContainer.style.display = 'block';
                }
            }

            function checkSequence() {
                if (isCurrentTaskCompleted) return;

                const task = tasks[currentTaskIndex];
                const slots = document.querySelectorAll('.sequence-slot');
                const userSeq = Array.from(slots).map(s => s.textContent);
                const isCorrect = userSeq.every((ch, i) => ch === task.correctSequence[i]);

                if (isCorrect) {
                    slots.forEach(s => {
                        s.classList.remove('wrong');
                        s.classList.add('correct');
                    });

                    completedTasks[currentTaskIndex] = true;
                    isCurrentTaskCompleted = true;
                    updateProgressBar();

                    checkButton.style.display = 'none';

                    if (autoTransitionTimer) clearTimeout(autoTransitionTimer);
                    autoTransitionTimer = setTimeout(() => {
                        autoTransitionTimer = null;
                        goToNextTask();
                    }, 800);

                } else {
                    slots.forEach((slot, i) => {
                        if (slot.textContent !== task.correctSequence[i]) {
                            slot.classList.add('wrong');
                        } else {
                            slot.classList.add('correct');
                        }
                    });

                    if (resetTimer) clearTimeout(resetTimer);
                    resetTimer = setTimeout(() => {
                        fullResetCurrentTask();
                        resetTimer = null;
                    }, 1000);
                }
            }

            function initFullGame() {
                if (autoTransitionTimer) clearTimeout(autoTransitionTimer);
                if (resetTimer) clearTimeout(resetTimer);
                completedTasks = [false, false, false, false];
                currentTaskIndex = 0;
                updateProgressBar();
                loadTask(0);
                resultContainer.style.display = 'none';
            }

            checkButton.addEventListener('click', checkSequence);

            restartBtn.addEventListener('click', () => {
                initFullGame();
            });

            exitBtn.addEventListener('click', () => {
                if (completedTasks.every(v => v)) {
                    alert('ты молодец!');
                } else {
                    alert('можно ещё потренироваться.');
                }
            });

            initFullGame();
        })();