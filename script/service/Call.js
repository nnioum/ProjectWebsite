function callService(name, args, argValues){
    if (!Functions.getByName(name)){
        throw new RuntimeError(`Ошибка: функция "${name}" не определена`);
    }

    const func = Functions.getByName(name);

    if (args.length !== func.params.length) {
        throw new RuntimeError(`Ошибка: функция "${name}" ожидает ${func.params.length} параметров, получено ${args.length}`);
    }
    
    const globalVars = Variables.getAll;
    
    for (let i = 0; i < func.params.length; i++) {
        Variables.edit(func.params[i], argValues[i]);
    }
        
    const returnValue = executeBlocks(func.body);
    
    Variables.getAll() = globalVars;
    
}