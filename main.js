import { initDragDrop } from './dragDrop.js';
import { initExecutor } from './executor.js';

const workspace = document.getElementById('workspace');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const stopBtn = document.getElementById('stop-btn');

initDragDrop(workspace);
initExecutor(workspace, runBtn, clearBtn, stopBtn);