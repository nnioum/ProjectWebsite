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

const precedence = {
    'OR': 0,
    'AND': 0,
    'NOT': 4,
    '==': 1, '!=': 1, '<': 1, '>': 1, '<=': 1, '>=': 1,
    '+': 2, '-': 2,
    '*': 3, '/': 3, '%': 3
};