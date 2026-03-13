function tokenize(expr) {
    const regex = /\d+|[A-Za-z_]\w*\[[^\]]+\]|[A-Za-z_]\w*|==|!=|>=|<=|[+\-*/()<>!=]/g;
    return expr.match(regex) || [];
}