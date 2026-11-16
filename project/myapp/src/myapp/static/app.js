let busy = false;
let animationVersion = 0;

// ---------- Animation speed ----------
// Every animation step waits BASE_STEP_MS / speedMultiplier, and the CSS
// animations divide their durations by --speed, so one switch controls both.
const BASE_STEP_MS = 400;
let speedMultiplier = 1;
const stepDelay = () => BASE_STEP_MS / speedMultiplier;
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
    setTimeout(() => node.remove(), 300 / speedMultiplier);
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

// Moves the iterate marker one element forward through `nodes` (in order).
// After the last element the marker clears, so the next click starts over.
function advanceIterator(nodes) {
    const index = nodes.findIndex(n => n.classList.contains("iterate-current"));
    nodes[index]?.classList.remove("iterate-current");
    const next = nodes[index + 1];
    next?.classList.add("iterate-current");
    return next;
}

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
//in-order traversal: left subtree, node, right subtree (gives sorted order)
function bstInOrder(node, out = []) {
    if (!node) return out;
    bstInOrder(node.left, out);
    out.push(node.value);
    bstInOrder(node.right, out);
    return out;
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
        await sleep(stepDelay());
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
        code: `// Insert a value at the tail of the list.
llInsert(head, value);

// Delete the first node matching the value.
llDelete(head, value);

// Iterate from head to tail
// (one node per click):
function traverse(node) {
  while (node !== null) {
    visit(node.value);
    node = node.next;
  }
}`,
        description: `<h2>Linked List</h2>
<p>A linked list stores values in sequential nodes, where each node points to the next one in the chain.</p>
<ul>
  <li>Insert / Remove at Head: O(1)</li>
  <li>Search / Traversal: O(n)</li>
</ul>`,
        async add(value) {
            const version = animationVersion;
            // 1. Walk down the existing list, lighting up each node
            const items = stage.querySelectorAll(".ll-item:not(.removing)");
            for (const item of items) {
                const box = item.querySelector(".node");
                box.classList.add("highlight");
                await sleep(stepDelay());

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
                    await sleep(stepDelay());
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
        },

        iterate() {
            const boxes = [...stage.querySelectorAll(".ll-item:not(.removing) .node")];
            if (boxes.length === 0) {
                alert("The linked list is empty.");
                return;
            }
            advanceIterator(boxes);
        }
    },

    "Stack": {
        stageClass: "stack",
        code: `// Push a value onto the top of the stack.
stack.push(value);

// Pop and return the top value.
stack.pop();

// Iterate from top to bottom
// (one node per click):
function iterateStack(stack) {
  for (let i = stack.length - 1; i >= 0; i--) {
    visit(stack[i]);
  }
}`,
        description: `<h2>Stack</h2>
<p>A stack is a Last-In, First-Out (LIFO) data structure. Elements are added and removed exclusively at the top.</p>
<ul>
  <li>Push (Add): O(1)</li>
  <li>Pop (Remove): O(1)</li>
  <li>Peek / Inspect Top: O(1)</li>
</ul>`,
        async add(value) {
            if (busy) return;
            busy = true;
            const version = animationVersion;

            try {
                const node = createNode(value);
                // Apply the drop-down entry class instead of generic .new
                node.classList.add("new-drop");
                stage.appendChild(node);

                // Wait for the drop animation to finish before highlighting
                await sleep(stepDelay());
                if (version !== animationVersion) return;

                node.classList.remove("new-drop");
                await highlightNode(node, version);
            } finally {
                busy = false;
            }
        },
        async remove() {
            if (busy) return;
            busy = true;
            const version = animationVersion;

            try {
                // Always targets the last child (the top of the stack)
                const top = stage.querySelector(".node:last-child:not(.removing)");

                if (!top) {
                    alert("The stack is empty.");
                    return;
                }

                // Highlight top element before removing
                top.classList.add("highlight");
                await sleep(400);
                if (version !== animationVersion) return;

                removeNode(top);
                await sleep(300); // Wait for removal animation to finish
            } finally {
                busy = false;
            }
        },
        iterate() {
            const nodes = [...stage.querySelectorAll(".node:not(.removing)")].reverse();
            if (nodes.length === 0) {
                alert("The stack is empty.");
                return;
            }
            advanceIterator(nodes);
        }
    },

    "Queue": {
        stageClass: "queue",
        code: `// Enqueue a value at the back of the queue.
queue.enqueue(value);

// Dequeue and return the front value.
queue.dequeue();

// Iterate from front to back
// (one node per click):
function iterateQueue(queue) {
  for (let i = 0; i < queue.length; i++) {
    visit(queue[i]);
  }
}`,
        description: `<h2>Queue</h2>
<p>A queue is a First-In, First-Out (FIFO) data structure. Elements are added at the back and removed from the front.</p>
<ul>
  <li>Enqueue (Add): O(1)</li>
  <li>Dequeue (Remove): O(1)</li>
</ul>`,
        add(value) {
            stage.appendChild(createNode(value));
        },
        remove() {
            const front = stage.querySelector(".node:not(.removing)");

            if (front) {
                removeNode(front);
            } else {
                alert("The queue is empty.");
            }
        },

        iterate() {
            const nodes = [...stage.querySelectorAll(".node:not(.removing)")];
            const index = nodes.findIndex(node => node.classList.contains("queue-current"));

            nodes[index]?.classList.remove("queue-current");
            nodes[index + 1]?.classList.add("queue-current");
        }
    },

    "Binary Search Tree": {
        stageClass: "bst",
        code: `// Insert a value and keep the updated root.
bstRoot = bstInsert(bstRoot, value);

// Delete a value and keep the updated root.
bstRoot = bstDelete(bstRoot, value);

// Iterate in-order = sorted order
// (one node per click):
function inOrder(node) {
  if (!node) return;
  inOrder(node.left);
  visit(node.value);
  inOrder(node.right);
}`,
        description: `<h2>Binary Search Tree</h2>
<p>A binary search tree keeps smaller values to the left and larger values to the right of each parent node.</p>
<ul>
  <li>Insert / Delete / Search: O(log n) average</li>
  <li>In-Order Traversal: Visits values in sorted order</li>
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
        },

        iterate() {
            if (!bstRoot) {
                alert("The tree is empty.");
                return;
            }
            const boxes = bstInOrder(bstRoot)
                .map(v => stage.querySelector(`[data-value="${v}"]`))
                .filter(Boolean);
            advanceIterator(boxes);
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
document.getElementById("iterate").addEventListener("click", () => {
    current.iterate?.();
});
// ---------- Speed switch ----------
const speedSelect = document.getElementById("speed");

function applySpeed() {
    const multiplier = parseFloat(speedSelect.value);   // "2x" -> 2, placeholder -> NaN
    speedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    document.documentElement.style.setProperty("--speed", speedMultiplier);
}

speedSelect.addEventListener("change", applySpeed);
applySpeed();   // browsers can restore the previous selection on reload

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