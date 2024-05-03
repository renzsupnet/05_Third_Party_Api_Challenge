// Retrieve tasks and nextId from localStorage

let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskTitleInput = $('#inputTitle');
const taskDateInput = $('#inputDate');
const taskDescInput = $('#inputDesc');
const taskDisplay = $('#task-display');

// Todo: create a function to generate a unique task id
function generateTaskId() {
    let taskId = self.crypto.randomUUID();
    return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {

    const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    if(!taskList){
        taskList = [];
    }

    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    for (let task of taskList) {
      if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
      }
    }
  
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      helper: function (e) {
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    $('#formModal').modal('hide');
    const taskTitle = taskTitleInput.val().trim();
    const taskDesc = taskDescInput.val().trim();
    const taskDate = taskDateInput.val();
  
    const newTask = {
      id: generateTaskId(),
      title: taskTitle,
      description: taskDesc,
      dueDate: taskDate,
      status: 'to-do',
    }
  
    if(!taskList){
        taskList = [];
    }

    taskList.push(newTask);
  
    localStorage.setItem('tasks', JSON.stringify(taskList));
  
    renderTaskList();
  
    taskTitleInput.val('');
    taskDescInput.val('');
    taskDateInput.val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    if(!taskList){
        taskList = [];
    }

    taskList.forEach((task) => {
      if (task.id === taskId) {
        taskList.splice(taskList.indexOf(task), 1);
      }
    });
  
    localStorage.setItem('tasks', JSON.stringify(taskList));
  
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

    if(!taskList){
        taskList = [];
    }

    const taskId = ui.draggable[0].dataset.taskId;

    const newStatus = event.target.id;

    for (let task of taskList) {

        if (task.id === taskId) {
            task.status = newStatus;
    }
    }
    
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

$('#taskForm').on('submit', handleAddTask);


taskDisplay.on('click', '.btn-delete-task', handleDeleteTask);


$(document).ready(function () {
    renderTaskList();

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

});
