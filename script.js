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
        if(type === 'declaration') newBlock.classList.add('variable-dec1');
        if(type === 'assignment') newBlock.classList.add('variable-dec2');
        if (type === 'assignment-val') newBlock.classList.add('variable-val');
        if(type === 'if') newBlock.classList.add('if-block');
        
        newBlock.dataset.type = type;
        newBlock.innerHTML = html;
        newBlock.setAttribute('draggable', 'true');

        newBlock.addEventListener('dblclick', event =>{
            newBlock.remove();
        });

        const dropTarget = event.target.closest('.block-body') || workspace;

        if(event.target.closest('.block-header')){
            event.target.closest('.if-block').querySelector('.variable-dec2, .if-block').appendChild(newBlock);
        }else{
            dropTarget.appendChild(newBlock);
        }
        
        if (type === 'if'){
            const body = newBlock.querySelector('.block-body');
            body.innerHTML = '';
        }

        if (type === "assignment"){
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


runBtn.addEventListener('click', () => {
    consoleOutput.innerHTML = '';
    variables = {};
    executeBlocks(workspace);
});

clearBtn.addEventListener('click', () => {
    workspace.innerHTML = '<div class="start-message">Перетащите блоки сюда...</div>';
    consoleOutput.innerHTML = '';
});

function executeBlocks(container) {
    const blocks = [...container.children].filter(b =>
        b.classList.contains('block-template')
    );

    for (const block of blocks) {
        const type = block.dataset.type;

        if (type === 'print') handlePrint(block);
        if (type === 'declaration') handleDeclaration(block);
        if (type === 'assignment') handleAssignment(block);
        if (type === 'if') handleIf(block);
    }
}

function handlePrint(block) {
    const input = block.querySelector('input').value.trim();
    if (input.startsWith('"') && input.endsWith('"')) {
        print(input.slice(1, -1));
        return;
    }
     
    if (!isNaN(input)) {
        print(input);
        return;
    }

    if (input in variables) {
        print(variables[input]);
        return;
    }
    print('undefined');
}

function handleDeclaration(block) {
    const name = block.querySelector('input[type="text"]').value.trim();
    const value = Number(block.querySelector('input[type="number"]').value);
    variables[name] = value;
}

function handleAssignment(block) {
    const name = block.querySelector('input[type="text"]').value.trim();
    const exprBlock = block.querySelector('.block-body .variable-val');

    if (!exprBlock) return;

    const expr = exprBlock.querySelector('input').value;
    const result = evaluateExpression(expr);
    variables[name] = result;
}

function handleIf(block) {
    const condition = block.querySelector('.block-header input').value;
    const result = evaluateExpression(condition);

    if (result) {
        executeBlocks(block.querySelector('.block-body'));
    }
}

function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evalRPN(rpn);
}

function tokenize(expr) {
    return expr.match(/[A-Za-z_]\w*|\d+|==|!=|<=|>=|[()+\-*/<>]/g) || [];
}

const precedence = {
    '==': 1, '!=': 1, '<': 1, '>': 1, '<=': 1, '>=': 1,
    '+': 2, '-': 2,
    '*': 3, '/': 3
};

function toRPN(tokens) {
    const output = [];
    const stack = [];

    for (const token of tokens) {

        if (isNumber(token) || isVariable(token)) {
            output.push(token);
            continue;
        }

        if (token === '(') {
            stack.push(token);
            continue;
        }

        if (token === ')') {
            while (stack.length && stack.at(-1) !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
            continue;
        }

        while (
            stack.length &&
            stack.at(-1) !== '(' &&
            precedence[stack.at(-1)] >= precedence[token]
        ) {
            output.push(stack.pop());
        }

        stack.push(token);
    }

    while (stack.length) {
        output.push(stack.pop());
    }

    return output;
}

function evalRPN(rpn) {
    const stack = [];

    for (const token of rpn) {

        if (!isNaN(token)) {
            stack.push(Number(token));
        }
        else if (isVariable(token)) {
            stack.push(variables[token] ?? 0);
        } else {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(applyOperator(token, a, b));
        }
    }

    return stack[0];
}

function print(text) {
    const line = document.createElement('div');
    line.textContent = text;
    consoleOutput.appendChild(line);
}

function applyOperator(op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '>': return a > b;
        case '<': return a < b;
        case '==': return a == b;
        case '!=': return a != b;
        case '>=': return a >= b;
        case '<=': return a <= b;
    }
}


function isNumber(x) {
    return !isNaN(x);
}

function isVariable(x) {
    return /^[A-Za-z_]\w*$/.test(x);
}