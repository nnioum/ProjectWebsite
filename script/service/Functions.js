function functionDefinitionService(name, params, body, block){
    Function.create(name,{
        params: params,
        body: body,
        block: block
    });
}