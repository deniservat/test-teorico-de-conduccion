const STORAGE_KEY = "driving-test-study-state-v1";
const QUESTIONS = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : [];

const state = {
  query: "",
  filter: "active",
  sortMode: "original",
  statuses: loadStatuses(),
};

const elements = {
  search: document.querySelector("#search"),
  statusFilter: document.querySelector("#statusFilter"),
  sortMode: document.querySelector("#sortMode"),
  showOnlyUnknown: document.querySelector("#showOnlyUnknown"),
  resetProgress: document.querySelector("#resetProgress"),
  nextPending: document.querySelector("#nextPending"),
  list: document.querySelector("#questionsList"),
  template: document.querySelector("#questionTemplate"),
  totalCount: document.querySelector("#totalCount"),
  pendingCount: document.querySelector("#pendingCount"),
  masteredCount: document.querySelector("#masteredCount"),
  reviewCount: document.querySelector("#reviewCount"),
  progressBar: document.querySelector("#progressBar"),
  resultsLabel: document.querySelector("#resultsLabel"),
};

function loadStatuses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStatuses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.statuses));
}

function getStatus(questionId) {
  return state.statuses[questionId] || "pending";
}

function setStatus(questionId, value) {
  if (value === "pending") {
    delete state.statuses[questionId];
  } else {
    state.statuses[questionId] = value;
  }
  saveStatuses();
  render();
}

function shuffle(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function buildFilteredQuestions() {
  const normalizedQuery = state.query.trim().toLowerCase();
  const filtered = QUESTIONS.filter((question) => {
    const status = getStatus(question.id);
    const inFilter =
      state.filter === "all" ||
(state.filter === "active" && status !== "mastered" && status !== "review") ||
      (state.filter === "mastered" && status === "mastered") ||
      (state.filter === "review" && status === "review");

    if (!inFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [question.text, question.answer, ...question.options]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return state.sortMode === "random" ? shuffle(filtered) : filtered;
}

function computeStats() {
  const total = QUESTIONS.length;
  let mastered = 0;
  let review = 0;

  for (const question of QUESTIONS) {
    const status = getStatus(question.id);
    if (status === "mastered") {
      mastered += 1;
    } else if (status === "review") {
      review += 1;
    }
  }

  return {
    total,
    mastered,
    review,
    pending: total - mastered,
  };
}

function buildStatusLabel(status) {
  if (status === "mastered") {
    return { text: "Dominada", className: "status-mastered" };
  }
  if (status === "review") {
    return { text: "Repasar", className: "status-review" };
  }
  return { text: "Pendiente", className: "" };
}

function createOption(text, isCorrect, showAnswer) {
  const option = document.createElement("button");
  option.type = "button";
  option.className = "option";
  option.textContent = text;
  option.dataset.correct = String(isCorrect);
  option.dataset.revealed = String(showAnswer);
  return option;
}

function resolveImage(question) {
  return question.imageLocal || question.imageUrl || "";
}

function renderCard(question) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".question-card");
  const status = getStatus(question.id);
  const statusLabel = buildStatusLabel(status);
  let selectedIndex = null;
  let answerVisible = false;

  fragment.querySelector(".question-number").textContent =
    `Pregunta ${question.id}`;

  const statusBadge = fragment.querySelector(".question-status");
  statusBadge.textContent = statusLabel.text;
  if (statusLabel.className) {
    statusBadge.classList.add(statusLabel.className);
  }

  fragment.querySelector(".question-text").textContent = question.text;
  card.dataset.source = question.sourceLabel;

  const image = fragment.querySelector(".question-image");
  const imageSource = resolveImage(question);
  if (imageSource) {
    image.src = imageSource;
    image.alt = `Imagen asociada a la pregunta ${question.id}`;
    image.hidden = false;
    image.addEventListener(
      "error",
      () => {
        if (question.imageUrl && image.src !== question.imageUrl) {
          image.src = question.imageUrl;
        } else {
          image.hidden = true;
        }
      },
      { once: true },
    );
  }

  const optionsWrap = fragment.querySelector(".options");
  const answerPanel = fragment.querySelector(".answer-panel");
  const answerResult = fragment.querySelector(".answer-result");
  const answerText = fragment.querySelector(".answer-text");
  const toggleAnswerButton = fragment.querySelector(".toggle-answer");
  answerText.textContent = question.answer;

  function paintOptions() {
    optionsWrap.innerHTML = "";

    question.options.forEach((optionText, index) => {
      const option = createOption(
        optionText,
        index === question.correctIndex,
        answerVisible,
      );

      if (selectedIndex === index) {
        option.classList.add("is-selected");
      }

      if (answerVisible) {
        option.disabled = true;
        if (index === question.correctIndex) {
          option.classList.add("is-correct");
        } else if (
          selectedIndex === index &&
          selectedIndex !== question.correctIndex
        ) {
          option.classList.add("is-incorrect");
        }
      } else {
        option.addEventListener("click", () => {
          selectedIndex = index;
          toggleAnswerButton.disabled = false;
          paintOptions();
        });
      }

      optionsWrap.append(option);
    });
  }

  toggleAnswerButton.disabled = true;
  toggleAnswerButton.addEventListener("click", () => {
    if (selectedIndex === null) {
      return;
    }

    answerVisible = !answerVisible;
    answerPanel.hidden = !answerVisible;
    toggleAnswerButton.textContent = answerVisible
      ? "Ocultar respuesta"
      : "Mostrar respuesta";

    if (answerVisible) {
      const isCorrect = selectedIndex === question.correctIndex;
      answerResult.textContent = isCorrect
        ? "Tu respuesta es correcta."
        : `Tu respuesta no es correcta. Elegiste: ${question.options[selectedIndex]}`;
      answerPanel.classList.toggle("answer-panel-correct", isCorrect);
      answerPanel.classList.toggle("answer-panel-incorrect", !isCorrect);
    }

    paintOptions();
  });

  paintOptions();

  fragment
    .querySelector(".mark-mastered")
    .addEventListener("click", () => setStatus(question.id, "mastered"));
  fragment
    .querySelector(".mark-review")
    .addEventListener("click", () => setStatus(question.id, "review"));
  fragment
    .querySelector(".clear-state")
    .addEventListener("click", () => setStatus(question.id, "pending"));

  return fragment;
}

function render() {
  const filteredQuestions = buildFilteredQuestions();
  const stats = computeStats();

  elements.totalCount.textContent = String(stats.total);
  elements.pendingCount.textContent = String(stats.pending);
  elements.masteredCount.textContent = String(stats.mastered);
  elements.reviewCount.textContent = String(stats.review);
  elements.progressBar.style.width = `${stats.total ? (stats.mastered / stats.total) * 100 : 0}%`;
  elements.resultsLabel.textContent = `${filteredQuestions.length} preguntas visibles de ${stats.total}`;

  elements.list.innerHTML = "";
  if (!filteredQuestions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No hay preguntas que coincidan con ese filtro. Probá cambiando el estado o la búsqueda.";
    elements.list.append(empty);
    return;
  }

  filteredQuestions.forEach((question) => {
    elements.list.append(renderCard(question));
  });
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.statusFilter.addEventListener("change", (event) => {
  state.filter = event.target.value;
  render();
});

elements.sortMode.addEventListener("change", (event) => {
  state.sortMode = event.target.value;
  render();
});

elements.showOnlyUnknown.addEventListener("click", () => {
  state.filter = state.filter === "active" ? "all" : "active";
  elements.statusFilter.value = state.filter;
  render();
});

elements.resetProgress.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Se van a borrar las marcas guardadas en esta compu. ¿Querés continuar?",
  );
  if (!confirmed) {
    return;
  }
  state.statuses = {};
  saveStatuses();
  render();
});

elements.nextPending.addEventListener("click", () => {
  const pendingQuestions = QUESTIONS.filter(
    (question) => getStatus(question.id) !== "mastered",
  );
  if (!pendingQuestions.length) {
    window.alert("No quedan preguntas pendientes.");
    return;
  }
  const target =
    pendingQuestions[Math.floor(Math.random() * pendingQuestions.length)];
  const card = [...document.querySelectorAll(".question-card")].find(
    (node) =>
      node.querySelector(".question-number").textContent ===
      `Pregunta ${target.id}`,
  );
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.01)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 500,
      },
    );
    return;
  }

  state.filter = "all";
  elements.statusFilter.value = "all";
  render();
  requestAnimationFrame(() => {
    const refreshedCard = [...document.querySelectorAll(".question-card")].find(
      (node) =>
        node.querySelector(".question-number").textContent ===
        `Pregunta ${target.id}`,
    );
    refreshedCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

render();
