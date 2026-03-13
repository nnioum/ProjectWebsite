function assignmentService(name, result, index){
    if (/^[A-Za-z_]\w*\[.+\]$/.test(name)) {

        const arrName = name.split('[')[0];
        const indexExpr = name.match(/\[(.+)\]/)[1];

        if (Variables.getByName(arrName) && Array.isArray(Variables.getByName(arrName))) {
            Variables.getByName(arrName)[index] = result;
        }

    } else {

        Variables.edit(name,result);

    }
}