
/**

 * @typedef {import('./nodos').Expresion} Expresion


 * @typedef {import('./nodos').Literal} Literal


 * @typedef {import('./nodos').Print} Print


 * @typedef {import('./nodos').Arithmetic} Arithmetic


 * @typedef {import('./nodos').Grouping} Grouping


 * @typedef {import('./nodos').Relational} Relational


 * @typedef {import('./nodos').Igualation} Igualation


 * @typedef {import('./nodos').Logical} Logical


 * @typedef {import('./nodos').Unario} Unario


 * @typedef {import('./nodos').VariableValue} VariableValue


 * @typedef {import('./nodos').VariableDeclaration} VariableDeclaration


 * @typedef {import('./nodos').Block} Block


 * @typedef {import('./nodos').OpSentence} OpSentence


 * @typedef {import('./nodos').VariableAssign} VariableAssign


 * @typedef {import('./nodos').TernaryOp} TernaryOp


 * @typedef {import('./nodos').IfNode} IfNode


 * @typedef {import('./nodos').WhileNode} WhileNode


 * @typedef {import('./nodos').IncrementDecrement} IncrementDecrement


 * @typedef {import('./nodos').ForLoop} ForLoop


 * @typedef {import('./nodos').BreakNode} BreakNode


 * @typedef {import('./nodos').ContinueNode} ContinueNode


 * @typedef {import('./nodos').ReturnNode} ReturnNode


 * @typedef {import('./nodos').SwitchNode} SwitchNode


 * @typedef {import('./nodos').VectorDeclaration} VectorDeclaration


 * @typedef {import('./nodos').CallNode} CallNode


 * @typedef {import('./nodos').ArrayAccess} ArrayAccess


 * @typedef {import('./nodos').IndexOf} IndexOf


 * @typedef {import('./nodos').Join} Join


 * @typedef {import('./nodos').Length} Length


 * @typedef {import('./nodos').VectorAssign} VectorAssign


 * @typedef {import('./nodos').FuncDeclaration} FuncDeclaration


 * @typedef {import('./nodos').ForEach} ForEach

 */


/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        throw new Error('Metodo visitExpresion no implementado');
    }
    

    /**
     * @param {Literal} node
     * @returns {any}
     */
    visitLiteral(node) {
        throw new Error('Metodo visitLiteral no implementado');
    }
    

    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        throw new Error('Metodo visitPrint no implementado');
    }
    

    /**
     * @param {Arithmetic} node
     * @returns {any}
     */
    visitArithmetic(node) {
        throw new Error('Metodo visitArithmetic no implementado');
    }
    

    /**
     * @param {Grouping} node
     * @returns {any}
     */
    visitGrouping(node) {
        throw new Error('Metodo visitGrouping no implementado');
    }
    

    /**
     * @param {Relational} node
     * @returns {any}
     */
    visitRelational(node) {
        throw new Error('Metodo visitRelational no implementado');
    }
    

    /**
     * @param {Igualation} node
     * @returns {any}
     */
    visitIgualation(node) {
        throw new Error('Metodo visitIgualation no implementado');
    }
    

    /**
     * @param {Logical} node
     * @returns {any}
     */
    visitLogical(node) {
        throw new Error('Metodo visitLogical no implementado');
    }
    

    /**
     * @param {Unario} node
     * @returns {any}
     */
    visitUnario(node) {
        throw new Error('Metodo visitUnario no implementado');
    }
    

    /**
     * @param {VariableValue} node
     * @returns {any}
     */
    visitVariableValue(node) {
        throw new Error('Metodo visitVariableValue no implementado');
    }
    

    /**
     * @param {VariableDeclaration} node
     * @returns {any}
     */
    visitVariableDeclaration(node) {
        throw new Error('Metodo visitVariableDeclaration no implementado');
    }
    

    /**
     * @param {Block} node
     * @returns {any}
     */
    visitBlock(node) {
        throw new Error('Metodo visitBlock no implementado');
    }
    

    /**
     * @param {OpSentence} node
     * @returns {any}
     */
    visitOpSentence(node) {
        throw new Error('Metodo visitOpSentence no implementado');
    }
    

    /**
     * @param {VariableAssign} node
     * @returns {any}
     */
    visitVariableAssign(node) {
        throw new Error('Metodo visitVariableAssign no implementado');
    }
    

    /**
     * @param {TernaryOp} node
     * @returns {any}
     */
    visitTernaryOp(node) {
        throw new Error('Metodo visitTernaryOp no implementado');
    }
    

    /**
     * @param {IfNode} node
     * @returns {any}
     */
    visitIfNode(node) {
        throw new Error('Metodo visitIfNode no implementado');
    }
    

    /**
     * @param {WhileNode} node
     * @returns {any}
     */
    visitWhileNode(node) {
        throw new Error('Metodo visitWhileNode no implementado');
    }
    

    /**
     * @param {IncrementDecrement} node
     * @returns {any}
     */
    visitIncrementDecrement(node) {
        throw new Error('Metodo visitIncrementDecrement no implementado');
    }
    

    /**
     * @param {ForLoop} node
     * @returns {any}
     */
    visitForLoop(node) {
        throw new Error('Metodo visitForLoop no implementado');
    }
    

    /**
     * @param {BreakNode} node
     * @returns {any}
     */
    visitBreakNode(node) {
        throw new Error('Metodo visitBreakNode no implementado');
    }
    

    /**
     * @param {ContinueNode} node
     * @returns {any}
     */
    visitContinueNode(node) {
        throw new Error('Metodo visitContinueNode no implementado');
    }
    

    /**
     * @param {ReturnNode} node
     * @returns {any}
     */
    visitReturnNode(node) {
        throw new Error('Metodo visitReturnNode no implementado');
    }
    

    /**
     * @param {SwitchNode} node
     * @returns {any}
     */
    visitSwitchNode(node) {
        throw new Error('Metodo visitSwitchNode no implementado');
    }
    

    /**
     * @param {VectorDeclaration} node
     * @returns {any}
     */
    visitVectorDeclaration(node) {
        throw new Error('Metodo visitVectorDeclaration no implementado');
    }
    

    /**
     * @param {CallNode} node
     * @returns {any}
     */
    visitCallNode(node) {
        throw new Error('Metodo visitCallNode no implementado');
    }
    

    /**
     * @param {ArrayAccess} node
     * @returns {any}
     */
    visitArrayAccess(node) {
        throw new Error('Metodo visitArrayAccess no implementado');
    }
    

    /**
     * @param {IndexOf} node
     * @returns {any}
     */
    visitIndexOf(node) {
        throw new Error('Metodo visitIndexOf no implementado');
    }
    

    /**
     * @param {Join} node
     * @returns {any}
     */
    visitJoin(node) {
        throw new Error('Metodo visitJoin no implementado');
    }
    

    /**
     * @param {Length} node
     * @returns {any}
     */
    visitLength(node) {
        throw new Error('Metodo visitLength no implementado');
    }
    

    /**
     * @param {VectorAssign} node
     * @returns {any}
     */
    visitVectorAssign(node) {
        throw new Error('Metodo visitVectorAssign no implementado');
    }
    

    /**
     * @param {FuncDeclaration} node
     * @returns {any}
     */
    visitFuncDeclaration(node) {
        throw new Error('Metodo visitFuncDeclaration no implementado');
    }
    

    /**
     * @param {ForEach} node
     * @returns {any}
     */
    visitForEach(node) {
        throw new Error('Metodo visitForEach no implementado');
    }
    
}
