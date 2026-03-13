function evalRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
        
        if (!isNaN(token)) {
            stack.push(Number(token));
        }
        
        else if(token.includes('[')){

            const val = getArrayValue(token);

            stack.push(val ?? 0);

        }
        
        else if (isVariable(token)) {
            stack.push(variables[token] ?? 0);
        }
        
        else {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(applyOperator(token, a, b));
        }
    }

    return stack[0];
}