
export let variables = {}; 

export function print(text) {
    const consoleOutput = document.getElementById('console-output');
    if (!consoleOutput) return;
    const line = document.createElement('div');
    line.textContent = text;
    consoleOutput.appendChild(line);
}

export function tokenize(expr) {
    const regex = /\d+|[A-Za-z_]\w*\[[^\]]+\]|[A-Za-z_]\w*|==|!=|>=|<=|[+\-*/()<>!=]/g;
    return expr.match(regex) || [];
}


const precedence = { 
    'OR': 0, 'AND': 0, 'NOT': 4, 
    '==': 1, '!=': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, 
    '+': 2, '-': 2, '*': 3, '/': 3, '%': 3 
};

export function toRPN(tokens) {
    const output = [];
    const stack = [];

    for (const token of tokens) {
        if (isNumber(token) || isVariable(token) || token.includes('[')) {
            output.push(token);
            continue;
        }
        if (token === '(') { stack.push(token); continue; }
        if (token === ')') {
            while (stack.length && stack.at(-1) !== '(') output.push(stack.pop());
            stack.pop();
            continue;
        }
        while (stack.length && stack.at(-1) !== '(' && precedence[stack.at(-1)] >= precedence[token]) {
            output.push(stack.pop());
        }
        stack.push(token);
    }

    while (stack.length) output.push(stack.pop());
    return output;
}


export function getArrayValue(token, vars = variables) {
    const match = token.match(/^([A-Za-z_]\w*)\[(.+)\]$/);
    if (!match) return 0;

    const arrName = match[1];
    const indexExpr = match[2];

    if (!(arrName in vars)) return 0;
    const arr = vars[arrName];
    if (!Array.isArray(arr)) return 0;

    const index = evaluateExpression(indexExpr, vars);
    if (index < 0 || index >= arr.length) {
        print(`Ошибка: индекс ${index} вне границ массива ${arrName}`);
        return 0;
    }

    return arr[index];
}


export function evalRPN(rpn, vars = variables) {
    const stack = [];

    for (const token of rpn) {
        if (isNumber(token)) {
            stack.push(Number(token));
        } else if (token.includes('[')) {
            stack.push(getArrayValue(token, vars) ?? 0);
        } else if (isVariable(token)) {
            stack.push(vars[token] ?? 0);
        } else {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(applyOperator(token, a, b));
        }
    }

    return stack[0];
}


export function evaluateExpression(expr, vars = variables) {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evalRPN(rpn, vars);
}


export function applyOperator(op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return Math.floor(a / b);
        case '%': return a % b;
        case '>': return a > b;
        case '<': return a < b;
        case '==': return a === b;
        case '!=': return a !== b;
        case '>=': return a >= b;
        case '<=': return a <= b;
        case 'AND': return a && b;
        case 'OR': return a || b;
        default: return 0;
    }
}


export function isNumber(x) {
    return !isNaN(x);
}

export function isVariable(x) {
    return /^[A-Za-z_]\w*$/.test(x);
}