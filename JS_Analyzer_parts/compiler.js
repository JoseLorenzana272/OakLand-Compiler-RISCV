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
        this.code.comment(`Primitivo: ${node.value}`);
        this.code.pushContant(node);
        this.code.comment(`Fin Primitivo: ${node.value}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitArithmetic(node) {
        this.code.comment(`Operacion: ${node.op}`);
        node.izq.accept(this);
        node.der.accept(this);

        this.code.popObject(r.T0);
        this.code.popObject(r.T1);

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '-':
                this.code.sub(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T2);
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
            this.code.popObject(r.A0);
            tipoPrint[object.type]();
        }


        
    }

}