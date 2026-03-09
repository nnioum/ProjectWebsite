const workspace = document.getElementById('workspace');
const consoleOutput = document.getElementById('console-output');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const stopBtn = document.getElementById('stop-btn');

let variables = {};
let functions = {};

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
        if (type === 'assignment') {
            newBlock.classList.add('variable-dec');
            if (html.includes('true / false')) { 
                newBlock.classList.add('bool-block');
            }
        }
        if (type === 'if') newBlock.classList.add('if-block');
        if (type === 'if-else') newBlock.classList.add('if-else-block'); 
        if (type === 'while') newBlock.classList.add('while-block');
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

        if (type === 'if' || type === 'if-else' || type === 'while' || type === 'functions') {
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

function executeBlocks(container) {
    const blocks = [...container.children].filter(b =>
        b.classList.contains('block-template')
    );

    for (const block of blocks) {
        const type = block.dataset.type;

        if (type === 'print') handlePrint(block);
        if (type === 'assignment') handleAssignment(block);
        if (type === 'if') handleIf(block);
        if (type === 'if-else') handleIfElse(block);
        if (type === 'while') handleWhile(block);
        if (type === 'functions') handleFunctionDefinition(block);
        if (type === 'call') {
            const result = handleFunctionCall(block);
            if (result !== null && result !== undefined) {
                return result;
            }
        }
        if (type === 'return') {
            const returnValue = handleReturn(block);
            if (returnValue !== null) {
                return returnValue;
            }
        }
    }
    return null;
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

function handleAssignment(block) {
    const inputs = block.querySelectorAll('input');
    const nameInput = inputs[0];
    const exprInput = inputs[1];
    
    if (!nameInput || !exprInput) return;
    
    const name = nameInput.value.trim();
    const expr = exprInput.value.trim();
    
    if (name === '') return;
    
    if (expr === '') {
        variables[name] = 0;
        print(`Переменная ${name} = 0`);
        return;
    }
    
    const result = evaluateExpression(expr);
    variables[name] = result;
    print(`Переменная ${name} = ${result}`);
}
/*
function handleIf(block) {
    const conditionInput = block.querySelector('.block-header input');
    if (!conditionInput) return;
    
    const condition = conditionInput.value;
    const result = evaluateExpression(condition);
    const body = block.querySelector('.block-body');

    if (result && body) {
        executeBlocks(body);
    }
}*/

function handleIfElse(block) {
    const conditionInput = block.querySelector('.block-header input');
    if (!conditionInput) return;
    
    const condition = conditionInput.value;
    const result = evaluateExpression(condition);
    
    const bodies = block.querySelectorAll('.block-body');
    if (bodies.length < 2) return;
    
    const ifBody = bodies[0];
    const elseBody = bodies[1];
    
    if (result) {
        executeBlocks(ifBody);
    } else if (block.classList.contains("show-else")){
        executeBlocks(elseBody);
    }
}

function handleWhile(block) {
    const conditionInput = block.querySelector('.block-header input');
    const body = block.querySelector('.block-body');

    if (!conditionInput || !body) return;

    let safetyCount = 0;
    const MaxIterations = 10000;
    let condition = conditionInput.value;

    while (evaluateExpression(condition)) {
        executeBlocks(body);
        condition = conditionInput.value;
        safetyCount++;
        if (safetyCount > MaxIterations) {
            print("Ошибка: превышено максимальное количество итераций цикла");
            break;
        }
    }
}

function handleFunctionDefinition(block) {
    const nameInput = block.querySelector('.block-header input[placeholder="name function"]');
    const argsInput = block.querySelectorAll('.block-header input')[1];
    const body = block.querySelector('.block-body');
    
    if (!nameInput || !body) return;
    
    const name = nameInput.value.trim();
    if (name === '') return;
    
    let params = [];
    if (argsInput && argsInput.value.trim() !== '') {
        params = argsInput.value.split(',')
            .map(p => p.trim())
            .filter(p => p !== '');
    }
    
    functions[name] = {
        params: params,
        body: body,
        block: block
    };
    
}

function handleFunctionCall(block) {
    const inputs = block.querySelectorAll('input');
    const nameInput = inputs[0];
    const argsInput = inputs[1];
    
    if (!nameInput) return null;
    
    const name = nameInput.value.trim();
    if (name === '') return null;
    
    if (!functions[name]) {
        print(`Ошибка: функция "${name}" не определена`);
        return null;
    }
    
    const func = functions[name];
    
    let args = [];
    if (argsInput && argsInput.value.trim() !== '') {
        args = argsInput.value.split(',')
            .map(a => a.trim())
            .filter(a => a !== '');
    }
    
    if (args.length !== func.params.length) {
        print(`Ошибка: функция "${name}" ожидает ${func.params.length} параметров, получено ${args.length}`);
        return null;
    }
    
    const argValues = args.map(arg => evaluateExpression(arg));
    
    const globalVars = {...variables};
    
    for (let i = 0; i < func.params.length; i++) {
        variables[func.params[i]] = argValues[i];
    }
        
    const returnValue = executeBlocks(func.body);
    
    variables = globalVars;
    
    if (returnValue !== null && returnValue !== undefined) {
        print(`Переменная "${name}" = ${returnValue}`);
        return returnValue;
    } else {
        return null;
    }
}

function handleReturn(block) {
    const input = block.querySelector('input');
    if (!input) return null;
    
    const expr = input.value.trim();
    if (expr === '') return null;
    
    const result = evaluateExpression(expr);
    return result;
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

        if (token === 'true') {
            stack.push(true);
        } else if (token === 'false') {
            stack.push(false);
        } else if (!isNaN(token)) {
            stack.push(Number(token));
        } else if (isVariable(token)) {
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
        default: return 0;
    }
}

function isNumber(x) {
    return !isNaN(x);
}

function isVariable(x) {
    return /^[A-Za-z_]\w*$/.test(x);
}