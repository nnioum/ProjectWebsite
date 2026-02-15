// === 1. НАСТРОЙКИ И ПЕРЕМЕННЫЕ ===
const workspace = document.getElementById('workspace');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const consoleOutput = document.getElementById('console-output');

// Здесь будем хранить значения переменных во время выполнения
let variables = {}; 

// === 2. DRAG AND DROP (ЛОГИКА ПЕРЕТАСКИВАНИЯ) ===

// Находим все блоки в меню и разрешаем их тащить
document.querySelectorAll('.sidebar .block-template').forEach(block => {
    block.addEventListener('dragstart', (e) => {
        // Запоминаем тип блока (declaration, if, math и т.д.)
        e.dataTransfer.setData('type', e.target.dataset.type);
        // Запоминаем HTML блока, чтобы скопировать его внешний вид
        e.dataTransfer.setData('html', e.target.innerHTML);
        // Метка, что мы тащим новый блок из меню
        e.dataTransfer.setData('source', 'sidebar');
    });
});

// Разрешаем "бросать" блоки в рабочую область
workspace.addEventListener('dragover', (e) => {
    e.preventDefault(); // Обязательно, иначе drop не сработает
    // Подсветка зоны, куда кидаем (для красоты можно доработать CSS)
});

// Логика "броска"
workspace.addEventListener('drop', (e) => {
    e.preventDefault();
    
    // Получаем данные
    const type = e.dataTransfer.getData('type');
    const html = e.dataTransfer.getData('html');
    const source = e.dataTransfer.getData('source');

    if (source === 'sidebar') {
        // Создаем КОПИЮ блока
        const newBlock = document.createElement('div');
        newBlock.classList.add('block-template');
        // Добавляем класс конкретного типа для цвета
        if(type === 'declaration') newBlock.classList.add('variable-decl');
        if(type === 'assignment') newBlock.classList.add('variable-set');
        if(type === 'math') newBlock.classList.add('math-op');
        if(type === 'if') newBlock.classList.add('if-block');
        
        newBlock.dataset.type = type;
        newBlock.innerHTML = html;
        newBlock.setAttribute('draggable', 'false'); // Копии пока не таскаем (для упрощения)

        // Фишка: Удаление по двойному клику
        newBlock.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // Чтобы не удалило родителя, если блок внутри IF
            newBlock.remove();
        });

        // ПРОВЕРКА: Куда мы бросили блок? В сам workspace или внутрь IF?
        const dropTarget = e.target.closest('.block-body') || workspace;
        
        // Если бросили в заголовок IF, кидаем в его тело
        if (e.target.closest('.block-header')) {
            e.target.closest('.if-block').querySelector('.block-body').appendChild(newBlock);
        } else {
            dropTarget.appendChild(newBlock);
        }

        // Если это IF, нужно разрешить бросать внутрь него
        if (type === 'if') {
            const body = newBlock.querySelector('.block-body');
            // Очищаем заглушку "Перетащи сюда"
            body.innerHTML = ''; 
        }
    }
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

    // --- ОБЪЯВЛЕНИЕ ПЕРЕМЕННОЙ (Int name = 0) ---
    if (type === 'declaration') {
        const nameInput = block.querySelector('input');
        const varName = nameInput.value.trim();

        if (!varName) throw new Error("Ошибка: Имя переменной не может быть пустым");
        if (variables.hasOwnProperty(varName)) throw new Error(`Ошибка: Переменная '${varName}' уже существует`);

        variables[varName] = 0; // По умолчанию 0
        printLog(`Объявлена переменная: ${varName} = 0`);
    }

    // --- ПРИСВАИВАНИЕ (Set name = value) ---
    else if (type === 'assignment') {
        const inputs = block.querySelectorAll('input');
        const varName = inputs[0].value.trim();
        
        // Проверяем, существует ли переменная
        if (!variables.hasOwnProperty(varName)) throw new Error(`Ошибка: Переменная '${varName}' не найдена`);

        // Пытаемся найти второй input (если ты исправил HTML)
        let val;
        if (inputs.length > 1) {
             val = getValue(inputs[1].value);
        } else {
             // Если HTML старый (со span), используем prompt
             const inputVal = prompt(`Введите значение для ${varName}:`);
             val = parseInt(inputVal);
        }

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

    // --- АРИФМЕТИКА (A + B) ---
    else if (type === 'math') {
        const inputs = block.querySelectorAll('input');
        const select = block.querySelector('select');
        
        const valA = getValue(inputs[0].value);
        const valB = getValue(inputs[1].value);
        const op = select.value;
        
        let res = 0;
        if (op === '+') res = valA + valB;
        if (op === '-') res = valA - valB;
        if (op === '*') res = valA * valB;
        if (op === '/') {
            if (valB === 0) throw new Error("Ошибка: Деление на ноль!");
            res = Math.floor(valA / valB);
        }
        if (op === '%') res = valA % valB;

        printLog(`Результат: ${valA} ${op} ${valB} = ${res}`);
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