document.addEventListener('DOMContentLoaded', () => {
    const taskModal = document.getElementById('taskModal');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');

    const allTasksSection = document.getElementById('allTasksSection');
    const activeTasksSection = document.getElementById('activeTasksSection');
    const completedTasksSection = document.getElementById('completedTasksSection');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskId = null;

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function clearTaskInputs() {
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskDueDateInput.value = '';
    }

    function validateTaskInputs() {
        if (!taskTitleInput.value) {
            alert('Please enter a title.');
            return false;
        }

        if (!taskDueDateInput.value) {
            alert('Please select a due date.');
            return false;
        }

        const selectedDate = new Date(taskDueDateInput.value);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate < currentDate) {
            alert('Due date cannot be in the past.');
            return false;
        }

        return true;
    }

    function showSection(sectionId) {
        allTasksSection.style.display = 'none';
        activeTasksSection.style.display = 'none';
        completedTasksSection.style.display = 'none';

        document.getElementById(sectionId).style.display = 'block';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function createTaskItem(task, isAllTasks = false) {
        const creationDate = formatDate(task.creationDate);

        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.dataset.taskId = task.id;

        let titleStyle = '';
        if (task.completed && isAllTasks) {
            titleStyle = 'text-decoration: line-through;';
        }

        taskItem.innerHTML = `
            <div class="task-title">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span style="${titleStyle}">${task.title}</span>
                <div class="task-actions">
                    <span class="material-icons edit-icon">edit</span>
                    <span class="material-icons delete-icon">delete</span>
                </div>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-dates">
                <span class="date-icon">&#128197;</span>${formatDate(task.dueDate)}
                <span class="time-icon">&#8987;</span>${creationDate}
            </div>
        `;

        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            displayTasks();
            saveTasksToLocalStorage();
        });

        const editButton = taskItem.querySelector('.edit-icon');
        editButton.addEventListener('click', () => editTask(task.id));

        const deleteButton = taskItem.querySelector('.delete-icon');
        deleteButton.addEventListener('click', (event) => {
            const taskId = event.target.closest('.task-item').dataset.taskId;
            deleteTask(taskId);
        });

        return taskItem;
    }

    function showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.textContent = 'Success! Task created successfully.';
        successMessage.style.position = 'fixed';
        successMessage.style.bottom = '20px';
        successMessage.style.right = '20px';
        successMessage.style.background = '#e0f7fa';
        successMessage.style.padding = '10px';
        successMessage.style.border = '1px solid #b2ebf2';
        successMessage.style.borderRadius = '4px';
        successMessage.style.zIndex = '1000';

        document.body.appendChild(successMessage);

        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 3000);
    }

    function updateTaskSummary() {
        const activeTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);
        const summaryElement = document.querySelector('.task-summary p');
        summaryElement.textContent = `${activeTasks.length} active tasks, ${completedTasks.length} completed tasks`;
    }

    function displayTasks() {
        let displayTasksArray = [...tasks];

        const sortSelect = document.getElementById('sortTasks');
        const sortBy = sortSelect.value;
        if (sortBy === 'dueDateEarliest') {
            displayTasksArray.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'dueDateLatest') {
            displayTasksArray.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        } else if (sortBy === 'creationDateNewest') {
            displayTasksArray.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        } else if (sortBy === 'creationDateOldest') {
            displayTasksArray.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
        }

        allTasksSection.innerHTML = '';
        activeTasksSection.innerHTML = '';
        completedTasksSection.innerHTML = '';

        const activeTasks = displayTasksArray.filter(task => !task.completed);
        const completedTasks = displayTasksArray.filter(task => task.completed);

        displayTasksArray.forEach(task => {
            allTasksSection.appendChild(createTaskItem(task, true));
        });

        if (activeTasks.length === 0) {
            activeTasksSection.innerHTML = '<div class="no-tasks"><p>No active tasks found.</p></div>';
        } else {
            activeTasks.forEach(task => {
                activeTasksSection.appendChild(createTaskItem(task));
            });
        }

        if (completedTasks.length === 0) {
            completedTasksSection.innerHTML = '<div class="no-tasks"><p>No completed tasks found.</p></div>';
        } else {
            completedTasks.forEach(task => {
                completedTasksSection.appendChild(createTaskItem(task));
            });
        }

        if (tasks.length === 0) {
            allTasksSection.innerHTML = `
                <img src="book.png" alt="Book" class="book-icon">
                <div class="no-tasks">
                    <p>No tasks found</p>
                    <p>Get started by creating your first task.</p>
                    <button id="addNewTaskBtn" class="add-new-task-btn">+ Add a New Task</button>
                </div>
            `;
        }
        updateTaskSummary();
    }

    function sortTasks(sortBy) {
        displayTasks();
        saveTasksToLocalStorage();
    }

    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;
            taskDueDateInput.value = task.dueDate;
            taskModal.style.display = 'block';
            editingTaskId = taskId;
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        displayTasks();
        saveTasksToLocalStorage();
    }

    document.getElementById('addTaskBtn').addEventListener('click', () => {
        taskModal.style.display = 'block';
        editingTaskId = null;
    });

    document.getElementById('addNewTaskBtn').addEventListener('click', () => {
        taskModal.style.display = 'block';
        editingTaskId = null;
    });

    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('add-new-task-btn')) {
            taskModal.style.display = 'block';
            editingTaskId = null;
        }
    });

    document.getElementById('cancelTaskBtn').addEventListener('click', () => {
        taskModal.style.display = 'none';
        clearTaskInputs();
        editingTaskId = null;
    });

    document.getElementById('saveTaskBtn').addEventListener('click', () => {
        if (validateTaskInputs()) {
            if (editingTaskId) {
                const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].title = taskTitleInput.value;
                    tasks[taskIndex].description = taskDescriptionInput.value;
                    tasks[taskIndex].dueDate = taskDueDateInput.value;
                }
            } else {
                const task = {
                    id: generateUniqueId(),
                    title: taskTitleInput.value,
                    description: taskDescriptionInput.value,
                    dueDate: taskDueDateInput.value,
                    creationDate: new Date().toISOString().split('T')[0],
                    completed: false,
                };
                tasks.push(task);
            }
            showSuccessMessage();
            displayTasks();
            saveTasksToLocalStorage();
            taskModal.style.display = 'none';
            clearTaskInputs();
            editingTaskId = null;
        }
    });

    document.querySelector('.task-modal-close').addEventListener('click', () => {
        taskModal.style.display = 'none';
        clearTaskInputs();
        editingTaskId = null;
    });

    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
            clearTaskInputs();
            editingTaskId = null;
        }
    });

    const sortSelect = document.getElementById('sortTasks');

    sortSelect.addEventListener('change', () => {
        const selectedValue = sortSelect.value;
        sortTasks(selectedValue);

        const checkmarks = document.querySelectorAll('.checkmark');
        checkmarks.forEach(checkmark => {
            checkmark.textContent = '';
        });

        const selectedOption = sortSelect.options[sortSelect.selectedIndex];
        selectedOption.querySelector('.checkmark').textContent = '\u2714';
    });

    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            showSection(button.dataset.section + 'TasksSection');
        });
    });

    displayTasks();
});