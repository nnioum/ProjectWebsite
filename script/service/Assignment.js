function getAssignmentService(name){
    return Variables.getByName(name);
}

function editAssignmentService(name, value){
    Variables.edit(name, value);
}