let busy = false;
let animationVersion = 0;
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
        if (e.target == node) node.remove();
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

let bstRoot = null;

//takes care of the inser
function bstInsert(node, value) {
    if (!node) return { value, left: null, right: null };
    if (value < node.value) node.left = bstInsert(node.left, value);
    else if (value > node.value) node.right = bstInsert(node.right, value);
    return node;
}
//takes care of deleting
function bstDelete(node, value) {
    if (!node) return null;
    if (value < node.value) node.left = bstDelete(node.left, value);
    else if (value > node.value) node.right = bstDelete(node.right, value);
    else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let next = node.right;                 // smallest value on the right
        while (next.left) next = next.left;
        node.value = next.value;
        node.right = bstDelete(node.right, next.value);
    }
    return node;
}
//builds the tree
function bstBuild(node, newValue) {
    const subtree = document.createElement("div");
    subtree.className = "bst-subtree";

    const box = document.createElement("div");
    box.className = "node" + (node.value === newValue ? " new" : "");
    box.textContent = node.value;
    box.dataset.value = node.value;
    subtree.appendChild(box);

    if (node.left || node.right) {
        const kids = document.createElement("div");
        kids.className = "bst-children";
        for (const child of [node.left, node.right]) {
            if (child) kids.appendChild(bstBuild(child, newValue));
            else {
                const spacer = document.createElement("div");
                spacer.className = "bst-spacer";
                kids.appendChild(spacer);
            }
        }
        subtree.appendChild(kids);
    }
    return subtree;
}
//builds visual
function bstRender(newValue) {
    stage.innerHTML = "";
    if (bstRoot) stage.appendChild(bstBuild(bstRoot, newValue));
}
//takes care of highlighting
async function bstHighlightPath(value) {
    const version = animationVersion;
    let n = bstRoot;

    while (n) {
        const box = stage.querySelector(`[data-value="${n.value}"]`);
        if (!box) return false;

        box.classList.add("highlight");
        await sleep(400);
        box.classList.remove("highlight");

        if (version !== animationVersion) return false;
        if (value === n.value) return true;

        n = value < n.value ? n.left : n.right;
    }

    return true;
}

// ---------- One object per data structure ----------
const structures = {
    "Linked List": {
        stageClass: "linked-list",
        code: `// Linked list pseudocode

// Add a value:
Create a new node containing the value.
If the list is empty, make it the head.
Otherwise, follow next pointers to the last node.
Link the last node to the new node.

// Remove the first matching value:
Search from the head for the value.
If it is the head, move head to the next node.
Otherwise, link the previous node to the next node.
If no match exists, report "Value not found."`,
        description: `<h3>Linked List</h3>
<p>A linked list stores values in nodes, and each node points to the next one.</p>
<ul>
  <li>Insert / remove at head: O(1)</li>
  <li>Search: O(n)</li>
</ul>`,
        async add(value) {
            const version = animationVersion;
            // 1. Walk down the existing list, lighting up each node
            const items = stage.querySelectorAll(".ll-item:not(.removing)");
            for (const item of items) {
                const box = item.querySelector(".node");
                box.classList.add("highlight");
                await sleep(400);

                if (version !== animationVersion) return;
                box.classList.remove("highlight");
            }

            // 2. Attach the new node at the end
            stage.appendChild(createListItem(value));
        },

        async remove(value) {
            if (busy) return;
            busy = true;
            const version = animationVersion;
            try {
                const items = Array.from(stage.querySelectorAll(".ll-item:not(.removing)"));
                if (items.length === 0) {
                    alert("The linked list is empty.");
                    return;
                }
                for (const item of items) {
                    const box = item.querySelector(".node");
                    box.classList.add("highlight");
                    await sleep(400);
                    if (version !== animationVersion) return;
                    box.classList.remove("highlight");

                    // 3. Found it? Fade it out and stop looking
                    if (box.textContent === value) {
                        console.log("matched", value)
                        removeNode(item);
                        return;
                    }
                } alert("Value not found.");
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

            if (top) {
                removeNode(top);
            } else {
                alert("The stack is empty.");
            }
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

            if (front) {
                removeNode(front);
            } else {
                alert("The queue is empty.");
            }
        }
    },

    "Binary Search Tree": {
        stageClass: "bst",
        code: `// Insert a value and keep the updated root.
bstRoot = bstInsert(bstRoot, value);

// Delete a value and keep the updated root.
bstRoot = bstDelete(bstRoot, value);`,
        description: `<h3>Binary Search Tree</h3>
        <p>L</p>
        <ul>
            <li>add</li>
            <li>delete</li>
        </ul>`,
        async add(value) {
            const v = Number(value);

            if (await bstHighlightPath(v) === false) return;

            bstRoot = bstInsert(bstRoot, v);
            bstRender(v);
        },

        async remove(value) {
            if (!bstRoot) {
                alert("The tree is empty.");
                return;
            }

            const v = Number(value);
            let node = bstRoot;

            while (node && node.value !== v) {
                node = v < node.value ? node.left : node.right;
            }

            if (!node) {
                alert("Value not found.");
                return;
            }

            if (await bstHighlightPath(v) === false) return;

            bstRoot = bstDelete(bstRoot, v);
            bstRender();
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
    const needsValue =
        title.textContent === "Linked List" ||
        title.textContent === "Binary Search Tree";

    if (needsValue && (text === "" || !Number.isFinite(Number(text)))) {
        window.alert("Enter a valid number to remove.");
        removeInput.focus();
        return;
    }

    current.remove(needsValue ? String(Number(text)) : "");
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

// ---------- Refresh button ---------
document.getElementById("refresh").addEventListener("click", () => {
    if (!window.confirm("Reset the current data structure?")) {
        return;
    }


    animationVersion++;
    bstRoot = null;
    selectStructure(title.textContent);
    addInput.value = "";
    removeInput.value = "";
});

// ---------- Initial load ----------
selectStructure("Linked List");