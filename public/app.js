// Progressive enhancement only. The register is rendered into index.html by
// scripts/render.mjs, so everything below is optional: filtering, ordering,
// shareable views, browser-local review state and export. With JavaScript off
// the page still shows every record in full, in date order, with working links.

const KEY = "platform-evidence-lab-v1";
const $ = (s) => document.querySelector(s);
const cardsRoot = $("#cards");
if (cardsRoot) {
  const cards = Array.prototype.slice.call(cardsRoot.querySelectorAll(".card"));
  const controls = { q: $("#search"), platform: $("#platform"), type: $("#type"), assessment: $("#assessment"), sort: $("#sort") };
  const summary = $("#summary");
  const empty = $("#empty");
  let state = loadState();

  function loadState() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch { return {}; }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode; review stays in memory */ }
  }

  function assessmentOf(id) { return (state[id] && state[id].assessment) || "Unreviewed"; }

  function paintCard(card) {
    const id = card.dataset.id;
    const select = card.querySelector('[data-action="assessment"]');
    if (select) select.value = assessmentOf(id);
    const button = card.querySelector('[data-action="save"]');
    if (button) {
      const saved = !!(state[id] && state[id].saved);
      button.setAttribute("aria-pressed", saved ? "true" : "false");
      button.classList.toggle("saved", saved);
      const label = button.querySelector("[data-label]");
      if (label) label.textContent = saved ? "Saved" : "Save";
    }
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    Object.keys(controls).forEach((key) => {
      const name = key === "q" ? "q" : key;
      const value = params.get(name);
      if (value !== null && controls[key]) controls[key].value = value;
    });
  }

  function writeUrl() {
    const params = new URLSearchParams();
    Object.keys(controls).forEach((key) => {
      const node = controls[key];
      if (!node || !node.value) return;
      if (key === "sort" && node.value === "date-desc") return;
      params.set(key === "q" ? "q" : key, node.value);
    });
    const query = params.toString();
    history.replaceState(null, "", (query ? "?" + query : location.pathname) + location.hash);
  }

  function apply() {
    const q = controls.q.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const ok = (!q || card.dataset.text.indexOf(q) !== -1)
        && (!controls.platform.value || card.dataset.platform === controls.platform.value)
        && (!controls.type.value || card.dataset.type === controls.type.value)
        && (!controls.assessment.value || assessmentOf(card.dataset.id) === controls.assessment.value);
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    const order = controls.sort.value;
    cards.slice().sort((a, b) => {
      if (order === "date-asc") return a.dataset.date.localeCompare(b.dataset.date);
      if (order === "title") return a.dataset.title.localeCompare(b.dataset.title);
      if (order === "type") return a.dataset.type.localeCompare(b.dataset.type) || b.dataset.date.localeCompare(a.dataset.date);
      return b.dataset.date.localeCompare(a.dataset.date);
    }).forEach((card) => cardsRoot.appendChild(card));
    const saved = Object.values(state).filter((entry) => entry && entry.saved).length;
    summary.textContent = shown + " of " + cards.length + " records shown; " + saved + " saved locally.";
    empty.hidden = shown !== 0;
    writeUrl();
  }

  $("#filters").addEventListener("submit", (event) => event.preventDefault());
  controls.q.addEventListener("input", apply);
  ["platform", "type", "assessment", "sort"].forEach((key) => controls[key].addEventListener("change", apply));

  $("#clear").addEventListener("click", () => {
    controls.q.value = ""; controls.platform.value = ""; controls.type.value = ""; controls.assessment.value = ""; controls.sort.value = "date-desc";
    apply();
    summary.textContent = "Filters cleared. " + cards.length + " of " + cards.length + " records shown.";
  });

  const share = $("#share");
  if (navigator.clipboard && share) {
    share.hidden = false;
    share.addEventListener("click", () => {
      navigator.clipboard.writeText(location.href).then(() => {
        summary.textContent = "Link to this view copied to the clipboard.";
      }, () => {
        summary.textContent = "The browser refused clipboard access; copy the address bar instead.";
      });
    });
  }

  cardsRoot.addEventListener("change", (event) => {
    if (event.target.dataset.action !== "assessment") return;
    const card = event.target.closest(".card");
    const id = card.dataset.id;
    state[id] = Object.assign({}, state[id], { assessment: event.target.value });
    saveState();
    apply();
  });

  cardsRoot.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="save"]');
    if (!button) return;
    const card = button.closest(".card");
    const id = card.dataset.id;
    state[id] = Object.assign({}, state[id], { saved: !(state[id] && state[id].saved) });
    saveState();
    paintCard(card);
    apply();
    summary.textContent = (state[id].saved ? "Saved " : "Unsaved ") + card.dataset.title + ".";
  });

  $("#reset").addEventListener("click", () => {
    state = {};
    try { localStorage.removeItem(KEY); } catch { /* nothing stored */ }
    cards.forEach(paintCard);
    apply();
    summary.textContent = "Local review reset.";
  });

  $("#export").addEventListener("click", async () => {
    let payload;
    try {
      const response = await fetch("/api/dashboard", { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error("unavailable");
      payload = await response.json();
    } catch {
      summary.textContent = "Export unavailable: the register endpoint did not respond.";
      return;
    }
    payload.exportedAt = new Date().toISOString();
    payload.records = payload.records.map((record) => Object.assign({}, record, {
      review: { assessment: assessmentOf(record.id), saved: !!(state[record.id] && state[record.id].saved) },
    }));
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    anchor.download = "platform-moderation-evidence.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    summary.textContent = "JSON export prepared, with your local review attached to each record.";
  });

  cards.forEach(paintCard);
  readUrl();
  apply();
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && target.hidden) $("#clear").click();
    if (target) target.scrollIntoView();
  }
}
