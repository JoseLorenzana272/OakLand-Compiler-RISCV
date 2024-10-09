import { registers as r } from "../RISC/constants.js"
import { Generador } from "../RISC/generator.js";
import { BaseVisitor } from "./visitor.js";


export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();
        this.break_labels = [];
        this.continue_labels = [];
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

        const der = this.code.popObject(r.T0); // der
        const izq = this.code.popObject(r.T1); // izq

        if (izq.type === 'string' && der.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }
        

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

        if (node.op === '&&') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelFalse = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!izq) goto labelFalse
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!der) goto labelFalse

            this.code.li(r.T0, 1);
            this.code.push(r.T0);
            this.code.j(labelEnd);
            this.code.addLabel(labelFalse);
            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'bool', length: 4 });
            return
        }

        if (node.op === '||') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelTrue = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.bne(r.T0, r.ZERO, labelTrue); // if (izq) goto labelTrue
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.bne(r.T0, r.ZERO, labelTrue); // if (der) goto labelTrue

            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.j(labelEnd);
            this.code.addLabel(labelTrue);
            this.code.li(r.T0, 1);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'bool', length: 4 });
            return
        }
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
        //Salto de linea
        this.code.li(r.A0, 10);
        this.code.li(r.A7, 11);
        this.code.ecall();
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
        this.code.comment('Inicio de If');

        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        /*
        // no else
        if (!cond) goto endIf
            ...
        endIf:

        // else
        if (!cond) goto else
            ...
        goto endIf
        else:
            ...
        endIf:

        */

        const hasElse = !!node.stmtFalse

        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, elseLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            this.code.comment('Rama falsa');
            node.stmtFalse.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.addLabel(endIfLabel);
        }

        this.code.comment('Fin del If');

    }

    /**
     * @type {BaseVisitor['visitWhileNode']}
     */
    visitWhileNode(node) {
        this.code.comment('Inicio de While');

        const startWhile = this.code.getLabel();
        this.continue_labels.push(startWhile);
        const endWhile = this.code.getLabel();
        this.break_labels.push(endWhile);

        this.code.addLabel(startWhile);

        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');

        this.code.beq(r.T0, r.ZERO, endWhile);

        this.code.comment('Cuerpo del While');
        node.stmt.accept(this);
        this.code.j(startWhile);

        this.code.addLabel(endWhile);

        this.code.comment('Fin del While');

    }

    /**
     * @type [BaseVisitor['visitIncrementDecrement']]
     */
    visitIncrementDecrement(node) {
        this.code.comment(`Incremento/Decremento: ${node.op}`);

        const [offset, object] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);

        if (node.op === '++') {
            this.code.addi(r.T1, r.T1, 1);
        } else {
            this.code.addi(r.T1, r.T1, -1);
        }

        this.code.sw(r.T1, r.T0);

        this.code.push(r.T1);
        this.code.pushObject({ ...object, type: 'int' });

        this.code.comment(`Fin Incremento/Decremento: ${node.op}`);
    }

    /**
     * @type {BaseVisitor['visitForLoop']}
     */
    visitForLoop(node) {
        this.code.comment('Inicio de For');

        this.code.newScope();

        node.init.accept(this);

        const startFor = this.code.getLabel();
        const endFor = this.code.getLabel();
        this.break_labels.push(endFor);

        //Etiqueta especial para el continue (saltar a la parte de incremento)
        const continueLabel = this.code.getLabel();
        this.continue_labels.push(continueLabel);

        this.code.addLabel(startFor);

        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.beq(r.T0, r.ZERO, endFor);

        node.stmt.accept(this);

        this.code.addLabel(continueLabel);
        node.inc.accept(this);

        this.code.j(startFor);
        this.code.addLabel(endFor);

        this.code.endScope();

        this.code.comment('Fin de For');
    }

    /**
     * @type {BaseVisitor['visitBreakNode']}
     */
    visitBreakNode(node) {
        this.code.comment('Break');
        const label = this.break_labels[this.break_labels.length - 1];
        this.code.j(label);
        this.code.comment('Fin Break');
    }

    /**
     * @type {BaseVisitor['visitContinueNode']}
     */
    visitContinueNode(node) {
        this.code.comment('Continue');
        const label = this.continue_labels[this.continue_labels.length - 1];
        this.code.j(label);
        this.code.comment('Fin Continue');
    }

    /**
     * @type {BaseVisitor['visitSwitchNode']}
     */
    visitSwitchNode(node) {
        this.code.comment('Inicio de Switch');

        // Evaluar la expresión del switch
        node.exp.accept(this);
        this.code.popObject(r.T0);

        const endSwitchLabel = this.code.getLabel();
        this.break_labels.push(endSwitchLabel);

        const defaultLabel = this.code.getLabel();
        let hasDefault = false;

        // Se generan las etiquetas para cada caso en un array
        const caseLabels = node.cases.map(caseNode => ({
            value: caseNode.value.value,
            label: this.code.getLabel()
        }));
        console.log(caseLabels);

        // Comparar la expresión del switch con cada caso
        for (const {value, label} of caseLabels) {
            this.code.comment(`Comparación caso ${value}`);
            // Aqui es mejor cargar el valor de manera inmediata
            this.code.li(r.T1, value);
            this.code.beq(r.T0, r.T1, label);
        }

        // Se va a default si no cumple los cases
        if (node.def) {
            hasDefault = true;
            this.code.j(defaultLabel);
        } else {
            this.code.j(endSwitchLabel);
        }

        // Instrucciones de cada case
        for (let i = 0; i < node.cases.length; i++) {
            const caseNode = node.cases[i];
            this.code.addLabel(caseLabels[i].label);
            this.code.comment(`Ejecutando caso ${caseLabels[i].value}`);
            caseNode.inst.forEach(stmt => stmt.accept(this));
            // Cae en el siguiente caso si no hay break dentro de cada case
        }

        // Default case
        if (hasDefault) {
            this.code.addLabel(defaultLabel);
            this.code.comment('Caso por defecto');
            node.def.stmts.forEach(stmt => stmt.accept(this));
        }

        this.code.addLabel(endSwitchLabel);
        this.break_labels.pop();
        this.code.comment('Fin del Switch');
    }

    /**
     * @type {BaseVisitor['visitCallNode']}
     */
    visitCallNode(node) {
        this.code.comment(`Llamada a función: ${node.id}`);
        this.code.callBuiltin(node.callee.id, this, node.args);
        this.code.comment('Fin de llamada a función');
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