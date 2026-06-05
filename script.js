// ======================
// DOM ELEMENTS
// ======================
const themeBtn = document.querySelector(".theme-btn");

const jobForm = document.getElementById("jobForm");

const companyInput = document.getElementById("company");
const positionInput = document.getElementById("position");
const dateInput = document.getElementById("date");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

const applicationsContainer = document.querySelector(".applications-container");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

const appliedCount = document.querySelector(".applied h2");
const interviewCount = document.querySelector(".interview h2");
const acceptedCount = document.querySelector(".accepted h2");
const rejectedCount = document.querySelector(".rejected h2");

const cancelBtn = document.getElementById("cancelBtn");


// ======================
// STATE
// ======================
let applications =
  JSON.parse(localStorage.getItem("applications")) || [];

let editIndex = null;
let searchTerm = "";
let selectedStatus = "all";


// ======================
// INIT
// ======================
renderApplications();

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}


// ======================
// EVENTS
// ======================

// FILTER
filterStatus.addEventListener("change", function () {
  selectedStatus = this.value;
  renderApplications();
});

// SEARCH
searchInput.addEventListener("input", function () {
  searchTerm = this.value.toLowerCase();
  renderApplications();
});

// SUBMIT
jobForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (
    companyInput.value.trim() === "" ||
    positionInput.value.trim() === ""
  ) {
    showToast("Please fill company and position");
    return;
  }

  const application = {
    company: companyInput.value,
    position: positionInput.value,
    date: dateInput.value,
    status: statusInput.value,
    notes: notesInput.value,
  };

  if (editIndex === null) {
    applications.push(application);
  } else {
    applications[editIndex] = application;
    editIndex = null;
  }

  saveData();
  renderApplications();
  clearForm();

  document.querySelector("#jobForm button").textContent = "Add Application";
});


// THEME
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});


// CANCEL EDIT
cancelBtn.addEventListener("click", cancelEdit);


// ======================
// RENDER
// ======================
function renderApplications() {

  applications.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});
  applicationsContainer.innerHTML = "";

  if (applications.length === 0) {
    applicationsContainer.innerHTML = `
      <p class="empty-state">Start tracking your first application 🚀</p>
    `;
    updateDashboard(0, 0, 0, 0);
    return;
  }

  let applied = 0;
  let interview = 0;
  let accepted = 0;
  let rejected = 0;
  let hasResults = false;

  applications.forEach((app, index) => {

    if (
      selectedStatus !== "all" &&
      app.status !== selectedStatus
    ) return;

    if (
      !app.company.toLowerCase().includes(searchTerm)
    ) return;

    hasResults = true;

    if (app.status === "Applied") applied++;
    else if (app.status === "Interview") interview++;
    else if (app.status === "Accepted") accepted++;
    else if (app.status === "Rejected") rejected++;

    const statusClass = getStatusClass(app.status);

    applicationsContainer.innerHTML += `
      <div class="job-card">
        <h3>${app.company}</h3>
        <p>${app.position}</p>

        <span class="status ${statusClass}">
          ${app.status}
        </span>

        <p class="date">${app.date}</p>
        <p>${app.notes}</p>

        <div class="card-buttons">
          <button class="edit-btn" onclick="editApplication(${index})">
            Edit
          </button>

          <button class="delete-btn" onclick="deleteApplication(${index})">
            Delete
          </button>
        </div>
      </div>
    `;
  });
  if (!hasResults) {
    applicationsContainer.innerHTML = `
      <p class="empty-state">No matching results found.</p>
    `;
  }

  updateDashboard(applied, interview, accepted, rejected);
}


// ======================
// FUNCTIONS
// ======================

function deleteApplication(index) {
  const confirmDelete =
    confirm("Are you sure you want to delete this application?");

  if (!confirmDelete) return;

  applications.splice(index, 1);
  saveData();
  renderApplications();
}

function editApplication(index) {
  const app = applications[index];

  companyInput.value = app.company;
  positionInput.value = app.position;
  dateInput.value = app.date;
  statusInput.value = app.status;
  notesInput.value = app.notes;

  editIndex = index;

  document.querySelector("#jobForm button").textContent =
    "Update Application";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function cancelEdit() {
  editIndex = null;
  clearForm();

  document.querySelector("#jobForm button").textContent =
    "Add Application";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
}

function getStatusClass(status) {
  if (status === "Applied") return "applied-status";
  if (status === "Interview") return "interview-status";
  if (status === "Accepted") return "accepted-status";
  if (status === "Rejected") return "rejected-status";
  return "";
}

function updateDashboard(a, i, ac, r) {
  const total = a + i + ac + r;

  const percent = (v) =>
    total === 0 ? 0 : Math.round((v / total) * 100);

  appliedCount.textContent = `${a} (${percent(a)}%)`;
  interviewCount.textContent = `${i} (${percent(i)}%)`;
  acceptedCount.textContent = `${ac} (${percent(ac)}%)`;
  rejectedCount.textContent = `${r} (${percent(r)}%)`;
}

function saveData() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

function clearForm() {
  companyInput.value = "";
  positionInput.value = "";
  dateInput.value = "";
  statusInput.value = "Applied";
  notesInput.value = "";
}
