let currentTaskIndex = 0;
let completedTasks = 0;

const lettersContainer = document.getElementById('letters-container');
const dropZone = document.getElementById('drop-zone');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const taskStatus = document.getElementById('task-status');
const resultContainer = document.getElementById('result-container');
const rewardMessageElement = document.getElementById('reward-message');
const taskTitle = document.getElementById('task-title');
const restartBtn = document.getElementById('restart-btn');
const exitBtn = document.getElementById('exit-btn');

function initGame() {
    currentTaskIndex = 0;
    completedTasks = 0;
    updateProgress();
    resultContainer.style.display = 'none';
    loadTask(currentTaskIndex);
}

function loadTask(taskIndex) {
    const task = tasks[taskIndex];

    lettersContainer.innerHTML = '';
    dropZone.innerHTML = 'Перетащи сюда букву';
    taskStatus.textContent = '';
    taskStatus.className = 'task-status';
    taskTitle.textContent = task.instruction;

    task.letters.forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.draggable = true;
        letterElement.dataset.letter = letter;

        letterElement.addEventListener('dragstart', handleDragStart);
        letterElement.addEventListener('dragend', handleDragEnd);

        lettersContainer.appendChild(letterElement);
    });

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.letter);
    e.target.classList.add('dragging');
    dropZone.classList.add('highlight');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    dropZone.classList.remove('highlight');
}

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('highlight');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('highlight');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('highlight');

    const letter = e.dataTransfer.getData('text/plain');
    const task = tasks[currentTaskIndex];

    if (letter === task.targetLetter) {
        const correctLetter = document.createElement('div');
        correctLetter.className = 'letter';
        correctLetter.textContent = letter;
        correctLetter.style.backgroundColor = '#4CAF50';
        correctLetter.style.pointerEvents = 'none';

        dropZone.innerHTML = '';
        dropZone.appendChild(correctLetter);

        taskStatus.textContent = 'Правильно!';
        taskStatus.className = 'task-status completed';

        if (currentTaskIndex === completedTasks) {
            completedTasks++;
            updateProgress();
        }

        setTimeout(() => {
            nextTask();
        }, 1500);

    } else {
        const wrongLetter = document.createElement('div');
        wrongLetter.className = 'letter';
        wrongLetter.textContent = letter;
        wrongLetter.style.backgroundColor = '#F44336';
        wrongLetter.style.pointerEvents = 'none';

        dropZone.innerHTML = '';
        dropZone.appendChild(wrongLetter);

        taskStatus.textContent = 'Попробуй еще раз!';
        taskStatus.className = 'task-status not-completed';

        setTimeout(() => {
            dropZone.innerHTML = 'Перетащи сюда букву';
            taskStatus.textContent = '';
        }, 1000);
    }
}

function updateProgress() {
    const progressPercentage = (completedTasks / tasks.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `Прогресс: ${completedTasks}/${tasks.length}`;
}

function nextTask() {
    if (currentTaskIndex === tasks.length - 1) {
        showResults();
        return;
    }

    if (currentTaskIndex < tasks.length - 1) {
        currentTaskIndex++;
        loadTask(currentTaskIndex);
    }
}

function showResults() {
    rewardMessageElement.textContent = 'Молодец! Отличная работа!';
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', initGame);

restartBtn.addEventListener('click', initGame);
exitBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'TASK_COMPLETED' }, '*');
    alert('Игра завершена! Молодец! Ты отлично справился с заданиями!');
});