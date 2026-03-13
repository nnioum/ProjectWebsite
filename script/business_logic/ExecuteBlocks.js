export function executeBlocks(container) {
    const blocks = [...container.children].filter(b =>
        b.classList.contains('block-template')
    );

    for (const block of blocks) {
        const type = block.dataset.type;

        if (type === 'print') handlePrint(block);
        if (type === 'assignment') handleAssignment(block);
       if (type === 'array') handleArray(block);
        if (type === 'if-else') handleIfElse(block);
        if (type === 'while') handleWhile(block);
        if (type === 'for') handleFor(block);
        if (type === 'functions') handleFunctionDefinition(block);
        if (type === 'call') {
            const result = handleFunctionCall(block);
            if (result !== null && result !== undefined) {
                return result;
            }
        }
        if (type === 'return') {
            const returnValue = handleReturn(block);
            if (returnValue !== null) {
                return returnValue;
            }
        }
    }
    return null;
}