const workspace = document.getElementById('workspace');
const consoleOutput = document.getElementById('console-output');

document.querySelectorAll('.sidebar .block-template').forEach(block => {
    block.addEventListener('dragstart', event => {
        event.dataTransfer.setData('type', event.target.dataset.type);
        event.dataTransfer.setData('html', event.target.innerHTML);
        event.dataTransfer.setData('source', 'sidebar');
    });
});

workspace.addEventListener('dragover', event => {
    event.preventDefault();
});

workspace.addEventListener('drop', event => {
    event.preventDefault();

    const type = event.dataTransfer.getData('type');
    const html = event.dataTransfer.getData('html');
    const source = event.dataTransfer.getData('source');

    if (source === 'sidebar') {
        const startMessage = workspace.querySelector('.start-message');
        if (startMessage) startMessage.remove();

        const newBlock = document.createElement('div');
        newBlock.classList.add('block-template');

        if (type === 'print') newBlock.classList.add('print-block');
        if (type === 'assignment') newBlock.classList.add('variable-dec');
        if (type === 'array') newBlock.classList.add('array-dec');
        if (type === 'if-else') newBlock.classList.add('if-else-block');
        if (type === 'while') newBlock.classList.add('while-block');
        if (type === 'for') newBlock.classList.add('for-block');
        if (type === 'functions') newBlock.classList.add('function-block');
        if (type === 'call') newBlock.classList.add('call-block');
        if (type === 'return') newBlock.classList.add('return-block');

        newBlock.dataset.type = type;
        newBlock.innerHTML = html;
        newBlock.setAttribute('draggable', 'true');

        const dropTarget = event.target.closest('.block-body') || workspace;
        dropTarget.appendChild(newBlock);

        const closeBtn = newBlock.querySelector('.block-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                this.closest('.block-template').remove();
            });
        }

        if (type === 'if' || type === 'if-else' || type === 'while' || type === 'functions' || type === 'for') {
            const bodies = newBlock.querySelectorAll('.block-body');
            bodies.forEach(body => {
                body.innerHTML = '';
            });
        }
    }
});

let draggedBlock = null;

workspace.addEventListener('dragstart', event => {
    if (event.target.classList.contains('block-template')) {
        draggedBlock = event.target;
    }
});

workspace.addEventListener('dragover', event => {
    event.preventDefault();
});

workspace.addEventListener('drop', event => {
    event.preventDefault();
    if (!draggedBlock) return;

    const innerBody = event.target.closest('.block-body');

    if (innerBody && !innerBody.contains(draggedBlock)) {
        innerBody.appendChild(draggedBlock);
    } else {
        const dropTarget = event.target.closest('.block-template');
        if (dropTarget && dropTarget !== draggedBlock) {
            workspace.insertBefore(draggedBlock, dropTarget);
        } else {
            workspace.appendChild(draggedBlock);
        }
    }
    draggedBlock = null;
});