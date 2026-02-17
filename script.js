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
        if(type === 'declaration') newBlock.classList.add('variable-decl');
        if(type === 'assignment') newBlock.classList.add('variable-assig');
        if(type === 'math') newBlock.classList.add('math-op');
        if(type === 'assignment-val') newBlock.classList.add('variable-val');
        if(type === 'assignment-num') newBlock.classList.add('variable-num');
        if(type === 'math-brackets') newBlock.classList.add('brackets');
        if(type === 'if') newBlock.classList.add('if-block');
        
        newBlock.dataset.type = type;
        newBlock.innerHTML = html;
        newBlock.setAttribute('draggable', 'true');

        newBlock.addEventListener('dblclick', event =>{
            newBlock.remove();
        });

        const dropTarget = event.target.closest('.block-body') || workspace;

        if(event.target.closest('.block-header')){
            event.target.closest('.if-block').querySelector('.block-body').appendChild(newBlock);
        }else{
            dropTarget.appendChild(newBlock);
        }
        
        if (type === 'if'){
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


// === 3. ИНТЕРПРЕТАТОР (МОЗГИ ПРОГРАММЫ) ===

runBtn.addEventListener('click', () => {
    // 1. Очищаем консоль и память
    consoleOutput.innerHTML = '<div class="system-msg">Запуск выполнения...</div>';
    variables = {}; // Сброс переменных

    // 2. Берем все блоки из workspace
    const blocks = Array.from(workspace.children).filter(el => el.classList.contains('block-template'));

    try {
        // 3. Запускаем выполнение по очереди
        blocks.forEach(block => executeBlock(block));
        printSuccess("Выполнение завершено успешно.");
    } catch (error) {
        printError(error.message);
    }
});

// Функция выполнения одного блока
function executeBlock(block) {
    const type = block.dataset.type;

    // присваивание int переменной 
    if (type === 'declaration') {
        const inputs = block.querySelectorAll('input');
        
        const nameInput = inputs[0];
        const varName = nameInput.value.trim();

        let varValue = Number(inputs[1].value.trim()); 

        if (!varName) throw new Error("Ошибка: Имя переменной не может быть пустым");
        if (variables.hasOwnProperty(varName)) throw new Error(`Ошибка: Переменная '${varName}' уже существует`);

        variables[varName] = varValue;
        printLog(`Объявлена переменная: ${varName} = ${varValue}`);
    }

    //Присваивания int с блоком
    else if (type === 'assignment') {
        const inputs = block.querySelectorAll('input');
        const varName = inputs[0].value.trim();

        if (!varName) throw new Error("Ошибка: Имя переменной не может быть пустым");

        if (!variables.hasOwnProperty(varName)){
            variables[varName] = null;
        };

        if (!inputs[1] || inputs[1].value.trim() === '') {
            throw new Error("Ошибка: Не указано значение для присваивания");
        }

        const expression = inputs[1].value.trim();

        let val = buildExpressionFromBlocks(expression);//Нужно написать функцию, которая будет разбирать строку expression и вычислять результат, учитывая переменные и операции

        variables[varName] = val;
        printLog(`Присвоено: ${varName} = ${variables[varName]}`);
    }

    // --- ВЫВОД (Print) ---  <-- ВОТ ТЕПЕРЬ ОН НА СВОЕМ МЕСТЕ
    else if (type === 'print') {
        const input = block.querySelector('input');
        // Функция getValue сама разберется: это число или переменная
        const content = getValue(input.value); 
        
        // Выводим зеленым цветом
        printSuccess(`OUTPUT: ${content}`);
    }


    // --- УСЛОВИЕ (IF) ---
    else if (type === 'if') {
        const inputs = block.querySelectorAll('.block-header input');
        const select = block.querySelector('.block-header select');
        
        const valA = getValue(inputs[0].value);
        const valB = getValue(inputs[1].value);
        const op = select.value;

        let condition = false;
        if (op === '>') condition = valA > valB;
        if (op === '<') condition = valA < valB;
        if (op === '==') condition = valA == valB;
        if (op === '!=') condition = valA != valB;

        printLog(`Проверка IF (${valA} ${op} ${valB}): ${condition}`);

        if (condition) {
            // Выполняем блоки внутри тела IF
            const body = block.querySelector('.block-body');
            const innerBlocks = Array.from(body.children).filter(el => el.classList.contains('block-template'));
            innerBlocks.forEach(innerBlock => executeBlock(innerBlock));
        }
    }
}

// === 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Умная функция: понимает, ввели число "5" или переменную "x"
function getValue(inputStr) {
    inputStr = inputStr.trim();
    
    // Если это число
    if (!isNaN(inputStr) && inputStr !== '') {
        return parseInt(inputStr);
    }
    
    // Если это переменная
    if (variables.hasOwnProperty(inputStr)) {
        return variables[inputStr];
    }
    
    throw new Error(`Ошибка: Неизвестное значение или переменная '${inputStr}'`);
}

function printLog(msg) {
    const line = document.createElement('div');
    line.textContent = `> ${msg}`;
    line.style.color = '#ccc';
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight; // Автоскролл вниз
}

function printError(msg) {
    const line = document.createElement('div');
    line.textContent = `⚠ ${msg}`;
    line.classList.add('error-msg');
    consoleOutput.appendChild(line);
}

function printSuccess(msg) {
    const line = document.createElement('div');
    line.textContent = `✔ ${msg}`;
    line.style.color = '#4caf50';
    consoleOutput.appendChild(line);
}



// Кнопка очистки workspace
clearBtn.addEventListener('click', () => {
    // Удаляем всё, кроме сообщения "Start message" (если хочешь)
    // Но проще просто чистить HTML
    workspace.innerHTML = '<div class="start-message">Рабочая область очищена</div>';
});