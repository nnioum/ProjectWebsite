import { evaluateExpression, getArrayValue, print, printError } from './utils.js';
import { RuntimeError } from './error/RuntimeError.js';
import { ValidationError } from './error/ValidationError.js';

export function initExecutor(workspace, runBtn, clearBtn) {
    let variables = new Map();
    let functions = {};

    runBtn.addEventListener('click', () => {
        document.getElementById('console-output').innerHTML = '';
        variables = {};
        executeBlocks(workspace);
    });

    clearBtn.addEventListener('click', () => {
        workspace.innerHTML = '<div class="start-message">Перетащите блоки сюда, чтобы начать...</div>';
        document.getElementById('console-output').innerHTML = '';
        variables = {};
        functions = {};
    });

    document.addEventListener("click", e => {
        if (e.target.classList.contains("toggle-else")) {
            const block = e.target.closest(".if-else-block");
            block.classList.toggle("show-else");
            e.target.textContent = block.classList.contains("show-else") ? "- ELSE" : "+ ELSE";
        }
    });

    function executeBlocks(container) {
        const blocks = [...container.children].filter(b => b.classList.contains('block-template'));

        for (const block of blocks) {
            const type = block.dataset.type;

            if (type === 'print') handlePrint(block);
            else if (type === 'assignment') handleAssignment(block);
            else if (type === 'assignment-bool') handleBoolAssignment(block);
            else if (type === 'assignment-string') handleStringAssignment(block);
            else if (type === 'array') handleArray(block);
            else if (type === 'if-else') handleIfElse(block);
            else if (type === 'while') handleWhile(block);
            else if (type === 'for') handleFor(block);
            else if (type === 'functions') handleFunctionDefinition(block);
            else if (type === 'call') {
                const result = handleFunctionCall(block);
                if (result !== null) return result;
            }
            else if (type === 'return') {
                const ret = handleReturn(block);
                if (ret !== null) return ret;
            }
        }
        return null;
    }


    function handleBoolAssignment(block) {
        const inputs = block.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const val = inputs[1].value.trim().toLowerCase();
        if (!name) return;
        
            variables[name] = (val === 'true' || val === '1');
        }

    function handleStringAssignment(block) {
        const inputs = block.querySelectorAll('input');
        const name = inputs[0].value.trim();
        let val = inputs[1].value.trim();
        if (!name) return;

        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
                val = val.slice(1, -1);
        }
        variables[name] = val;
    }

    function handlePrint(block) {
        const input = block.querySelector('input').value.trim();
        if (!input) return;
        if (input.startsWith('"') && input.endsWith('"')) { 
            print(input.slice(1, -1)); 
            return; 
        }
        const val = evaluateExpression(input, variables, getArrayValue.bind(null, variables));
        print(`${input} = ${val}`);
    }

    function handleAssignment(block) {
        const inputs = block.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const expr = inputs[1].value.trim();
        if (!name) return;

        const result = evaluateExpression(expr, variables, getArrayValue.bind(null, variables));

        if (/^[A-Za-z_]\w*\[.+\]$/.test(name)) {
            const arrName = name.split('[')[0];
            const indexExpr = name.match(/\[(.+)\]/)[1];
            const index = evaluateExpression(indexExpr, variables, getArrayValue.bind(null, variables));

            if (!variables[arrName]) variables[arrName] = [];
            variables[arrName][index] = result;
        } else {
            variables[name] = result;
        }
    }

    function handleArray(block) {
        const inputs = block.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const size = parseInt(inputs[1].value.trim());
        const values = inputs[2].value.trim();
        if (!name || isNaN(size)) return;

        let arr = new Array(size).fill(0);
        if (values) {
            const nums = values.split(',').map(v => evaluateExpression(v.trim(), variables, getArrayValue.bind(null, variables)));
            for (let i = 0; i < nums.length && i < size; i++) arr[i] = nums[i];
        }
        variables[name] = arr;
    }

    function handleIfElse(block) {
        const cond = block.querySelector('.block-header input').value;
        const bodies = block.querySelectorAll('.block-body');
        const result = evaluateExpression(cond, variables, getArrayValue.bind(null, variables));

        if (result) executeBlocks(bodies[0]);
        else if (block.classList.contains("show-else")) executeBlocks(bodies[1]);
    }

    function handleWhile(block) {
        const condInput = block.querySelector('.block-header input').value;
        const body = block.querySelector('.block-body');
        let safety = 0, max = 5000;
        try {
        while (evaluateExpression(condInput, variables, getArrayValue.bind(null, variables))) {
            executeBlocks(body);
            if (++safety > max) { 
                throw new ValidationError("цикл WHILE слишком большой");
            }
        }
        } catch (e) {
            printError(e);
        }
    }

    function handleFor(block) {
        const inputs = block.querySelectorAll('.block-header input');
        const body = block.querySelector('.block-body');

        if (inputs[0].value) processAssignment(inputs[0].value);

        let safety = 0, max = 5000;
        try {
            while (evaluateExpression(inputs[1].value, variables, getArrayValue.bind(null, variables))) {
                executeBlocks(body);
                if (inputs[2].value) processAssignment(inputs[2].value);
                if (++safety > max) { throw new ValidationError("цикл FOR слишком большой");}
            }
        } catch (e) {
            printError(e);
        }
    }

    function processAssignment(expr) {
        const parts = expr.split('=');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const val = evaluateExpression(parts[1].trim(), variables, getArrayValue.bind(null, variables));
            variables[name] = val;
        }
    }

    function handleFunctionDefinition(block) {
        const inputs = block.querySelectorAll('.block-header input');
        const name = inputs[0].value.trim();
        const args = inputs[1].value.split(',').map(a=>a.trim()).filter(a=>a);
        const body = block.querySelector('.block-body');
        if (!name) return;
        functions[name] = {params: args, body};
    }

    function handleFunctionCall(block) {
        const inputs = block.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const args = inputs[1]?.value.split(',').map(a=>a.trim()).filter(a=>a) || [];
        try{
            if (!functions[name]) { throw new RuntimeError(`функция ${name} не найдена`); return null; }
            const func = functions[name];

            if (args.length !== func.params.length) { throw new RuntimeError(`функция ${name} ожидает ${func.params.length} параметров`); return null; }
        } catch (e) {
            printError(e);
        }
        const globalVars = {...variables};
        func.params.forEach((p,i)=>variables[p] = evaluateExpression(args[i], variables, getArrayValue.bind(null, variables)));

        const ret = executeBlocks(func.body);
        variables = globalVars;
        if (ret !== null) print(`Функция ${name} вернула ${ret}`);
        return ret;
    }

    function handleReturn(block) {
        const val = block.querySelector('input').value;
        if (!val) return null;
        return evaluateExpression(val, variables, getArrayValue.bind(null, variables));
    }
} 