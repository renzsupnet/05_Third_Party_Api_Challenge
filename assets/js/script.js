// Retrieve tasks and nextId from localStorage

let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
const taskTitleInput = $('#inputTitle');
const taskDateInput = $('#inputDate');
const taskDescInput = $('#inputDesc');
const taskDisplay = $('#task-display');

// Todo: create a function to generate a unique task id
function generateTaskId() {
  // The function randomUUID() is a built-in function of the crypto interface to generate random identifiers
    let taskId = self.crypto.randomUUID();
    return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {

  // Constructing the taskCard part by part
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
  // Deletes the task
  cardDeleteBtn.on('click', handleDeleteTask);

  // Check if task is done and if there is a due date
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
  // Display card as yellow if the due date is today, red if past due and white if still in the futre
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

// Attaching the card parts into their respective parent element
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

  // Checking if localStorage has tasks
    if(!taskList){
        taskList = [];
    }

    // Reset task cards
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // Loop through the taskList and attach them to the appropriate status 
    for (let task of taskList) {
      if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
      }
    }
  

    // Enable the draggable property
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
  // Prevent the default behavior of refreshing
    event.preventDefault();
  // Hide modal upon submitting inputs
    $('#formModal').modal('hide');
    // Remove unnecessary spaces
    const taskTitle = taskTitleInput.val().trim();
    const taskDesc = taskDescInput.val().trim();
    const taskDate = taskDateInput.val();
  
    // Constructina new Task Object with the appropriate properties
    const newTask = {
      id: generateTaskId(),
      title: taskTitle,
      description: taskDesc,
      dueDate: taskDate,
      status: 'to-do',
    }
  
    // Checks localStorage if not then taskList is initialized as an empty array
    if(!taskList){
        taskList = [];
    }

    // Adding to the taskList
    taskList.push(newTask);
  
    // Saving to localStorage
    localStorage.setItem('tasks', JSON.stringify(taskList));
  
    // Calling the render function to reflect the newly added tasks
    renderTaskList();
  
    // Reset input values
    taskTitleInput.val('');
    taskDescInput.val('');
    taskDateInput.val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    // Check localStorage if it has taskList if not taskList is initalized as an empty array
    if(!taskList){
        taskList = [];
    }

    // Delete the task by using the splice method and the index
    taskList.forEach((task) => {
      if (task.id === taskId) {
        taskList.splice(taskList.indexOf(task), 1);
      }
    });
  
    // Save to localStorage the taskList after deletion
    localStorage.setItem('tasks', JSON.stringify(taskList));
  
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

  // Check localStorage if it has taskList if not taskList is initalized as an empty array
    if(!taskList){
        taskList = [];
    }

    // This handles being dropped into a new status between To-Do, In Progress and Done
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

// Adding Event Listener
$('#taskForm').on('submit', handleAddTask);


taskDisplay.on('click', '.btn-delete-task', handleDeleteTask);

// Display task list as document loads and initialize draggable element
$(document).ready(function () {
    renderTaskList();

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

});
