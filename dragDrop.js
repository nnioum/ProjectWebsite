export function initDragDrop(workspace) {
    let draggedBlock = null;
    let sourceIsSidebar = false;

    // Drag из sidebar
    document.querySelectorAll('.sidebar .block-template').forEach(block => {
        block.addEventListener('dragstart', e => {
            draggedBlock = block.cloneNode(true);
            sourceIsSidebar = true;
        });
    });

    // Drag внутри workspace
    workspace.addEventListener('dragstart', e => {
        if (e.target.classList.contains('block-template')) {
            draggedBlock = e.target;
            sourceIsSidebar = false;
        }
    });

    workspace.addEventListener('dragover', e => e.preventDefault());

    workspace.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedBlock) return;

        const dropBody = e.target.closest('.block-body') || workspace;

        if (sourceIsSidebar) {
            const startMsg = workspace.querySelector('.start-message');
            if (startMsg) startMsg.remove();

            const newBlock = draggedBlock;
            addCloseButton(newBlock);
            clearInnerBodies(newBlock);
            dropBody.appendChild(newBlock);
        } else {
            if (dropBody && !dropBody.contains(draggedBlock)) {
                dropBody.appendChild(draggedBlock);
            } else {
                workspace.appendChild(draggedBlock);
            }
        }

        draggedBlock = null;
        sourceIsSidebar = false;
    });

    function addCloseButton(block) {
        const btn = block.querySelector('.block-close-btn');
        if (btn) {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                block.remove();
            });
        }
    }

    function clearInnerBodies(block) {
        const type = block.dataset.type;
        if (['if-else','while','for','functions'].includes(type)) {
            block.querySelectorAll('.block-body').forEach(b => b.innerHTML = '');
        }
    }
}