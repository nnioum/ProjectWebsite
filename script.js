const workspace = document.getElementById('workspace');
const consoleOutput = document.getElementById('console-output');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const stopBtn = document.getElementById('stop-btn');

let variables = {};

document.querySelectorAll('.sidebar .block-template').forEach(block => {
    block.addEventListener('dragstart', event =>{
        event.dataTransfer.setData('type', event.target.dataset.type);
        event.dataTransfer.setData('html', event.target.innerHTML);
        event.dataTransfer.setData('source', 'sidebar');
    });
});


workspace.addEventListener('dragover', event => {
   event.preventDefault();
});

workspace.addEventListener('drop', event =>{
    event.preventDefault();

    const type = event.dataTransfer.getData('type');
    const html = event.dataTransfer.getData('html');
    const source = event.dataTransfer.getData('source');

    if(source === 'sidebar'){
        const startMessage = workspace.querySelector('.start-message');
        if (startMessage) startMessage.remove();
        const newBlock=document.createElement('div');
        newBlock.classList.add('block-template');

        if(type === 'print') newBlock.classList.add('print-block');
        if(type === 'declaration') newBlock.classList.add('variable-decl');
        if(type === 'assignment') newBlock.classList.add('variable-assig');
        if(type === 'math') newBlock.classList.add('math-op');
        if(type === 'assignment-val') newBlock.classList.add('variable-val');
        if(type === 'assignment-num') newBlock.classList.add('variable-num');
        if(type === 'math-brackets') newBlock.classList.add('brackets');
        if(type === 'if') newBlock.classList.add('if-block');
        
        newBlock.dataset.type = type;
        newBlock.innerHTML = html;
        newBlock.setAttribute('draggable', 'true');

        newBlock.addEventListener('dblclick', event =>{
            newBlock.remove();
        });

        const dropTarget = event.target.closest('.block-body') || workspace;

        if(event.target.closest('.block-header')){
            event.target.closest('.if-block').querySelector('.block-body').appendChild(newBlock);
        }else{
            dropTarget.appendChild(newBlock);
        }
        
        if (type === 'if'){
            const body = newBlock.querySelector('.block-body');
            body.innerHTML = '';
        }
    }

});

let draggedBlock = null;

workspace.addEventListener('dragstart', event =>{
    if(event.target.classList.contains('block-template')){
        draggedBlock = event.target;
    }
});

workspace.addEventListener('dragover', event =>{
    event.preventDefault();
});

workspace.addEventListener('drop', event =>{
    event.preventDefault();
    if (!draggedBlock) return;
    
    const dropTarget = event.target.closest('.block-template');
    if (dropTarget && dropTarget !=draggedBlock){
        workspace.insertBefore(draggedBlock, dropTarget);
    }else{
        workspace.appendChild(draggedBlock);
    }
    draggedBlock = null;
});