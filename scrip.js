const cn = document.getElementById("cn");
const ch = document.getElementById("ch");
const grade = document.getElementById("grade");
const ac = document.getElementById("addCourse");
const tb = document.getElementById("tableBody");
const calculate = document.getElementById("calculate");
const gpa = document.getElementById("gpa");

let courses = [];

// Grade → Point
function gradeToPoint(grade) {
    const grades = {
        "A+": 4.0,
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D+": 1.3,
        "D": 1.0,
        "D-": 0.7,
        "F": 0.0
    };

    return grades[grade];
}

// Add Course
ac.addEventListener("click", function () {

    let course = cn.value.trim();
    let credit = Number(ch.value);
    let g = grade.value;

    if (course === "") {
        alert("Enter Course Name");
        return;
    }

    // Duplicate Course Check
    let duplicate = courses.find(c => c.course.toLowerCase() === course.toLowerCase());

    if (duplicate) {
        alert("Course already exists.");
        return;
    }

    // Save in Array
    let obj = {
        course: course,
        credit: credit,
        grade: g
    };

    courses.push(obj);

    // Create Table Row
    let row = document.createElement("tr");

    let c1 = document.createElement("td");
    let c2 = document.createElement("td");
    let c3 = document.createElement("td");
    let c4 = document.createElement("td");
    let c5 = document.createElement("td");

    c1.innerText = course;
    c2.innerText = credit;
    c3.innerText = g;
    c4.innerText = gradeToPoint(g);

    // Delete Button
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete-btn");

    c5.appendChild(deleteBtn);

    row.appendChild(c1);
    row.appendChild(c2);
    row.appendChild(c3);
    row.appendChild(c4);
    row.appendChild(c5);

    tb.appendChild(row);

    // Delete Logic
    deleteBtn.addEventListener("click", function () {

        let index = courses.indexOf(obj);

        if (index !== -1) {
            courses.splice(index, 1);
        }

        tb.removeChild(row);

    });

    // Clear Inputs
    cn.value = "";
    ch.selectedIndex = 0;
    grade.selectedIndex = 0;

});

// Calculate GPA
calculate.addEventListener("click", function () {

    if (courses.length === 0) {
        alert("Please Add Courses First");
        return;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i < courses.length; i++) {

        let point = gradeToPoint(courses[i].grade);

        totalPoints += point * courses[i].credit;

        totalCredits += courses[i].credit;
    }

    let result = totalPoints / totalCredits;

    gpa.value = result.toFixed(2);

});