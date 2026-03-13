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

function getArrayValue(token){

    const match = token.match(/^([A-Za-z_]\w*)\[(.+)\]$/);

    if(!match) return null;

    const arrName = match[1];
    const indexExpr = match[2];

    if(!(arrName in variables)) return 0;

    const arr = variables[arrName];
    
    if(!Array.isArray(arr)) return 0;

    const index = evaluateExpression(indexExpr);

    if (index < 0 || index >= arr.length) {
        print(`Ошибка: индекс ${index} вне границ массива ${arrName}`);
        return 0;
    }
    return arr[index];
}