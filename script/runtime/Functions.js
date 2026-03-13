class Functions{
    constructor(){
        this.Functions = new Map();
    }

    create(name, value){
        this.Functions.create(name, value);
    }
    
    edit(name, value){
        this.Functions.edit(name, value);
    }

    clear(){
        this.Functions.clear();
    }

    getByName(name){
        return this.Functions[name];
    }

    getAll(){
        return this.Functions;
    }
}
