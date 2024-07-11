function confirmUpdate() {
    if (confirm("Are you sure you want to update?")) {
        document.getElementById("editForm").submit();
    } else {
        // Optionally, you can add code here if the user cancels the action.
    }
}
function timeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    if (diff < msPerMinute) {
        return Math.round(diff / 1000) + ' seconds ago';
    } else if (diff < msPerHour) {
        return Math.round(diff / msPerMinute) + ' min ago';
    } else if (diff < msPerDay) {
        return Math.round(diff / msPerHour) + ' hrs ago';
    } else if (diff < msPerMonth) {
        return Math.round(diff / msPerDay) + ' days ago';
    } else if (diff < msPerYear) {
        return Math.round(diff / msPerMonth) + ' months ago';
    } else {
        return Math.round(diff / msPerYear) + ' years ago';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const taskListItems = document.querySelectorAll('.list-group-item');
    
    taskListItems.forEach(item => {
        const timestamp = item.getAttribute('data-timestamp');
        const timeAgoElement = item.querySelector('.time-ago');
        
        if (timestamp) {
            timeAgoElement.textContent = timeAgo(timestamp);
        } else {
            timeAgoElement.textContent = 'Unknown'; // or any default message you prefer
        }
    });
});

let activeEditBtn = null;

document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", () => {
        const listItem = button.closest("li");
        const taskContent = listItem.querySelector(".task-content");
        const taskInput = listItem.querySelector(".task-input");
        const saveBtn = listItem.querySelector(".save-btn");
        const cancelBtn = listItem.querySelector(".cancel-btn");
        const deleteBtn = listItem.querySelector(".delete-btn");

        // Deactivate previous active edit button
        if (activeEditBtn && activeEditBtn !== button) {
            const prevListItem = activeEditBtn.closest("li");
            const prevTaskContent = prevListItem.querySelector(".task-content");
            const prevTaskInput = prevListItem.querySelector(".task-input");
            const prevSaveBtn = prevListItem.querySelector(".save-btn");
            const prevCancelBtn = prevListItem.querySelector(".cancel-btn");
            const prevDeleteBtn = prevListItem.querySelector(".delete-btn");

            prevTaskContent.classList.remove("d-none");
            prevTaskInput.classList.add("d-none");
            activeEditBtn.classList.remove("d-none");
            prevSaveBtn.classList.add("d-none");
            prevCancelBtn.classList.add("d-none");
            prevDeleteBtn.classList.remove("d-none");
        }

        activeEditBtn = button;

        // Hide delete button
        deleteBtn.classList.add("d-none");

        // Hide task content, show input and buttons
        taskContent.classList.add("d-none");
        button.classList.add("d-none");
        taskInput.classList.remove("d-none");
        saveBtn.classList.remove("d-none");
        cancelBtn.classList.remove("d-none");

        taskInput.focus();
    });
});

document.querySelectorAll(".cancel-btn").forEach(cancelBtn => {
    cancelBtn.addEventListener("click", () => {
        const listItem = cancelBtn.closest("li");
        const taskContent = listItem.querySelector(".task-content");
        const taskInput = listItem.querySelector(".task-input");
        const editBtn = listItem.querySelector(".edit-btn");
        const saveBtn = listItem.querySelector(".save-btn");
        const deleteBtn = listItem.querySelector(".delete-btn");

        // Show delete button
        deleteBtn.classList.remove("d-none");

        // Show task content, hide input and buttons
        taskContent.classList.remove("d-none");
        taskInput.classList.add("d-none");
        editBtn.classList.remove("d-none");
        saveBtn.classList.add("d-none");
        cancelBtn.classList.add("d-none");

        // Clear and reset input value if needed
        taskInput.value = taskContent.textContent.trim();

        // Remove character count if it exists
        const editCharCount = listItem.querySelector("#editCharCount");
        if (editCharCount) {
            editCharCount.remove();
        }

        activeEditBtn = null;
    });
});

// Additional JavaScript for character count and validation
const taskInput = document.getElementById('task');
const charCount = document.getElementById('charCount');

taskInput.addEventListener('input', function() {
    const count = this.value.length;
    charCount.textContent = count;

    // You can adjust the maximum length as needed
    const maxLength = 256;
    if (count > maxLength) {
        taskInput.setCustomValidity('Task length exceeds 256 characters.');
    } else {
        taskInput.setCustomValidity('');
    }
});

// JavaScript for editing task content
document.querySelectorAll('.edit-btn').forEach(editBtn => {
    editBtn.addEventListener('click', () => {
        const listItem = editBtn.closest('li');
        const taskContent = listItem.querySelector('.task-content');
        const taskInput = listItem.querySelector('.task-input');
        const saveBtn = listItem.querySelector('.save-btn');

        taskContent.classList.add('d-none');
        taskInput.classList.remove('d-none');
        editBtn.classList.add('d-none');
        saveBtn.classList.remove('d-none');
        // Create and insert character count only after clicking edit button
        const editCharCount = document.createElement('small');
        editCharCount.id = 'editCharCount';
        editCharCount.classList.add('form-text', 'text-white');
        editCharCount.innerHTML = `<span>${taskInput.value.length}</span>/256&nbsp;&nbsp;`;

        // Remove existing character count if any
        const existingCharCount = listItem.querySelector('#editCharCount');
        if (existingCharCount) {
            existingCharCount.parentNode.removeChild(existingCharCount);
        }

        taskInput.parentNode.insertBefore(editCharCount, taskInput.nextSibling);

        // Update character count dynamically
        taskInput.addEventListener('input', () => {
            const count = taskInput.value.length;
            editCharCount.querySelector('span').textContent = count;

            // You can adjust the maximum length as needed
            const maxLength = 256;
            if (count > maxLength) {
                taskInput.setCustomValidity('Task length exceeds 256 characters.');
            } else {
                taskInput.setCustomValidity('');
            }
        });
    });
});

// Function to update time ago for each task
function updateTimeAgo() {
    const taskListItems = document.querySelectorAll('.list-group-item');
    taskListItems.forEach(item => {
        const timestamp = item.getAttribute('data-timestamp');
        const timeAgoElement = item.querySelector('.time-ago');
        if (timestamp) {
            timeAgoElement.textContent = timeAgo(timestamp);
        } else {
            timeAgoElement.textContent = 'Unknown'; // or any default message you prefer
        }
    });
}

// Update time ago initially and then every minute (60000 ms)
updateTimeAgo();
setInterval(updateTimeAgo, 60000); // Update every minute
