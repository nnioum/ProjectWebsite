import { RuntimeError } from './error/RuntimeError.js';
import { ValidationError } from './error/ValidationError.js';

export let variables = {}; 

export function print(text) {
    const consoleOutput = document.getElementById('console-output');
    if (!consoleOutput) return;
    const line = document.createElement('div');
    line.textContent = text;
    consoleOutput.appendChild(line);
}

export function printError(error) {
    const consoleOutput = document.getElementById('console-output');
    const line = document.createElement('div');
    line.textContent = `Ошибка: ${error.message}`;
    line.style.color = '#ff4444';
    line.style.fontWeight = 'bold';
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
    try{
        if (!match) throw new ValidationError(`Неверный синтаксис массива: ${token}`);

        const arrName = match[1];
        const indexExpr = match[2];

        if (!(arrName in vars)) throw new ValidationError(`Массив ${arrName} не найден`);
        const arr = vars[arrName];
        if (!Array.isArray(arr)) throw new ValidationError(`Переменная ${arrName} не является массивом`);;

        const index = evaluateExpression(indexExpr, vars);
        if (index < 0 || index >= arr.length) {
            throw new ValidationError(`индекс ${index} вне границ массива ${arrName}`);
        }

        return arr[index];
    }catch(e){
        printError(e);
    }
}


export function evalRPN(rpn, vars = variables) {
    const stack = [];

    for (const token of rpn) {
        try{
        if (isNumber(token)) {
            stack.push(Number(token));
        } else if (token.includes('[')) {
            const value = getArrayValue(token, vars);
            if (value === undefined || value === null) {
                throw new RuntimeError(`Массив не найден \n ${token}`);
            }
            stack.push(value);
        } else if (isVariable(token)) {
            if (!(token in vars)) {
                throw new RuntimeError(`Неправильные данные \n ${token}`);
            }
            stack.push(vars[token] ?? 0);
        } else {
             if (stack.length < 2) {
                throw new RuntimeError(`Недостаточно операндов для оператора\n ${token}`);
            }
            const b = stack.pop();
            const a = stack.pop();
            stack.push(applyOperator(token, a, b));
        }
    }catch(e){
        printError(e)
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