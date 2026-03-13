function callService(name, args, argValues) {
    if (!Function.getByName(name)) {
        throw new RuntimeError('функция "${name}" не определена');
    }
    
    const func = Function.getByName(name);

    if (args.length !== func.params.length) {
        throw new RuntimeError('функция "${name}" ожидает ${func.params.length} параметров, получено ${args.length}');
    }
        
    const globalVars = {...Variables.getAll()};
    
    for (let i = 0; i < func.params.length; i++) {
        Variables.edit(func.params[i], argValues[i]);
    }
        
    const returnValue = executeBlocks(func.body);
    
    Varibal.getAll() = globalVars;
}