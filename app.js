let data = JSON.parse(localStorage.getItem("studyData")) || [
  { name: "数学", tasks: [] },
  { name: "英語", tasks: [] }
];

let currentTask = null;
let currentTraderIndex = null;

const traderList = document.getElementById("traderList");
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskNotes = document.getElementById("taskNotes");

const addTaskModal = document.getElementById("addTaskModal");
const addTaskTitle = document.getElementById("addTaskTitle");
const newTaskName = document.getElementById("newTaskName");
const newTaskDifficulty = document.getElementById("newTaskDifficulty");

function save() {
  localStorage.setItem("studyData", JSON.stringify(data));
}

function render() {
  traderList.innerHTML = "";

  const showReview = document.getElementById("filter-review").checked;
  const difficultyFilter = document.getElementById("filter-difficulty").value;

  data.forEach((trader, traderIndex) => {
    const doneCount = trader.tasks.filter(t => t.done).length;

    const traderDiv = document.createElement("div");
    traderDiv.className = "trader";

    const header = document.createElement("div");
    header.className = "trader-header";
    header.innerHTML = `
      <div class="trader-name">▶ ${trader.name}</div>
      <div class="trader-progress">${doneCount} / ${trader.tasks.length}</div>
    `;
    header.onclick = () => {
      const list = traderDiv.querySelector(".task-list");
      list.style.display = list.style.display === "block" ? "none" : "block";
    };

    const list = document.createElement("div");
    list.className = "task-list";

    trader.tasks.forEach((task, taskIndex) => {
      if (showReview && !task.review) return;
      if (difficultyFilter !== "all" && task.difficulty !== difficultyFilter) return;

      const taskDiv = document.createElement("div");
      taskDiv.className = "task";

      const left = document.createElement("div");
      left.className = "task-left";

      const checkbox = document.createElement("div");
      checkbox.className = "checkbox" + (task.done ? " checked" : "");
      checkbox.textContent = task.done ? "✓" : "";
      checkbox.onclick = () => toggleDone(traderIndex, taskIndex);

      const name = document.createElement("span");
      name.className = "task-name" + (task.done ? " done" : "");
      name.textContent = task.name;
      name.onclick = () => openModal(traderIndex, taskIndex);

      left.appendChild(checkbox);
      left.appendChild(name);

      const reviewBtn = document.createElement("button");
      reviewBtn.className = "review-btn" + (task.review ? " active" : "");
      reviewBtn.textContent = "🔁";
      reviewBtn.onclick = () => toggleReview(traderIndex, taskIndex);

      taskDiv.appendChild(left);
      taskDiv.appendChild(reviewBtn);
      list.appendChild(taskDiv);
    });

    const addTaskBtn = document.createElement("button");
    addTaskBtn.className = "add-task-btn";
    addTaskBtn.textContent = "+ タスクを追加";
    addTaskBtn.onclick = () => openAddTaskModal(traderIndex);
    list.appendChild(addTaskBtn);

    traderDiv.appendChild(header);
    traderDiv.appendChild(list);
    traderList.appendChild(traderDiv);
  });

  save();
}

function toggleDone(ti, ki) {
  data[ti].tasks[ki].done = !data[ti].tasks[ki].done;
  render();
}

function toggleReview(ti, ki) {
  data[ti].tasks[ki].review = !data[ti].tasks[ki].review;
  render();
}

function openModal(ti, ki) {
  currentTask = { ti, ki };
  modalTitle.textContent = data[ti].tasks[ki].name;
  taskNotes.value = data[ti].tasks[ki].notes || "";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function saveNotes() {
  if (!currentTask) return;
  data[currentTask.ti].tasks[currentTask.ki].notes = taskNotes.value;
  save();
  closeModal();
}

function addTrader() {
  const input = document.getElementById("newTraderName");
  if (!input.value.trim()) return;
  data.push({ name: input.value.trim(), tasks: [] });
  input.value = "";
  render();
}

function openAddTaskModal(traderIndex) {
  currentTraderIndex = traderIndex;
  addTaskTitle.textContent = `${data[traderIndex].name} にタスクを追加`;
  newTaskName.value = "";
  newTaskDifficulty.value = "normal";
  addTaskModal.classList.remove("hidden");
}

function closeAddTask() {
  addTaskModal.classList.add("hidden");
}

function confirmAddTask() {
  const name = newTaskName.value.trim();
  if (!name) return;
  data[currentTraderIndex].tasks.push({
    name,
    done: false,
    review: false,
    difficulty: newTaskDifficulty.value,
    notes: ""
  });
  closeAddTask();
  render();
}

document.getElementById("filter-review").addEventListener("change", render);
document.getElementById("filter-difficulty").addEventListener("change", render);

render();
