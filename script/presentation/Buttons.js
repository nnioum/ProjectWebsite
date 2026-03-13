const workspace = document.getElementById('workspace');
const consoleOutput = document.getElementById('console-output');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const stopBtn = document.getElementById('stop-btn');

runBtn.addEventListener('click', () => {
    consoleOutput.innerHTML = '';
    variables = {};
    executeBlocks(workspace);
});

clearBtn.addEventListener('click', () => {
    workspace.innerHTML = '<div class="start-message">Перетащите блоки сюда, чтобы начать...</div>';
    consoleOutput.innerHTML = '';
    variables = {};
    functions = {};
});

document.addEventListener("click", function(e) {

    if (e.target.classList.contains("toggle-else")) {

        const block = e.target.closest(".if-else-block");
        block.classList.toggle("show-else");

        if (block.classList.contains("show-else")) {
            e.target.textContent = "- ELSE";
        } else {
            e.target.textContent = "+ ELSE";
        }

    }

});