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
    visitExpresionStmt(node) {
        node.exp.accept(this);
        this.code.popObject(r.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimitivo']}
     */
    visitPrimitivo(node) {
        this.code.comment(`Primitivo: ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
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
    visitOperacionUnaria(node) {
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
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    visitPrint(node) {
        let resultados = '';
        this.code.comment('Print');

        const object = this.code.popObject(r.A0);

        for (let i = 0; i < node.exp.length; i++) {
            const valor = node.exp[i].accept(this);
            resultados += this.formatValue(valor) + ' ';
        }
    
        this.salida += resultados + '\n';
        console.log(resultados);

        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        tipoPrint[object.type]();
    }

    formatValue(valor) {
        if (Array.isArray(valor)) {
            // Si es un array (matriz), manejarlo recursivamente
            return '[' + valor.map(v => this.formatValue(v)).join(', ') + ']';
        } else if (valor && typeof valor === 'object' && 'value' in valor) {
            // Si es un objeto con la propiedad 'value', acceder a ella
            return this.formatValue(valor.value);
        } else {
            // En caso de ser un valor literal directo
            return valor;
        }
    }

}