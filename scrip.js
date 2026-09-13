// ===== Elements =====
const cn = document.getElementById("cn");
const ch = document.getElementById("ch");
const grade = document.getElementById("grade");
const ac = document.getElementById("addCourse");
const tb = document.getElementById("tableBody");
const calculate = document.getElementById("calculate");
const gpa = document.getElementById("gpa");
const gpaRemark = document.getElementById("gpaRemark");
const clearAll = document.getElementById("clearAll");
const emptyMsg = document.getElementById("emptyMsg");
const themeToggle = document.getElementById("themeToggle");

const statCourses = document.getElementById("statCourses");
const statCredits = document.getElementById("statCredits");
const statGPA = document.getElementById("statGPA");

const STORAGE_KEY = "gpa_calc_courses";
const THEME_KEY = "gpa_calc_theme";

let courses = [];
let editIndex = null; // if not null, we are editing this course index

// ===== Grade → Point =====
function gradeToPoint(g) {
    const grades = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "D-": 0.7,
        "F": 0.0
    };
    return grades[g];
}

// ===== Persistence =====
function saveCourses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function loadCourses() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            courses = JSON.parse(saved);
        } catch (e) {
            courses = [];
        }
    }
}

// ===== Theme =====
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.innerHTML = theme === "dark"
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem(THEME_KEY, theme);
}

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
});

(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }
})();

// ===== Render Table =====
function renderTable() {
    tb.innerHTML = "";

    if (courses.length === 0) {
        emptyMsg.style.display = "block";
    } else {
        emptyMsg.style.display = "none";
    }

    courses.forEach((c, index) => {
        const row = document.createElement("tr");

        const point = gradeToPoint(c.grade).toFixed(2);

        row.innerHTML = `
            <td data-label="Course">${escapeHtml(c.course)}</td>
            <td data-label="Credit Hrs">${c.credit}</td>
            <td data-label="Grade">${c.grade}</td>
            <td data-label="Grade Point">${point}</td>
            <td data-label="Action">
                <button class="delete-btn edit-btn" data-index="${index}" style="background:#f59e0b;margin-right:6px;"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        `;

        tb.appendChild(row);
    });

    // Attach delete listeners
    tb.querySelectorAll(".delete-btn:not(.edit-btn)").forEach(btn => {
        btn.addEventListener("click", function () {
            const idx = Number(this.getAttribute("data-index"));
            courses.splice(idx, 1);
            saveCourses();
            renderTable();
            updateStats();
        });
    });

    // Attach edit listeners
    tb.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const idx = Number(this.getAttribute("data-index"));
            const course = courses[idx];
            cn.value = course.course;
            ch.value = course.credit;
            grade.value = course.grade;
            editIndex = idx;
            ac.innerHTML = '<i class="fa-solid fa-check"></i> Update Course';
            cn.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    updateStats();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ===== Stats =====
function updateStats() {
    const totalCourses = courses.length;
    const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);

    let currentGPA = "0.00";
    if (totalCredits > 0) {
        const totalPoints = courses.reduce((sum, c) => sum + gradeToPoint(c.grade) * c.credit, 0);
        currentGPA = (totalPoints / totalCredits).toFixed(2);
    }

    statCourses.textContent = totalCourses;
    statCredits.textContent = totalCredits;
    statGPA.textContent = currentGPA;
}

// ===== Add / Update Course =====
ac.addEventListener("click", function () {

    let course = cn.value.trim();
    let credit = Number(ch.value);
    let g = grade.value;

    if (course === "") {
        alert("Enter Course Name");
        cn.focus();
        return;
    }

    // Duplicate check (skip the one being edited)
    let duplicate = courses.find((c, i) =>
        c.course.toLowerCase() === course.toLowerCase() && i !== editIndex
    );

    if (duplicate) {
        alert("Course already exists.");
        return;
    }

    const obj = { course, credit, grade: g };

    if (editIndex !== null) {
        courses[editIndex] = obj;
        editIndex = null;
        ac.innerHTML = '<i class="fa-solid fa-plus"></i> Add Course';
    } else {
        courses.push(obj);
    }

    saveCourses();
    renderTable();

    // Clear inputs
    cn.value = "";
    ch.selectedIndex = 2; // default back to 3 credit hours
    grade.selectedIndex = 0;
    cn.focus();
});

// Allow pressing Enter in course name field to add course
cn.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        ac.click();
    }
});

// ===== Calculate GPA =====
calculate.addEventListener("click", function () {

    if (courses.length === 0) {
        alert("Please Add Courses First");
        return;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i < courses.length; i++) {
        const point = gradeToPoint(courses[i].grade);
        totalPoints += point * courses[i].credit;
        totalCredits += courses[i].credit;
    }

    const result = totalPoints / totalCredits;
    gpa.textContent = result.toFixed(2);

    // Remark based on GPA
    let remark = "";
    if (result >= 3.7) remark = '<i class="fa-solid fa-star"></i> Excellent! Keep it up.';
    else if (result >= 3.3) remark = '<i class="fa-solid fa-thumbs-up"></i> Very Good.';
    else if (result >= 3.0) remark = '<i class="fa-solid fa-face-smile"></i> Good standing.';
    else if (result >= 2.0) remark = '<i class="fa-solid fa-triangle-exclamation"></i> Satisfactory — room to improve.';
    else remark = '<i class="fa-solid fa-circle-exclamation"></i> Needs serious improvement.';

    gpaRemark.innerHTML = remark;

    // Smooth scroll to result on mobile
    document.querySelector(".result-box").scrollIntoView({ behavior: "smooth", block: "center" });
});

// ===== Clear All =====
clearAll.addEventListener("click", function () {
    if (courses.length === 0) return;

    if (confirm("Are you sure you want to remove all courses?")) {
        courses = [];
        editIndex = null;
        ac.innerHTML = '<i class="fa-solid fa-plus"></i> Add Course';
        saveCourses();
        renderTable();
        gpa.textContent = "0.00";
        gpaRemark.textContent = "";
    }
});

// ===== Init =====
loadCourses();
renderTable();
