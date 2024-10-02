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
        node.o.accept(this);
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
     * @type {BaseVisitor['visitRelational']}
     */
    visitRelational(node) {
        this.code.comment(`Operacion Relacional: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der
    
        this.code.popObject(r.T0); // der
        this.code.popObject(r.T1); // izq
    
        switch (node.op) {
            case '<':
                this.code.slt(r.T0, r.T1, r.T0); // Si T1 < T0, T0 = 1
                break;
            case '<=':
                this.code.slt(r.T0, r.T0, r.T1); // Si T1 < T0, T0 = 1
                this.code.xori(r.T0, r.T0, 1);    // Invertir el resultado
                break;
            case '>':
                this.code.slt(r.T0, r.T0, r.T1); // Si T0 < T1, entonces T0 = 1
                break;
            case '>=':
                this.code.slt(r.T0, r.T1, r.T0); // Si T0 < T1, entonces T0 = 1
                this.code.xori(r.T0, r.T0, 1);    // Invertir el resultado
                break;
        }
        this.code.push(r.T0);
        this.code.pushObject({ type: 'bool', length: 4 });
    }

    /**
     * @type {BaseVisitor['visitIgualation']}
     */

    visitIgualation(node) {
        this.code.comment(`Operacion Igualacion: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        this.code.popObject(r.T0); // der
        this.code.popObject(r.T1); // izq

        switch (node.op) {
            case '==':
                this.code.xor(r.T0, r.T1, r.T0);
                this.code.seqz(r.T0, r.T0);
                break;
            case '!=':
                this.code.xor(r.T0, r.T1, r.T0);
                this.code.snez(r.T0, r.T0);
                break;
        }
        this.code.push(r.T0);
        this.code.pushObject({ type: 'bool', length: 4 });
    }
    

    /**
     * @type {BaseVisitor['visitLogical']}
     */
    visitLogical(node) {
        this.code.comment(`Operacion Logica: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        this.code.popObject(r.T0); // der
        this.code.popObject(r.T1); // izq

        switch (node.op) {
            case '&&':
                this.code.and(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '||':
                this.code.or(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
        }
        this.code.pushObject({ type: 'bool', length: 4 });
    }

    /**
     * @type {BaseVisitor['visitUnario']}
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
            case '!':
                this.code.li(r.T1, 1);
                this.code.xor(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'bool', length: 4 });
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
            'string': () => this.code.printString(),
            'bool': () => this.code.printBool(),
            'char': () => this.code.printChar()
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
        
        if (node.value) {
            // Si hay un valor para la variable, aceptarlo
            node.value.accept(this);
        } else {
            // Si no hay un valor, asignar un valor por defecto basado en el tipo
            switch (node.type) {
                case 'int':
                    this.code.pushObject({ type: 'int', value: 0 }); // Por defecto 0 para int
                    break;
                case 'float':
                    this.code.pushObject({ type: 'float', value: 0.0 }); // Por defecto 0.0 para float
                    break;
                case 'string':
                    this.code.pushObject({ type: 'string', value: "" }); // Por defecto cadena vacía
                    break;
                case 'boolean':
                    this.code.pushObject({ type: 'boolean', value: false }); // Por defecto false
                    break;
                default:
                    throw new Error(`Tipo de variable no soportado: ${node.type}`);
            }
        }

        this.code.tagObject(node.id);
        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }


    /**
 * @type {BaseVisitor['visitAsignacion']}
 */
visitVariableAssign(node) {
    this.code.comment(`Asignacion Variable: ${node.id}`);

    node.assi.accept(this);
    const valueObject = this.code.popObject(r.T0);  // Nuevo valor (expresión asignada)
    const [offset, variableObject] = this.code.getObject(node.id);

    this.code.addi(r.T1, r.SP, offset);  // Calcula la dirección de la variable en la pila
    this.code.lw(r.T2, r.T1);            // Carga el valor actual de la variable en r.T2

    // Manejar las operaciones += y -=
    switch (node.op) {
        case '+=':
            this.code.add(r.T0, r.T2, r.T0);  // r.T0 = r.T2 + r.T0 (valor actual + valor nuevo)
            break;
        case '-=':
            this.code.sub(r.T0, r.T2, r.T0);  // r.T0 = r.T2 - r.T0 (valor actual - valor nuevo)
            break;
        default:
            // Asignación simple (a = b)
            break;
    }

    this.code.sw(r.T0, r.T1);  // Guarda el nuevo valor en la dirección de la variable

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

        node.statements.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }

    /**
     * @type {BaseVisitor['visitIfNode']}
     */
    visitIfNode(node) {
        // Evaluar la condición
        node.cond.accept(this);

        this.code.li(r.T0, node.cond.value);
    
        // Hacer pop del valor de la condición
        this.code.popObject(r.T0);
    
        // Crear etiquetas
        const falseLabel = this.code.newLabel();
        const endLabel = this.code.newLabel();

        //Bloque if
        this.code.beqz(r.T0, falseLabel);
        // No se que más hacer aquí

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