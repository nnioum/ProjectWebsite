class Variables{
    constructor(){
        this.variables = new Map();
    }

    create(name, value){
        this.variables.create(name, value);
    }
    
    edit(name, value){
        this.variables.edit(name, value);
    }

    clear(){
        this.variables.clear();
    }

    getByName(name){
        return this.variables[name];
    }

    getAll(){
        return this.variables;
    }
}
