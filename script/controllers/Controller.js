

function printController(input) {
    if (input.startsWith('"') && input.endsWith('"')) {
        print(input.slice(1, -1));
        return;
    }
    if (!isNaN(input)) { 
        print(input); 
        return;
    } 
     
    const result = evaluateExpression(input);
    printService(result);
}

function assignmentController(nameInput, exprInput) {
    
    if (!nameInput || !exprInput) return;
    
    const name = nameInput.value.trim();
    const expr = exprInput.value.trim();
    
    if (name === '') return;
    
    
    
    const result = evaluateExpression(expr);
    if (/^[A-Za-z_]\w*\[.+\]$/.test(name)) {

        const arrName = name.split('[')[0];
        const indexExpr = name.match(/\[(.+)\]/)[1];
        const index = evaluateExpression(indexExpr);

        if (getAssignmentService(arrName) && Array.isArray(getAssignmentService(arrName))) {
            const newName =getAssignment(arrName);
            newName[index] = result;
            editAssignmentService(arrName,newName);
        }

    } else {

       editAssignmentService(arrName, result);

    }
}

function arrayController(inputs){
    const name = inputs[0].value.trim();
    const size = parseInt(inputs[1].value.trim());
    const values = inputs[2].value.trim();


    if(name === '' || isNaN(size)) return;

    let arr = new Array(size).fill(0);
    
    if(values !== ''){
        const nums = values.split(',').map(v => evaluateExpression(v.trim()));

        for(let i = 0; i < nums.length && i < size; i++){
            arr[i] =  nums[i];
        }
    }
    arrayService(name,arr);
}


function ifElseController(conditionInput, bodies,validElse) {
    if (!conditionInput) return;
    
    const condition = conditionInput.value;
    const result = evaluateExpression(condition);
    
    if (bodies.length < 2) return;
    
    const ifBody = bodies[0];
    const elseBody = bodies[1];
    
    if (result) {
        executeBlocks(ifBody);
    } else if (validElse){
        executeBlocks(elseBody);
    }
}

function whileController(conditionInput, body) {

    if (!conditionInput || !body) return;

    let safetyCount = 0;
    const MaxIterations = 5000;

    while (evaluateExpression(conditionInput.value)) {
        executeBlocks(body);
        safetyCount++;
        if (safetyCount > MaxIterations) {
            throw new ValidationError("превышено максимальное количество итераций цикла While");
        }
    }
}

function forController(inputs, body){
    const init = inputs[0].value.trim();
    const condition = inputs[1].value.trim();
    const update = inputs[2].value.trim();

    if (!body) return;

    if (init !==""){
        processSimpleAssignment(init);
    }

    let safetyCount = 0;
    let MaxIterations = 5000;

    while (evaluateExpression(condition)){
        executeBlocks(body);//

        if (update !== ""){
            processSimpleAssignment(update);
        }

        safetyCount++;
        if(safetyCount > MaxIterations){
            throw new ValidationError("превышено максимальное количество итераций цикла FOR");
        }
    }
}

function processSimpleAssignmentCntrl(parts){

    if (parts.length === 2) {
        const name = parts[0].trim();
        const value = parts[1].trim();
        
        const evaluate = evaluateExpression(value);

        simpleAssigment(name, evaluate);
    }
}

function functionDefinitionController(name, arg, body, block) {
    
    if (!name || !body) return;
    
    const name = nameInput.value.trim();
    if (name === '') return;
    
    let params = [];
    if (arg && arg.value.trim() !== '') {
        params = arg.value.split(',')
            .map(p => p.trim())
            .filter(p => p !== '');
    }

    functionDefinitionService(name, params, body, block);
    
}

function functionCallController(inputs) {
    const nameInput = inputs[0];
    const argsInput = inputs[1];
    
    if (!nameInput) throw new ValidationError();
    
    const name = nameInput.value.trim();
    if (name === '') throw new ValidationError();
       
    let args = [];
    if (argsInput && argsInput.value.trim() !== '') {
        args = argsInput.value.split(',')
            .map(a => a.trim())
            .filter(a => a !== '');
    }
    
    const argValues = args.map(arg => evaluateExpression(arg));
    callService(name, args, argValues);
}

function returnController(input) {
    if (!input) throw new ValidationError();
    
    const expr = input.value.trim();
    if (expr === '') throw new ValidationError();
    
    const result = evaluateExpression(expr);
    return result;
}

function arrayValueController(match){

    if(!match) return null;

    const arrName = match[1];
    const indexExpr = match[2];
    
    const index = evaluateExpression(indexExpr);

    if(!(arrName in variables)) return 0;
}












