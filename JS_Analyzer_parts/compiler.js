import { registers as r } from "../RISC/constants.js"
import { Generador } from "../RISC/generator.js";
import { BaseVisitor } from "./visitor.js";


export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitOpSentence(node) {
        node.exp.accept(this);
        this.code.popObject(r.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimitivo']}
     */
    visitLiteral(node) {
        this.code.comment(`Primitivo: ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitArithmetic(node) {
        this.code.comment(`Operacion: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        this.code.popObject(r.T0); // der
        this.code.popObject(r.T1); // izq

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
        }
        this.code.pushObject({ type: 'int', length: 4 });
    }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitUnario(node) {
        node.exp.accept(this);

        this.code.popObject(r.T0);

        switch (node.op) {
            case '-':
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
        }

    }

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitGrouping(node) {
        return node.exp.accept(this);
    }

    visitPrint(node) {
        this.code.comment('Print');

        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        for (let i = 0; i < node.exp.length; i++) {
            node.exp[i].accept(this);
            // hacer pop de la pila
            const object = this.code.popObject(r.A0);
            tipoPrint[object.type]();
        }
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitVariableDeclaration(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);


        node.exp.accept(this);
        this.code.tagObject(node.id);

        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitVariableAssign(node) {
        this.code.comment(`Asignacion Variable: ${node.id}`);

        node.asgn.accept(this);
        const valueObject = this.code.popObject(r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }


    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitVariableValue(node) {
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);


        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObject, id: undefined });

        // this.code.comment(`Fin Referencia Variable: ${node.id}`);
        this.code.comment(`Fin referencia de variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
    }


    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBlock(node) {
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.dcls.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }


}
/*
visitPrint(node) {
        this.code.comment('Print');

        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        for (let i = 0; i < node.exp.length; i++) {
            node.exp[i].accept(this);
            // hacer pop de la pila
            const object = this.code.popObject(r.A0);
            tipoPrint[object.type]();
        }


        
    } */