function getPrint(block) {
    
    printController(block.querySelector('input').value.trim());

}

function getAssignment(block) {
    const nameInput = block.querySelector('input[type="text"]');
    const exprInput = block.querySelector('input[placeholder="arithmetic expression"]');
    
    const name = nameInput.value.trim();
    const expr = exprInput.value.trim();

    if (/^[A-Za-z_]\w*\[.+\]$/.test(name)) {

        const arrName = name.split('[')[0];
        const indexExpr = name.match(/\[(.+)\]/)[1];
        const index = evaluateExpression(indexExpr);

        if (variables[arrName] && Array.isArray(variables[arrName])) {
            variables[arrName][index] = result;
        }

    } else {

        variables[name] = result;

    }
    assignmentController(nameInput, exprInput);
}


function getArray(block){

    arrayController(block.querySelectorAll('input'));

}


function getIfElse(block) {
    const conditionInput = block.querySelector('.block-header input');
    const bodies = block.querySelectorAll('.block-body');
    const validElse = block.classList.contains("show-else");

    ifElseController(conditionInput, bodies, validElse);
}

function getWhile(block) {
    const conditionInput = block.querySelector('.block-header input');
    const body = block.querySelector('.block-body');

    whileController(conditionInput, body);
}

function getFor(block){
    const inputs = block.querySelectorAll('.block-header input');
    const body = block.querySelector('.block-body');

    forController(inputs,body);
}

function getProcessSimpleAssignment(expr){
       
    processSimpleAssignmentCntrl(expr.split('='));

}

function getFunctionDefinition(block) {
    const nameInput = block.querySelector('.block-header input[placeholder="name function"]');
    const argsInput = block.querySelectorAll('.block-header input')[1];
    const body = block.querySelector('.block-body');
    
    functionDefinitionController(nameInput, argsInput, body);
    
}

function getFunctionCall(block) {

    functionCallController(block.querySelectorAll('input'));
    
}

function getReturnValue(block) {

    returnController(block.querySelector('input'));

}

function getArrayValue(token){

    arrayValueController(token.match(/^([A-Za-z_]\w*)\[(.+)\]$/));

}