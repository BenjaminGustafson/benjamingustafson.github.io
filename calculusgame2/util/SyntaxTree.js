
class SyntaxTree {
    constructor (left = null, right = null, value){
        this.left = left;
        this.right = right;
        this.value = value;
    }

    toExpression () {
        var expr = ""
        if (this.left != null){
            const needParens = this.left.left != null || this.left.right != null;
            if (needParens) expr += "(";
            expr += this.left.toExpression();
            if (needParens) expr += ")";
        }
        expr += this.value;
        if(this.right != null){
            const needParens = this.right.left != null || this.right.right != null;
            if (needParens) expr += "(";
            expr += this.right.toExpression();
            if (needParens) expr += ")";
        }
        return expr;
    }

    static tokenize(expression) {
        const re = /\d+|[a-zA-Z]+|[()+\-*/]/g;
        return expression.match(re) || [];
    }

    static parse(expression) {
        const tokens = SyntaxTree.tokenize(expression);
        var i = 0

        // E -> E + T | E - T | T 
        function parseExpression() {
            let expr = parseTerm();
            while (i < tokens.length && (tokens[i] == '+' || tokens[i] == '-')) {
                const op = tokens[i];
                i++;
                const right = parseTerm();
                expr = new SyntaxTree(expr, right, op);
            }
            return expr;
        }

        // T -> T * F | T / F | F
        function parseTerm() {
            let term = parseFactor();
            while (i < tokens.length && (tokens[i] == '*' || tokens[i] === '/')) {
                const op = tokens[i];
                i++;
                const right = parseFactor();
                term = new SyntaxTree(term, right, op);
            }
            return term;
        }

        // F -> (E) | number | variable
        function parseFactor() {
            // F -> (E)
            if (tokens[i] == '(') {
                i++;
                const expr = parseExpression();
                if (tokens[i] != ')') {
                    throw new SyntaxError('Expected closing parenthesis');
                }
                i++;
                return expr;
            }

            // F -> number | variable
            if (/\d+/.test(tokens[i]) || /^[a-zA-Z]+$/.test(tokens[i])) {
                const node = new SyntaxTree(null, null, tokens[i]);
                i++;
                return node;
            }

            throw new SyntaxError('Invalid syntax');
        }

        const expr = parseExpression();
        if (i < tokens.length) {
            throw new SyntaxError('Unexpected input');
        }
        return expr;
    }

    

}