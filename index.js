// TASK: import initialData
// Initial task data
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";



/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
  }
  initializeData();

// TASK: Get elements from the DOM
const elements = {
  filterDiv: document.getElementById("filterDiv"),
  boardsContainer: document.getElementById("boards-nav-links-div"),
  modalWindow: document.querySelector(".modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  headerBoardName: document.getElementById("header-board-name"),
  // Sidebar elements
  sidebar: document.getElementById("side-bar-div"),
  hideSideBarBtn: document.querySelector(".hide-side-bar-div"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  //Header/body elements
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  columnDivs: document.querySelectorAll(".column-div"),
  //New Task form and button elements
  createTaskBtn: document.getElementById("create-task-btn"),
  addTaskForm: document.getElementById("new-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  //New task input fields
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  modalSelectStatus: document.getElementById("select-status"),
  //Edit task elements
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editTaskSelectStatus: document.getElementById("edit-select-status"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  saveChangesBtn: document.getElementById("save-task-changes-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
};

  


let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}
  
  
// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click',() =>{ 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click",() => {openEditTaskModal(task);
    });

    
    tasksContainer.appendChild(taskElement);
  });

});

}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.log(task);
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer); {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',()=> toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block': 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 
  const titleInput = document.getElementById('title-input');
  const descInput = document.getElementById('desc-input');
  const statusSelect = document.getElementById('select-status');


  //Assign user input to the task object
    const task = {
      title: titleInput.value,
      description: descInput.value,
      status: statusSelect.value,
      board: activeBoard,
  
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar (show) {
  const sidebar = document.getElementById("side-bar-div");
  const showButton = document.getElementById("show-side-bar-btn");
  const hideButton = document.getElementById("hide-side-bar-btn");
  if (show) {
    sidebar.style.display = "block"; // Show the sidebar
    showButton.style.display = "none"; // Hide the show button
    hideButton.style.display = "block"; // Show the hide button
  } else {
    sidebar.style.display = "none"; // Hide the sidebar
    showButton.style.display = "block"; // Show the show button
    hideButton.style.display = "none"; // Hide the hide button
  }
}


function toggleTheme() {
  const body = document.body; // Get the body element
  const logo = document.getElementById("logo"); // Get the logo element
  const isDarkTheme = elements.themeSwitch.checked; // Check the state of the theme switch
  if (!isDarkTheme) {
    body.classList.add("dark-theme"); // Add dark theme class
    body.classList.remove("light-theme"); // Remove light theme class
    logo.src = "./assets/logo-dark.svg"; // Set logo for dark theme
    localStorage.setItem("theme", "dark"); // Save theme preference to local storage
  } else {
    body.classList.add("light-theme"); // Add light theme class
    body.classList.remove("dark-theme"); // Remove dark theme class
    logo.src = "./assets/logo-light.svg"; // Set logo for light theme
    localStorage.setItem("theme", "light"); // Save theme preference to local storage
  }
}
  

function openEditTaskModal(task) {
  // Set task details in modal inputs
  
   document.getElementById('edit-task-title').value === task.title;
   document.getElementById('edit-task-description').value = task.description
  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');


  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener ('click ',() => {
    saveTaskChanges(task.id);
  });
  

  // Delete task using a helper function and close the task modal
function deleteTask(taskId) {
  // Implementation of deleteTask function in ./utils/taskFunctions.js
}

  deleteTaskBtn.addEventListener('click', () => {
    deleteTask((task.id));
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI(); // Refresh tasks after deletion
  });
  


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
};

function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById('edit-task-title-input');
  if (titleInput.value.trim() === '') {
    alert('The title field cannot be empty!');
    return;
  }
  const updatedTask = {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
    id: taskId,
    board: activeBoard
  };


  // Create an object with the updated task details


  // Update task using a hlper function
  patchTask(taskId, updatedTask);



  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}




document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}