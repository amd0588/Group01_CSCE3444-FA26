let busy = false;

// ---------- Shared elements ----------
const stage = document.getElementById("stage");
const addInput = document.getElementById("add-value");
const removeInput = document.getElementById("remove-value");
const title = document.getElementById("data-structure");
const codeEl = document.getElementById("code");
const descEl = document.getElementById("description-view");

// ---------- Shared helpers ----------
function createNode(value) {
    const node = document.createElement("div");
    node.className = "node";
    node.textContent = value;
    return node;
}

function removeNode(node) {
    node.classList.add("removing");
    setTimeout(() => node.remove(), 300)
    node.addEventListener("animationend", (e) => {
        if (e.target==node) node.remove();
    });
}

function createListItem(value) {
    const item = document.createElement("div");   // make an empty <div>
    item.className = "ll-item";                   // give it a CSS class

    const box = document.createElement("div");
    box.className = "node";
    box.textContent = value;                      // put the number inside

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";

    item.appendChild(box);                        // put the box inside the item
    item.appendChild(arrow);                      // and the arrow after it
    return item;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---------- One object per data structure ----------
const structures = {
    "Linked List": {
        stageClass: "linked-list",
        code: `function add(list, value) {
  list.append(value);
}

function remove(list, value) {
  list.delete(value);
}`,
        description: `<h3>Linked List</h3>
<p>A linked list stores values in nodes, and each node points to the next one.</p>
<ul>
  <li>Insert / remove at head: O(1)</li>
  <li>Search: O(n)</li>
</ul>`,
        async add(value) {
            // 1. Walk down the existing list, lighting up each node
            const items = stage.querySelectorAll(".ll-item:not(.removing)");
            for (const item of items) {
                const box = item.querySelector(".node");
                box.classList.add("highlight");
                await sleep(400);
                box.classList.remove("highlight");
            }

            // 2. Attach the new node at the end
            stage.appendChild(createListItem(value));
        },

        async remove(value) {
            if (busy) return;
            busy = true;
            try {
                const items = Array.from(stage.querySelectorAll(".ll-item:not(.removing)"));

                for (const item of items) {
                    const box = item.querySelector(".node");
                    box.classList.add("highlight");
                    await sleep(400);
                    box.classList.remove("highlight");

                    // 3. Found it? Fade it out and stop looking
                    if (box.textContent === value) {
                        console.log("matched", value)
                        removeNode(item);
                        return;
                    }
                }
            } finally {
                busy = false;
            }
        }
    },

    "Stack": {
        code: `function push(stack, value) {
  stack.push(value);
}

function pop(stack) {
  return stack.pop();
}`,
        description: `<h3>Stack</h3>
<p>A stack is last-in, first-out (LIFO). You only add and remove at the top.</p>
<ul>
  <li>Push: O(1)</li>
  <li>Pop: O(1)</li>
</ul>`,
        add(value) {
            stage.appendChild(createNode(value));
        },
        remove() {
            // always removes the top (last) node
            const top = stage.querySelector(".node:last-child:not(.removing)");
            if (top) removeNode(top);
        }
    },

    "Queue": {
        code: `function enqueue(queue, value) {
  queue.push(value);
}

function dequeue(queue) {
  return queue.shift();
}`,
        description: `<h3>Queue</h3>
<p>A queue is first-in, first-out (FIFO). Add at the back, remove from the front.</p>
<ul>
  <li>Enqueue: O(1)</li>
  <li>Dequeue: O(1)</li>
</ul>`,
        add(value) {
            stage.appendChild(createNode(value));
        },
        remove() {
            // always removes the front (first) node
            const front = stage.querySelector(".node:not(.removing)");
            if (front) removeNode(front);
        }
    }
};

let current = structures["Linked List"];

// ---------- Switching structures ----------
function selectStructure(name) {
    current = structures[name];
    stage.className = "stage " + (current.stageClass || "");
    title.textContent = name;
    codeEl.textContent = current.code;
    descEl.innerHTML = current.description;
    stage.innerHTML = "";   // clear the stage
}

document.querySelectorAll(".dropdown-content a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const name = link.textContent;
        if (structures[name]) selectStructure(name);
    });
});

// ---------- Add / Remove buttons ----------
document.getElementById("add").addEventListener("click", () => {
    const text = addInput.value.trim();
    if (text === "" || isNaN(Number(text))) {
        addInput.focus();
        return;
    }
    current.add(String(Number(text)));
    addInput.value = "";
    addInput.focus();
});

document.getElementById("remove").addEventListener("click", () => {
    const text = removeInput.value.trim();
    current.remove(text === "" ? "" : String(Number(text)));
    removeInput.value = "";
    removeInput.focus();
});

addInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("add").click();
});
removeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("remove").click();
});

// ---------- Tabs ----------
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

// ---------- Initial load ----------
selectStructure("Linked List");