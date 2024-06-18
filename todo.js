let task = document.querySelector("#input");
let btn = document.querySelector("button");

btn.onclick = insert;

function insert() {
    let taskValue = task.value.trim();
    if (taskValue.length > 0) {
        // Capitalize the first letter of the task value
        taskValue = taskValue.charAt(0).toUpperCase() + taskValue.slice(1);

        let li = createTaskElement(taskValue);
        document.querySelector("ul").appendChild(li);
        
        saveTask(taskValue);
        
        task.value = "";

        // Scroll to the bottom of the task list container
        document.querySelector(".task-list-container").scrollTop = document.querySelector(".task-list-container").scrollHeight;
    }
}

function createTaskElement(taskValue) {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerText = taskValue;

    let btn = document.createElement("button");
    btn.className = "btn btn-outline-danger btn-sm";
    btn.innerText = "X";
    li.appendChild(btn);

    return li;
}

function saveTask(taskValue) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskValue);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(taskValue => {
        let li = createTaskElement(taskValue);
        document.querySelector("ul").appendChild(li);
    });
}

function removeTask(taskValue) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task !== taskValue);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

let ul = document.querySelector("ul");

ul.addEventListener("click", function(event) {
    if (event.target.nodeName === "BUTTON") {
        let listItem = event.target.parentElement;
        let taskValue = listItem.innerText.slice(0, -1);  // Remove the 'X' button text
        removeTask(taskValue);
        listItem.remove();
    }
});

function updateDateTime() {
    let now = new Date();
    let dateTimeString = now.toLocaleString();
    document.getElementById("datetime").innerText = dateTimeString;
}

// Update date and time every second
setInterval(updateDateTime, 1000);

// Initial call to set the date and time immediately
updateDateTime();

function getGreeting(name) {
    let now = new Date();
    let hours = now.getHours();
    let greeting;

    if (hours < 12) {
        greeting = "Good Morning";
    } else if (hours < 18) {
        greeting = "Good Afternoon";
    } else if (hours < 21) {
        greeting = "Good Evening";
    } else {
        greeting = "Good Night";
    }

    return `${greeting}, ${name}!<br>Welcome to your Todo App`;
}

// Check if the user's name is already stored in localStorage
let userName = localStorage.getItem("userName");

if (!userName) {
    // Prompt the user for their name if not stored
    userName = prompt("Please enter your name:");
    if (userName) {
        userName = userName.trim();
        if (userName.length > 0) {
            localStorage.setItem("userName", userName);
        }
    }
}

if (userName && userName.length > 0) {
    document.getElementById("greeting").innerHTML = getGreeting(userName);
}

// Load saved tasks on page load
loadTasks();

// Sticky Notes Functionality
let addStickyNoteBtn = document.getElementById("addStickyNote");
let stickyNoteInput = document.getElementById("stickyNoteInput");
let stickyNotesList = document.getElementById("stickyNotesList");

addStickyNoteBtn.onclick = function() {
    let stickyNoteValue = stickyNoteInput.value.trim();
    if (stickyNoteValue.length > 0) {
        let li = createStickyNoteElement(stickyNoteValue);
        stickyNotesList.appendChild(li);

        saveStickyNote(stickyNoteValue);

        stickyNoteInput.value = "";
    }
}

function createStickyNoteElement(stickyNoteValue) {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerText = stickyNoteValue;

    let btn = document.createElement("button");
    btn.className = "btn btn-danger btn-sm";
    btn.innerText = "X";
    li.appendChild(btn);

    return li;
}

function saveStickyNote(stickyNoteValue) {
    let stickyNotes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    stickyNotes.push(stickyNoteValue);
    localStorage.setItem("stickyNotes", JSON.stringify(stickyNotes));
}

function loadStickyNotes() {
    let stickyNotes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    stickyNotes.forEach(stickyNoteValue => {
        let li = createStickyNoteElement(stickyNoteValue);
        stickyNotesList.appendChild(li);
    });
}

function removeStickyNote(stickyNoteValue) {
    let stickyNotes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    stickyNotes = stickyNotes.filter(note => note !== stickyNoteValue);
    localStorage.setItem("stickyNotes", JSON.stringify(stickyNotes));
}

stickyNotesList.addEventListener("click", function(event) {
    if (event.target.nodeName === "BUTTON") {
        let listItem = event.target.parentElement;
        let stickyNoteValue = listItem.innerText.slice(0, -1);  // Remove the 'X' button text
        removeStickyNote(stickyNoteValue);
        listItem.remove();
    }
});

// Load saved sticky notes on page load
loadStickyNotes();

// Dark Mode Functionality
let darkModeSwitch = document.getElementById("darkModeSwitch");

darkModeSwitch.addEventListener("change", function() {
    if (darkModeSwitch.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
});

// Load dark mode preference on page load
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeSwitch.checked = true;
}
