function printService(result){
    if (result != null && result !== undefined && !isNaN(result) || Array.isArray(result)){
        print(`${input} = ${result}`);
    }else{
        throw new NotFoundError(`undefined`);
    }
}