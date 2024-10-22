import { BaseVisitor } from "./visitor.js";

export class FrameVisitor extends BaseVisitor {
    constructor(baseOffset) {
        super();
        this.frame = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }

    visitOpSentence(node) {}
    visitArithmetic(node) {}
    visitRelational(node) {}
    visitLogical(node) {}
    visitLiteral(node) {}
    visitUnario(node) {}
    visitGrouping(node) {}

    /**
     * 
     * @type {BaseVisitor['visitVariableDeclaration']}
     */
    visitVariableDeclaration(node) {
        this.frame.push({
            id: node.id,
            offset: this.baseOffset + this.localSize
        });
        this.localSize++;
    }

    visitVariableValue(node) {}
    visitVariableAssign(node) {}
    visitPrint(node) {}
    visitExpresion(node) {}

    /**
     * 
     * @type {BaseVisitor['visitBlock']}
     */
    visitBlock(node) {
        node.statements.forEach(statement => {
            statement.accept(this);
        });
    }

    /**
     * 
     * @type {BaseVisitor['visitIfNode']}
     */
    visitIfNode(node) {
        node.stmtTrue.accept(this);
        if(node.stmtFalse) {
            node.stmtFalse.accept(this);
        }
    }

    /**
     * 
     * @type {BaseVisitor['visitWhileNode']}
     */
    visitWhileNode(node) {
        node.stmt.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitForLoop']}
     */
    visitForLoop(node) {
        node.stmt.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitSwitchNode']}
     */
    visitSwitchNode(node) {
        node.cases.forEach(c => {
            c.inst.accept(this);
        });
    }

    /**
     * 
     * @type {BaseVisitor['visitForEach']}
     */
    visitForEach(node) {
        node.stmt.accept(this);
    }

    visitBreakNode(node) {}
    visitContinueNode(node) {}
    visitReturnNode(node) {}
    visitFuncDeclaration(node) {}
    visitCallNode(node) {}

    /**
     * 
     * @type {BaseVisitor['visitVectorDeclaration']}
     */
    visitVectorDeclaration(node) {
        this.frame.push({
            id: node.id,
            offset: this.baseOffset + this.localSize
        });
        this.localSize++;
    }

    visitVectorAssign(node) {}
    visitArrayAccess(node) {}
    visitIndexOf(node) {}
    visitLength(node) {}
    visitJoin(node) {}
    
}