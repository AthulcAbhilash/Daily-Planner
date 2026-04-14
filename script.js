let tasks = [];

const fixedCheck = document.getElementById("fixedCheck");
const fixedTime = document.getElementById("fixedTime");
fixedCheck.addEventListener("change", () => {
    fixedTime.disabled = !fixedCheck.checked;
});

function addTask() {
    let name = document.getElementById("taskName").value;
    let time = parseInt(document.getElementById("taskTime").value);
    if (!name || !time) return;
    let fixed = fixedCheck.checked ? timeToMinutes(fixedTime.value) : null;
    tasks.push({
        name,
        time,
        fixedTime: fixed
    });
    let div = document.createElement("div");
    div.innerText = name + " (" + time + " min)";
    document.getElementById("taskList").appendChild(div);
    document.getElementById("taskName").value = "";
    document.getElementById("taskTime").value = "";
}

function generateRoutine() {
    let wake = document.getElementById("wakeTime").value;
    let sleep = document.getElementById("sleepTime").value;
    let breakfast = parseInt(document.getElementById("breakfastTime").value) || 60;
    let lunch = parseInt(document.getElementById("lunchTime").value) || 60;
    let dinner = parseInt(document.getElementById("dinnerTime").value) || 60;

    if (!wake || !sleep) return alert("Enter wake and sleep time");
    let output = document.getElementById("output");
    output.innerHTML = "";

    let pointer = timeToMinutes(wake);
    let end = timeToMinutes(sleep);
    let final = [];
    let meals = [
        { name: "Breakfast", time: 8 * 60, duration: breakfast },
        { name: "Lunch", time: 13 * 60, duration: lunch },
        { name: "Dinner", time: 20 * 60, duration: dinner }
    ];
    let fixedTasks = tasks.filter(t => t.fixedTime !== null);
    let flexible = tasks.filter(t => t.fixedTime === null);
    fixedTasks = fixedTasks.map(t => ({
        name: t.name,
        time: t.fixedTime,
        duration: t.time
    }));
    let allFixed = [...meals, ...fixedTasks].sort((a, b) => a.time - b.time);
    allFixed.forEach(block => {
        while (flexible.length > 0 && pointer + flexible[0].time <= block.time) {
            let task = flexible.shift();
            final.push({ time: pointer, name: task.name });
            pointer += task.time;
            if (task.name.toLowerCase().includes("study") || task.name.toLowerCase().includes("coding")) {
                final.push({ time: pointer, name: "Break (15 min)" });
                pointer += 15;
            }
        }
        if (block.time >= pointer && block.time < end) {
            final.push({ time: block.time, name: block.name });
            pointer = block.time + block.duration;
        }
    });
    flexible.forEach(task => {
        if (pointer + task.time <= end) {
            final.push({ time: pointer, name: task.name });
            pointer += task.time;
            if (task.name.toLowerCase().includes("study") || task.name.toLowerCase().includes("coding")) {
                final.push({ time: pointer, name: "Break (15 min)" });
                pointer += 15;
            }
        }
    });
    final.forEach(item => {
        let div = document.createElement("div");
        div.innerText = formatTime(item.time) + " → " + item.name;
        div.style.borderLeft = "4px solid " + getColor(item.name);
        output.appendChild(div);
    });
    let msg = document.getElementById("message");
    if (pointer > end) {
        msg.innerText = "⚠️ Day overloaded. Reduce tasks.";
        msg.style.color = "red";
    } else {
        msg.innerText = "✅ Balanced plan!";
        msg.style.color = "green";
    }
}

function timeToMinutes(t) {
    let [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function formatTime(min) {
    let h = Math.floor(min / 60);
    let m = min % 60;
    let ampm = h >= 12 ? "PM" : "AM";
    let hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getColor(name) {

    name = name.toLowerCase();
    if (name.includes("study")) return "#007bff";
    if (name.includes("gym")) return "#28a745";
    if (name.includes("break")) return "#ffc107";
    if (name.includes("meal") || name.includes("breakfast") || name.includes("lunch") || name.includes("dinner")) return "#ff5722";
    return "red";
}