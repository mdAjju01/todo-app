/* =====================================================
   TODO APP
   ===================================================== */


/* =====================================================
   STATE
   ===================================================== */

const STORAGE_KEY = "personal_todo_tasks_v1";
const THEME_KEY = "personal_todo_theme_v1";

let tasks = loadTasks();

let currentView = "today";

let editingTaskId = null;


/* =====================================================
   DOM
   ===================================================== */

const taskList =
  document.getElementById("taskList");

const emptyState =
  document.getElementById("emptyState");

const emptyTitle =
  document.getElementById("emptyTitle");

const emptyText =
  document.getElementById("emptyText");

const taskTotal =
  document.getElementById("taskTotal");

const taskModal =
  document.getElementById("taskModal");

const taskForm =
  document.getElementById("taskForm");

const taskTitle =
  document.getElementById("taskTitle");

const taskDate =
  document.getElementById("taskDate");

const taskPriority =
  document.getElementById("taskPriority");

const taskNotes =
  document.getElementById("taskNotes");

const modalTitle =
  document.getElementById("modalTitle");

const submitTaskText =
  document.getElementById("submitTaskText");

const searchInput =
  document.getElementById("searchInput");

const pageTitle =
  document.getElementById("pageTitle");

const pageEyebrow =
  document.getElementById("pageEyebrow");

const pageDate =
  document.getElementById("pageDate");

const sectionTitle =
  document.getElementById("sectionTitle");

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toastMessage");

const todayCount =
  document.getElementById("todayCount");

const upcomingCount =
  document.getElementById("upcomingCount");

const completedCount =
  document.getElementById("completedCount");


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  loadTheme();

  setTodayAsDefaultDate();

  updateDate();

  render();

  setupEvents();

});


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {

  /* Add task buttons */

  document
    .getElementById("openTaskModal")
    .addEventListener("click", () => {
      openModal();
    });


  document
    .getElementById("emptyAddButton")
    .addEventListener("click", () => {
      openModal();
    });


  /* Close modal */

  document
    .getElementById("closeTaskModal")
    .addEventListener("click", closeModal);


  document
    .getElementById("cancelTask")
    .addEventListener("click", closeModal);


  /* Submit */

  taskForm.addEventListener(
    "submit",
    handleTaskSubmit
  );


  /* Search */

  searchInput.addEventListener(
    "input",
    render
  );


  /* Navigation */

  document
    .querySelectorAll(".nav-item[data-view]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentView =
            button.dataset.view;

          document
            .querySelectorAll(".nav-item[data-view]")
            .forEach(item => {
              item.classList.remove("active");
            });

          button.classList.add("active");

          updatePageInformation();

          render();

        }
      );

    });


  /* Theme */

  document
    .getElementById("themeToggle")
    .addEventListener(
      "click",
      toggleTheme
    );


  /* Mobile menu */

  document
    .getElementById("mobileMenu")
    .addEventListener(
      "click",
      showMobileNavigation
    );


  /* Close modal by clicking background */

  taskModal.addEventListener(
    "click",
    event => {

      if (
        event.target === taskModal
      ) {
        closeModal();
      }

    }
  );


  /* Escape */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        taskModal.classList.contains("open")
      ) {
        closeModal();
      }


      /* Command/Ctrl + K */

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {

        event.preventDefault();

        searchInput.focus();

      }

    }
  );

}


/* =====================================================
   TASK CREATION / EDITING
   ===================================================== */

function openModal(task = null) {

  editingTaskId =
    task ? task.id : null;


  if (task) {

    modalTitle.textContent =
      "Edit task";

    submitTaskText.textContent =
      "Save changes";

    taskTitle.value =
      task.title;

    taskDate.value =
      task.date || "";

    taskPriority.value =
      task.priority || "medium";

    taskNotes.value =
      task.notes || "";

  } else {

    modalTitle.textContent =
      "Add a task";

    submitTaskText.textContent =
      "Create task";

    taskForm.reset();

    setTodayAsDefaultDate();

    taskPriority.value =
      "medium";

  }


  taskModal.classList.add("open");

  taskModal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(() => {
    taskTitle.focus();
  }, 100);

}


function closeModal() {

  taskModal.classList.remove("open");

  taskModal.setAttribute(
    "aria-hidden",
    "true"
  );

  editingTaskId = null;

  taskForm.reset();

}


/* =====================================================
   HANDLE FORM
   ===================================================== */

function handleTaskSubmit(event) {

  event.preventDefault();


  const title =
    taskTitle.value.trim();


  if (!title) {

    taskTitle.focus();

    return;

  }


  const taskData = {

    title,

    date:
      taskDate.value ||
      getTodayString(),

    priority:
      taskPriority.value,

    notes:
      taskNotes.value.trim()

  };


  if (editingTaskId) {

    const task =
      tasks.find(
        item =>
          item.id === editingTaskId
      );


    if (task) {

      task.title =
        taskData.title;

      task.date =
        taskData.date;

      task.priority =
        taskData.priority;

      task.notes =
        taskData.notes;

      task.updatedAt =
        new Date().toISOString();

      showToast(
        "Task updated"
      );

    }

  } else {

    tasks.unshift({

      id:
        generateId(),

      title:
        taskData.title,

      date:
        taskData.date,

      priority:
        taskData.priority,

      notes:
        taskData.notes,

      completed:
        false,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    });


    showToast(
      "Task created"
    );

  }


  saveTasks();

  closeModal();

  render();

}


/* =====================================================
   TASK ACTIONS
   ===================================================== */

function toggleTask(id) {

  const task =
    tasks.find(
      item =>
        item.id === id
    );


  if (!task) return;


  task.completed =
    !task.completed;


  task.updatedAt =
    new Date().toISOString();


  saveTasks();

  render();


  showToast(
    task.completed
      ? "Task completed"
      : "Task reopened"
  );

}


function editTask(id) {

  const task =
    tasks.find(
      item =>
        item.id === id
    );


  if (!task) return;


  openModal(task);

}


function deleteTask(id) {

  const task =
    tasks.find(
      item =>
        item.id === id
    );


  if (!task) return;


  const confirmed =
    confirm(
      `Delete "${task.title}"?`
    );


  if (!confirmed) return;


  tasks =
    tasks.filter(
      item =>
        item.id !== id
    );


  saveTasks();

  render();

  showToast(
    "Task deleted"
  );

}


/* =====================================================
   RENDER
   ===================================================== */

function render() {

  updateCounts();


  let visibleTasks =
    getTasksForCurrentView();


  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  if (search) {

    visibleTasks =
      visibleTasks.filter(task => {

        const text = [

          task.title,

          task.notes,

          task.priority

        ]
          .join(" ")
          .toLowerCase();


        return text.includes(search);

      });

  }


  taskList.innerHTML = "";


  if (visibleTasks.length === 0) {

    taskList.style.display =
      "none";

    emptyState.style.display =
      "block";

    updateEmptyState();

  } else {

    taskList.style.display =
      "flex";

    emptyState.style.display =
      "none";


    visibleTasks.forEach(
      task => {

        taskList.appendChild(
          createTaskElement(task)
        );

      }
    );

  }


  taskTotal.textContent =
    visibleTasks.length;

}


/* =====================================================
   CREATE TASK ELEMENT
   ===================================================== */

function createTaskElement(task) {

  const element =
    document.createElement("article");


  element.className =
    "task" +
    (task.completed
      ? " completed"
      : "");


  const priorityLabel =
    capitalize(task.priority);


  const dateLabel =
    formatTaskDate(task.date);


  element.innerHTML = `

    <button
      class="task-check"
      aria-label="${
        task.completed
          ? "Mark task incomplete"
          : "Mark task complete"
      }"
      data-action="toggle"
      data-id="${task.id}"
    >
      <span>✓</span>
    </button>


    <div class="task-content">

      <div class="task-title">
        ${escapeHtml(task.title)}
      </div>


      ${
        task.notes
          ? `
            <div class="task-notes">
              ${escapeHtml(task.notes)}
            </div>
          `
          : ""
      }


      <div class="task-meta">

        ${
          task.date
            ? `
              <span class="task-meta-item">
                ◷ ${dateLabel}
              </span>
            `
            : ""
        }


        <span
          class="
            task-meta-item
            priority
            priority-${task.priority}
          "
        >

          <span class="priority-dot"></span>

          ${priorityLabel}

        </span>

      </div>

    </div>


    <div class="task-actions">

      <button
        class="task-action"
        title="Edit task"
        aria-label="Edit task"
        data-action="edit"
        data-id="${task.id}"
      >
        ✎
      </button>


      <button
        class="task-action delete"
        title="Delete task"
        aria-label="Delete task"
        data-action="delete"
        data-id="${task.id}"
      >
        ×
      </button>

    </div>

  `;


  element
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const action =
            button.dataset.action;

          const id =
            button.dataset.id;


          if (action === "toggle") {

            toggleTask(id);

          }


          if (action === "edit") {

            editTask(id);

          }


          if (action === "delete") {

            deleteTask(id);

          }

        }
      );

    });


  return element;

}


/* =====================================================
   FILTERING
   ===================================================== */

function getTasksForCurrentView() {

  const today =
    getTodayString();


  if (currentView === "today") {

    return tasks.filter(
      task =>
        task.date === today &&
        !task.completed
    );

  }


  if (currentView === "upcoming") {

    return tasks.filter(
      task =>
        task.date > today &&
        !task.completed
    )
      .sort(
        (a,b) =>
          a.date.localeCompare(b.date)
      );

  }


  if (currentView === "completed") {

    return tasks.filter(
      task =>
        task.completed
    );

  }


  return tasks;

}


/* =====================================================
   COUNTS
   ===================================================== */

function updateCounts() {

  const today =
    getTodayString();


  const todayTasks =
    tasks.filter(
      task =>
        task.date === today &&
        !task.completed
    );


  const upcomingTasks =
    tasks.filter(
      task =>
        task.date > today &&
        !task.completed
    );


  const completedTasks =
    tasks.filter(
      task =>
        task.completed
    );


  todayCount.textContent =
    todayTasks.length;


  upcomingCount.textContent =
    upcomingTasks.length;


  completedCount.textContent =
    completedTasks.length;

}


/* =====================================================
   PAGE INFORMATION
   ===================================================== */

function updatePageInformation() {

  if (currentView === "today") {

    pageEyebrow.textContent =
      "MY DAY";

    pageTitle.textContent =
      "Today";

    sectionTitle.textContent =
      "Today's tasks";

    return;

  }


  if (currentView === "upcoming") {

    pageEyebrow.textContent =
      "PLANNING";

    pageTitle.textContent =
      "Upcoming";

    sectionTitle.textContent =
      "Upcoming tasks";

    return;

  }


  if (currentView === "completed") {

    pageEyebrow.textContent =
      "DONE";

    pageTitle.textContent =
      "Completed";

    sectionTitle.textContent =
      "Completed tasks";

  }

}


/* =====================================================
   EMPTY STATE
   ===================================================== */

function updateEmptyState() {

  if (
    searchInput.value.trim()
  ) {

    emptyTitle.textContent =
      "No tasks found";

    emptyText.textContent =
      "Try another search term.";

    emptyState
      .querySelector(".empty-add-button")
      .style.display =
      "none";

    return;

  }


  emptyState
    .querySelector(".empty-add-button")
    .style.display =
    "inline-flex";


  if (currentView === "today") {

    emptyTitle.textContent =
      "Your day is clear";

    emptyText.textContent =
      "Add something you want to get done today.";

  }


  if (currentView === "upcoming") {

    emptyTitle.textContent =
      "Nothing planned yet";

    emptyText.textContent =
      "Tasks you schedule for later will appear here.";

  }


  if (currentView === "completed") {

    emptyTitle.textContent =
      "Nothing completed yet";

    emptyText.textContent =
      "Finished tasks will appear here.";

  }

}


/* =====================================================
   DATE HELPERS
   ===================================================== */

function getTodayString() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


function setTodayAsDefaultDate() {

  taskDate.value =
    getTodayString();

}


function updateDate() {

  const date =
    new Date();


  pageDate.textContent =
    date.toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric"
      }
    );

}


function formatTaskDate(dateString) {

  if (!dateString) {
    return "";
  }


  const today =
    getTodayString();


  if (dateString === today) {
    return "Today";
  }


  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );


  const tomorrowString =
    formatDateForInput(
      tomorrow
    );


  if (
    dateString === tomorrowString
  ) {
    return "Tomorrow";
  }


  const date =
    new Date(
      dateString + "T00:00:00"
    );


  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric"
    }
  );

}


function formatDateForInput(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


/* =====================================================
   STORAGE
   ===================================================== */

function saveTasks() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

}


function loadTasks() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return [];
    }


    const parsed =
      JSON.parse(saved);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(
      "Could not load tasks:",
      error
    );

    return [];

  }

}


/* =====================================================
   THEME
   ===================================================== */

function toggleTheme() {

  document.body.classList.toggle(
    "dark"
  );


  const dark =
    document.body.classList.contains(
      "dark"
    );


  localStorage.setItem(
    THEME_KEY,
    dark ? "dark" : "light"
  );


  updateThemeIcon();

}


function loadTheme() {

  const theme =
    localStorage.getItem(
      THEME_KEY
    );


  if (theme === "dark") {

    document.body.classList.add(
      "dark"
    );

  }


  updateThemeIcon();

}


function updateThemeIcon() {

  const icon =
    document.getElementById(
      "themeIcon"
    );


  const dark =
    document.body.classList.contains(
      "dark"
    );


  icon.textContent =
    dark ? "☀" : "☾";

}


/* ====================================================
   MOBILE NAVIGATION
   ===================================================== */

   
document
  .querySelectorAll(".mobile-nav-item[data-view]")
  .forEach(button => {

    button.addEventListener("click", () => {

      currentView = button.dataset.view;

      document
        .querySelectorAll(".nav-item[data-view]")
        .forEach(item => {
          item.classList.remove("active");
        });

      document
        .querySelectorAll(".mobile-nav-item[data-view]")
        .forEach(item => {
          item.classList.remove("active");
        });

      button.classList.add("active");

      updatePageInformation();

      render();

      const mobileNav =
        document.getElementById("mobileNav");

      mobileNav.classList.remove("open");

    });

  });
function showMobileNavigation() {

  const mobileNav =
    document.getElementById("mobileNav");

  if (!mobileNav) {
    return;
  }

  mobileNav.classList.toggle("open");

}


/* =====================================================
   TOAST
   ===================================================== */

let toastTimer;


function showToast(message) {

  toastMessage.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2200);

}


/* =====================================================
   UTILITIES
   ===================================================== */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}


function capitalize(value) {

  if (!value) {
    return "";
  }


  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );

}


function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value;


  return div.innerHTML;

}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("Todo PWA ready");
      })
      .catch(error => {
        console.error(
          "Service worker registration failed:",
          error
        );
      });
  });
}
/* =====================================================
   VOICE TASK INPUT
   ===================================================== */

const voiceTaskButton = document.getElementById("voiceTaskButton");

let recognition = null;
let isListening = false;

function setupVoiceInput() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {

    isListening = true;

    voiceTaskButton.classList.add("listening");

    showToast("Listening...");

  };

  recognition.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript.trim();

    if (!transcript) {
      showToast("I didn't hear anything.");
      return;
    }

    // Open the normal Add Task window
    openModal();

    // Put the spoken words into the task title
    taskTitle.value = transcript;

    taskTitle.focus();

    showToast("Task captured");

  };

  recognition.onerror = (event) => {

    console.error(
      "Voice error:",
      event.error
    );

    if (event.error === "not-allowed") {

      showToast(
        "Please allow microphone access."
      );

    } else if (event.error === "no-speech") {

      showToast(
        "I didn't hear anything. Try again."
      );

    } else {

      showToast(
        "Voice input failed. Try again."
      );

    }

  };

  recognition.onend = () => {

    isListening = false;

    voiceTaskButton.classList.remove(
      "listening"
    );

  };

}


voiceTaskButton.addEventListener(
  "click",
  () => {

    if (!recognition) {

      showToast(
        "Voice input is not supported in this browser."
      );

      return;
    }

    if (isListening) {

      recognition.stop();

      return;
    }

    recognition.start();

  }
);


setupVoiceInput();

// Register the PWA service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Todo PWA service worker registered.");
      })
      .catch(error => {
        console.error(
          "Service worker registration failed:",
          error
        );
      });
  });
}