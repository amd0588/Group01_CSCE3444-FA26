const stage = document.getElementById("stage");
let counter = 1;

document.getElementById("add").addEventListener("click", () => {
    const node = document.createElement("div");
    node.className = "node";
    node.textContent = counter++;
    stage.appendChild(node);
});

document.getElementById("remove").addEventListener("click", () => {
    const last = stage.lastElementChild;
    if (!last || last.classList.contains("removing")) return;
    last.classList.add("removing");
    last.addEventListener("animationend", () => last.remove());
});

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.target).classList.add("active");
    });
});