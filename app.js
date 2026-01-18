const DEFAULT_SUBJECTS = [
  "数学Ⅰ","数学A","数学Ⅱ","数学B","数学C","数学Ⅲ",
  "物理基礎","物理","化学基礎","化学","地理","英語","古文","漢文","現代文・小説"
];

const DEFAULT_DIFFICULTIES = ["Normal", "Hard", "Very Hard"];
const DEFAULT_TYPES = ["練習問題", "リードC", "リードD", "教科書内容"];

let state = JSON.parse(localStorage.getItem("studyQuestV2")) || {
  subjects: DEFAULT_SUBJECTS,
  difficulties: DEFAULT_DIFFICULTIES,
  types: DEFAULT_TYPES,
  tasks: []
};

let activeDifficultyFilters = new Set();
let activeTypeFilters = new Set();

function save() {
  localStorage.setItem("studyQuestV2", JSON.stringify(state));
}

function generateId() {
  return Date.now() + Math.random().toString(36).slice(2);
}

/* ---------- UI構築 ---------- */

function renderFilters() {
  const diffWrap = document.getElementById("difficultyFilters");
  const typeWrap = document.getElementById("typeFilters");

  diffWrap.innerHTML = "";
  typeWrap.innerHTML = "";

  state.difficulties.forEach(d => {
    const el = document.createElement("div");
    el.className = "filter";
    if (activeDifficultyFilters.has(d)) el.classList.add("active");
    el.textContent = d;
    el.onclick = () => {
      activeDifficultyFilters.has(d) ? activeDifficultyFilters.delete(d) : activeDifficultyFilters.add(d);
      render();
    };
    diffWrap.appendChild(el);
  });

  state.types.forEach(t => {
    const el = document.createElement("div");
    el.className = "filter";
    if (activeTypeFilters.has(t)) el.classList.add("active");
    el.textContent = t;
    el.onclick = () => {
      activeTypeFilters.has(t) ? activeTypeFilters.delete(t) : activeTypeFilters.add(t);
      render();
    };
    typeWrap.appendChild(el);
  });
}

function render() {
  renderFilters();
  const app = document.getElementById("app");
  app.innerHTML = "";

  state.subjects.forEach(subject => {
    const subjectTasks = state.tasks.filter(t => t.subject === subject);

    const section = document.createElement("div");
    section.className = "section";

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `
      ▶ ${subject}
      <span>${subjectTasks.filter(t => t.done).length}/${subjectTasks.length}</span>
    `;
    section.appendChild(header);

    const list = document.createElement("div");
    list.className = "task-list";

    subjectTasks
      .filter(task => {
        if (activeDifficultyFilters.size && !activeDifficultyFilters.has(task.difficulty)) return false;
        if (activeTypeFilters.size && !activeTypeFilters.has(task.type)) return false;
        return true;
      })
      .forEach(task => {
        const row = document.createElement("div");
        row.className = "task-row";
        if (task.done) row.classList.add("done");
        if (task.retry) row.classList.add("retry");

        row.innerHTML = `
          <div class="checkbox ${task.done ? "checked" : ""}">✓</div>
          <span class="title">${task.title}</span>
          <div class="badges">
            <span class="badge">${task.difficulty}</span>
            <span class="badge">${task.type}</span>
          </div>
          <button class="retry-btn">↻</button>
        `;

        row.querySelector(".checkbox").onclick = e => {
          e.stopPropagation();
          task.done = !task.done;
          save();
          render();
        };

        row.querySelector(".retry-btn").onclick = e => {
          e.stopPropagation();
          task.retry = !task.retry;
          save();
          render();
        };

        row.onclick = () => openTaskModal(task);

        list.appendChild(row);
      });

    section.appendChild(list);
    app.appendChild(section);
  });
}

/* ---------- モーダル ---------- */

const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubject = document.getElementById("modalSubject");
const modalDifficulty = document.getElementById("modalDifficulty");
const modalType = document.getElementById("modalType");
const modalMemo = document.getElementById("modalMemo");

let currentTask = null;

function openTaskModal(task = null) {
  currentTask = task;

  modalTitle.textContent = task ? "タスク編集" : "新規タスク追加";

  modalSubject.innerHTML = state.subjects.map(s => `<option>${s}</option>`).join("");
  modalDifficulty.innerHTML = state.difficulties.map(d => `<option>${d}</option>`).join("");
  modalType.innerHTML = state.types.map(t => `<option>${t}</option>`).join("");

  if (task) {
    modalSubject.value = task.subject;
    modalDifficulty.value = task.difficulty;
    modalType.value = task.type;
    modalMemo.value = task.memo || "";
  } else {
    modalMemo.value = "";
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

document.getElementById("addTaskBtn").onclick = () => openTaskModal();

document.getElementById("closeModalBtn").onclick = closeModal;

document.getElementById("saveTaskBtn").onclick = () => {
  if (currentTask) {
    currentTask.subject = modalSubject.value;
    currentTask.difficulty = modalDifficulty.value;
    currentTask.type = modalType.value;
    currentTask.memo = modalMemo.value;
  } else {
    const title = prompt("タスク名を入力してください");
    if (!title) return;
    state.tasks.push({
      id: generateId(),
      title,
      subject: modalSubject.value,
      difficulty: modalDifficulty.value,
      type: modalType.value,
      memo: modalMemo.value,
      done: false,
      retry: false
    });
  }
  save();
  closeModal();
  render();
};

/* ---------- フィルター項目追加 ---------- */

document.getElementById("addDifficultyBtn").onclick = () => {
  const name = prompt("追加する難易度名を入力");
  if (!name) return;
  state.difficulties.push(name);
  save();
  render();
};

document.getElementById("addTypeBtn").onclick = () => {
  const name = prompt("追加する問題形式を入力");
  if (!name) return;
  state.types.push(name);
  save();
  render();
};

/* ---------- 統計ページ ---------- */

const statsPage = document.getElementById("statsPage");
const statsContent = document.getElementById("statsContent");

document.getElementById("statsBtn").onclick = () => {
  statsContent.innerHTML = "";
  state.subjects.forEach(subject => {
    const tasks = state.tasks.filter(t => t.subject === subject);
    const done = tasks.filter(t => t.done).length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <div class="stat-label">${subject} ${done}/${tasks.length} (${percent}%)</div>
      <div class="stat-bar">
        <div class="stat-bar-inner" style="width:${percent}%"></div>
      </div>
    `;
    statsContent.appendChild(row);
  });
  statsPage.classList.remove("hidden");
};

document.getElementById("closeStatsBtn").onclick = () => {
  statsPage.classList.add("hidden");
};

/* ---------- 初期描画 ---------- */
render();

