function getArrayValue(arrName, index){
    
    const arr = Variables.getByName(arrName);

    if(!Array.isArray(arr)) return 0;

    if (index < 0 || index >= arr.length) {
        throw new ValidationError(`Ошибка: индекс ${index} вне границ массива ${arrName}`);
    }
    return arr[index];
}

function ArrayService(name, size, nums){
    
    let arr = new Array(size).fill(0);

    for(let i = 0; i < nums.length && i < size; i++){
        arr[i] =  nums[i];
    }

    Variables.create(name, arr);
}