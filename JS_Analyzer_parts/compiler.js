import { registers as r, floatRegisters as f } from "../RISC/constants.js"
import { Generador } from "../RISC/generator.js";
import nodos from "./nodos.js";
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
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimitivo']}
     */
    visitLiteral(node) {
        this.code.comment(`Primitive value: ${node.value}`);
        this.code.pushContant(node);
        this.code.comment(`End of Primitive Value: ${node.value}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitArithmetic(node) {
        this.code.comment(`Operation: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0);
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1);

        if (izq.type === 'string' && der.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);

            switch (node.op) {
                case '+':
                    this.code.fadd(f.FT0, f.FT1, f.FT0);
                    break;
                case '-':
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    break;
                case '*':
                    this.code.fmul(f.FT0, f.FT1, f.FT0);
                    break;
                case '/':
                    this.code.fdiv(f.FT0, f.FT1, f.FT0);
                    break;
            }

            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
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
        this.code.comment(`Relational Operation: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der
    
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0);
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1);

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);
            switch (node.op) {
                case '<':
                    this.code.flt(r.T0, f.FT1, f.FT0);
                    break;
                case '<=':
                    this.code.fle(r.T0, f.FT1, f.FT0);
                    break;
                case '>':
                    this.code.flt(r.T0, f.FT0, f.FT1);
                    break;
                case '>=':
                    this.code.fle(r.T0, f.FT0, f.FT1);
                    break;
            }
            this.code.push(r.T0);
            this.code.pushObject({ type: 'bool', length: 4 });
            return;
        }
    
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
        this.code.comment(`Igualation Operation: ${node.op}`);
        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0);
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1);

        if (izq.type === 'string' && der.type === 'string') {
            switch (node.op) {
                case '==':
                    this.code.mv(r.A0, r.T1);
                    this.code.mv(r.A1, r.T0);
                    this.code.callBuiltin('stringEqualString');
                    break;
                case '!=':
                    this.code.mv(r.A0, r.T1);
                    this.code.mv(r.A1, r.T0);
                    this.code.callBuiltin('stringNotEqualString');
                    break;
            }

            this.code.pushObject({ type: 'bool', length: 4 });
            return;
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);

            switch (node.op) {
                case '==':
                    this.code.feq(r.T0, f.FT1, f.FT0);
                    break;
                case '!=':
                    this.code.feq(r.T0, f.FT1, f.FT0);
                    this.code.xori(r.T0, r.T0, 1);
                    break;
            }

            this.code.push(r.T0);
            this.code.pushObject({ type: 'bool', length: 4 });
            return;
        }

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
        this.code.comment(`Logical Operation: ${node.op}`);
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

        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT0 : r.T0);

        if (isFloat) {
            switch (node.op) {
                case '-':
                    this.code.fmvw(f.FT1, r.T0);
                    this.code.fneg(f.FT0, f.FT1);
                    this.code.pushFloat(f.FT0);
                    this.code.pushObject({ type: 'float', length: 4 });
                    break;
            }
            return;
        }


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
            'char': () => this.code.printChar(),
            'float': () => this.code.printFloat()
        }

        for (let i = 0; i < node.exp.length; i++) {
            node.exp[i].accept(this);
            // hacer pop de la pila
            const isFloat = this.code.getTopObject().type === 'float';
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);
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
        this.code.comment(`Variable Declaration: ${node.id}`);
        
        if (node.value) {
            // Si hay un valor para la variable, aceptarlo
            node.value.accept(this);
        } else {
            const Literal = new nodos.Literal({ type: node.type, value: 0 });
            Literal.accept(this);
            
        }

        this.code.tagObject(node.id);
        this.code.comment(`End of Variable Declaration: ${node.id}`);
    }


    /**
 * @type {BaseVisitor['visitAsignacion']}
 */
visitVariableAssign(node) {
    this.code.comment(`Variable Assignation: ${node.id}`);

    node.assi.accept(this);
    const isFloat = this.code.getTopObject().type === 'float';
    const valueObject = this.code.popObject(isFloat ? f.FT0 : r.T0);
    const [offset, variableObject] = this.code.getObject(node.id);

    this.code.addi(r.T1, r.SP, offset);  // Calcula la dirección de la variable en la pila


    if (variableObject.type == 'float') {
        if (valueObject.type !== 'float') {
            this.code.fcvtsw(f.FT0, r.T0);
        }
        this.code.fsw(f.FT0, r.T1);
        this.code.pushFloat(f.FT0);
    } else {
        this.code.sw(r.T0, r.T1);
        this.code.push(r.T0);
    }

    
    this.code.pushObject(variableObject);

    this.code.comment(`End of Variable Assignation: ${node.id}`);
}



    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitVariableValue(node) {
        this.code.comment(`Variable Reference ${node.id}: ${JSON.stringify(this.code.objectStack)}`);


        const [offset, variableObject] = this.code.getObject(node.id);
        const isFloat = variableObject.type === 'float';

        this.code.addi(r.T0, r.SP, offset);
        if (isFloat) {
            this.code.flw(f.FT0, r.T0);
            this.code.pushFloat(f.FT0);
        } else {
            this.code.lw(r.T1, r.T0);
            this.code.push(r.T1);
        }
        this.code.pushObject({ ...variableObject, id: undefined });

        // this.code.comment(`Fin Referencia Variable: ${node.id}`);
        this.code.comment(`End of Variable Reference ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
    }


    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBlock(node) {
        this.code.comment('Start of Block');

        this.code.newScope();

        node.statements.forEach(d => d.accept(this));

        this.code.comment('Reducing the stack');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('End of Block');

    }

    /**
     * @type {BaseVisitor['visitIfNode']}
     */
    visitIfNode(node) {
        this.code.comment('Start of If Statement');

        this.code.comment('Condition');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('End of Condition');
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
            this.code.comment('True branch');
            node.stmtTrue.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            this.code.comment('False branch');
            node.stmtFalse.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            this.code.comment('True branch');
            node.stmtTrue.accept(this);
            this.code.addLabel(endIfLabel);
        }

        this.code.comment('End of If Statement');

    }

    /**
     * @type {BaseVisitor['visitWhileNode']}
     */
    visitWhileNode(node) {
        this.code.comment('Start of While Loop');

        const startWhile = this.code.getLabel();
        this.continue_labels.push(startWhile);
        const endWhile = this.code.getLabel();
        this.break_labels.push(endWhile);

        this.code.addLabel(startWhile);

        this.code.comment('Condition');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('End of Condition');

        this.code.beq(r.T0, r.ZERO, endWhile);

        this.code.comment('While Body');
        node.stmt.accept(this);
        this.code.j(startWhile);

        this.code.addLabel(endWhile);

        this.code.comment('End of While Loop');

    }

    /**
     * @type [BaseVisitor['visitIncrementDecrement']]
     */
    visitIncrementDecrement(node) {
        this.code.comment(`Increment/Decrement: ${node.op}`);

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

        this.code.comment(`End of Increment/Decrement: ${node.op}`);
    }

    /**
     * @type {BaseVisitor['visitForLoop']}
     */
    visitForLoop(node) {
        this.code.comment('Start of For Loop');

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

        this.code.comment('End of For Loop');
    }

    /**
     * @type {BaseVisitor['visitBreakNode']}
     */
    visitBreakNode(node) {
        this.code.comment('Break');
        const label = this.break_labels[this.break_labels.length - 1];
        this.code.j(label);
        this.code.comment('End Break');
    }

    /**
     * @type {BaseVisitor['visitContinueNode']}
     */
    visitContinueNode(node) {
        this.code.comment('Continue');
        const label = this.continue_labels[this.continue_labels.length - 1];
        this.code.j(label);
        this.code.comment('End Continue');
    }

    /**
     * @type {BaseVisitor['visitSwitchNode']}
     */
    visitSwitchNode(node) {
        this.code.comment('Start of Switch');

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
            this.code.comment(`Case Comparison ${value}`);
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
            this.code.comment(`Executing Case: ${caseLabels[i].value}`);
            caseNode.inst.forEach(stmt => stmt.accept(this));
            // Cae en el siguiente caso si no hay break dentro de cada case
        }

        // Default case
        if (hasDefault) {
            this.code.addLabel(defaultLabel);
            this.code.comment('Default case');
            node.def.stmts.forEach(stmt => stmt.accept(this));
        }

        this.code.addLabel(endSwitchLabel);
        this.break_labels.pop();
        this.code.comment('End of Switch');
    }

    /**
     * @type {BaseVisitor['visitCallNode']}
     */
    visitCallNode(node) {
        if (node.callee.id === 'typeof') {
            this.code.comment(`Function Call: ${node.id}`);
            this.code.callBuiltin(node.callee.id, this, node.args);
            this.code.comment('End of Function Call');
        } else if (node.callee.id === 'toLowerCase') {
            this.code.comment(`Function Call: ${node.callee.id}`);
            
            node.args[0].accept(this);
            console.log(node.args[0]);
            
            const strObj = this.code.popObject(r.A0);
            console.log(strObj);
            
            if (strObj.type !== 'string') {
                throw new Error('TypeError: toLowerCase() requires a string argument');
            }

            this.code.callBuiltin('toLowerCase');
            
            this.code.pushObject({ type: 'string', length: 4 });
            
            this.code.comment('End of Function Call');
        } else if (node.callee.id === 'toUpperCase') {
            this.code.comment(`Function Call: ${node.callee.id}`);
            
            node.args[0].accept(this);
            console.log(node.args[0]);
            
            const strObj = this.code.popObject(r.A0);
            console.log(strObj);
            
            if (strObj.type !== 'string') {
                throw new Error('TypeError: toUpperCase() requires a string argument');
            }

            this.code.callBuiltin('toUpperCase');
            
            this.code.pushObject({ type: 'string', length: 4 });
            
            this.code.comment('End of Function Call');
        } else if (node.callee.id === 'toString'){
            this.code.comment(`Function Call: ${node.callee.id}`);
        
            node.args[0].accept(this);
            const isFloat = this.code.getTopObject().type === 'float';
            const valor = this.code.popObject(isFloat ? f.FA0 : r.A0);
            
            if (valor.type === 'int') {
                this.code.li(r.A1, 1);
            } else if (valor.type === 'bool') {
                this.code.li(r.A1, 2);
            } else if (valor.type === 'char') {
                this.code.li(r.A1, 3);
            } else if (valor.type === 'string') {
                this.code.li(r.A1, 4);
            } else if (valor.type === 'float') {
                this.code.li(r.A1, 5);
                this.code.callBuiltin('floatToString');
                this.code.pushObject({ type: 'string', length: 4 });
                return;
            }
            
            this.code.callBuiltin('toString');
            
            this.code.pushObject({ type: 'string', length: 4 });
            
            this.code.comment('End of Function Call');
        }else if (node.callee.id === 'parseInt') {

            this.code.comment(`Function Call: ${node.callee.id}`);
        
            node.args[0].accept(this);
            const isFloat = this.code.getTopObject().type === 'float';
            const valor = this.code.popObject(isFloat ? f.FA0 : r.A0);

            if (valor.type === 'string' || valor.type === 'int') {

                this.code.callBuiltin('parseIntString');

                this.code.pushObject({ type: 'int', length: 4 });
            }else if(valor.type === 'float'){
                this.code.callBuiltin('parseIntFloat');

                this.code.pushObject({ type: 'int', length: 4 });
            }else {
                throw new Error('TypeError: parseInt() requires a string, float, or int argument');
            }
            
            this.code.comment('End of Function Call');

        }else if (node.callee.id === 'parsefloat') {

            this.code.comment(`Function Call: ${node.callee.id}`);
        
            node.args[0].accept(this);
            const isFloat = this.code.getTopObject().type === 'float';
            const valor = this.code.popObject(isFloat ? f.FA0 : r.A0);

            if (valor.type === 'string') {

                this.code.callBuiltin('parseFloat');

                this.code.pushObject({ type: 'float', length: 4 });
            }else if(valor.type === 'int'){
                this.code.callBuiltin('parseFloatInt');

                this.code.pushObject({ type: 'float', length: 4 });
            }
            else {
                throw new Error('TypeError: parseFloat() requires a string, float, or int argument');
            }
            
            this.code.comment('End of Function Call');
        }
    }

    
    /**
     * @type {BaseVisitor['VectorDeclaration']}
     */
    visitVectorDeclaration(node) {
        if (Array.isArray(node.values)) {
            this.code.comment(`Vector Declaration: ${node.id}`);
            this.code.setArray(node.id, node.size);
            this.code.la(r.T5, node.id);
            this.code.push(r.T5);
            node.values.forEach(value => {
                const isFloat = value.type === 'float';
                value.accept(this);
                this.code.popObject(isFloat ? f.FT1 : r.T1);
                if (isFloat) {
                    this.code.fsw(f.FT1, r.T5);
                }else{
                    this.code.sw(r.T1, r.T5);
                }
                this.code.addi(r.T5, r.T5, 4);
            });

        //Caso en el que se declara un vector sin valores (valores por defecto)
        } else if (node.size){
            const size = node.size;
            console.log("SIZE",size.value);
            this.code.comment(`Vector Declaration: ${node.id}`);
            this.code.setArray(node.id, size.value);
            this.code.la(r.T5, node.id);
            this.code.push(r.T5);
            for (let i = 0; i < node.size; i++) {
                const Literal = new nodos.Literal({ type: node.type, value: 0 });
                Literal.accept(this);
                const isFloat = this.code.getTopObject().type === 'float';
                this.code.popObject(isFloat ? f.FT1 : r.T1);
                if (isFloat) {
                    this.code.fsw(f.FT1, r.T5);
                }else{
                    this.code.sw(r.T1, r.T5);
                }
                this.code.addi(r.T5, r.T5, 4);
            }

        //Caso en el que se hace la copia de un vector ya existente
        }else{
            const sourceVectorId = node.values;
            const [sourceOffset, sourceObject] = this.code.getObject(sourceVectorId);
            console.log("SOURCE",sourceObject);


            this.code.setArray(node.id, sourceObject.length);
            this.code.la(r.T1, sourceVectorId);  // T1 = dirección del vector fuente
            this.code.la(r.T5, node.id);        // T5 = dirección del vector destino
            

            this.code.li(r.T2, sourceObject.length); // T2 = tamaño del vector fuente
                
            this.code.addi(r.T1, r.T1, 4);  // T1 = dirección primer elemento fuente
            this.code.addi(r.T5, r.T5, 4);  // T5 = dirección primer elemento destino
            
            // Copiar elementos
            this.code.comment(`Copying elements from vector: ${sourceVectorId}`);
            const loopLabel = this.code.getLabel();
            const endLabel = this.code.getLabel();
            
            this.code.li(r.T3, 0);  // T3 = contador
            
            this.code.addLabel(loopLabel);
            this.code.bge(r.T3, r.T2, endLabel);  // Si contador >= tamaño, terminar
            
            // Copiar elemento
            if (node.type === 'float') {
                this.code.flw(f.FT1, r.T1);  // Cargar valor float del vector fuente
                this.code.fsw(f.FT1, r.T5);  // Guardar valor float en vector destino
            } else {
                this.code.lw(r.T4, r.T1);    // Cargar valor int del vector fuente
                this.code.sw(r.T4, r.T5);    // Guardar valor int en vector destino
            }
            
            // Incrementar punteros y contador
            this.code.addi(r.T1, r.T1, 4);   // Avanzar puntero fuente
            this.code.addi(r.T5, r.T5, 4);   // Avanzar puntero destino
            this.code.addi(r.T3, r.T3, 1);   // Incrementar contador
            this.code.j(loopLabel);           // Volver al inicio del bucle
            
            // Fin del bucle
            this.code.addLabel(endLabel);
            }

            const objectLength = Array.isArray(node.values) ? node.values.length : node.size ? node.size.value : this.code.getObject(node.values)[1].length;
            console.log("OBJECT LENGTH",objectLength);
            this.code.pushObject({type: 'array-'+node.type, length: objectLength, depth: this.code.depth});
            this.code.tagObject(node.id);
            this.code.comment(`End of Vector Declaration: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitArrayAccess']}
     */
    visitArrayAccess(node) {
        this.code.comment(`Access to Vector: ${node.id}`);
        node.index.accept(this);
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT1 : r.T1);
        const [offset, object] = this.code.getObject(node.id);
        this.code.la(r.T5, node.id); // Cargar la dirección base del array
        this.code.li(r.T2, 4); // Cargar el tamaño de un elemento del array
        this.code.mul(r.T1, r.T1, r.T2); // Aqui es el indice * 4
        this.code.add(r.T5, r.T5, r.T1); // sse sumará el indice al puntero base
        if (!isFloat){
            this.code.lw(r.T1, r.T5);
            this.code.push(r.T1);
        }else{
            this.code.flw(f.FT1, r.T5);
            this.code.pushFloat(f.FT1);
        }
        this.code.pushObject({type: object.type.replace('array-', ''), length: object.length});
        this.code.comment(`End of Access to Vector: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitIndexOf']}
     */
    visitIndexOf(node) {
        this.code.comment(`IndexOf: ${node.id}`);
        node.exp.accept(this);
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT1 : r.T1);
        const [offset, object] = this.code.getObject(node.id);
        
        this.code.la(r.T5, node.id);
        this.code.li(r.T3, 0); // index = 0
        
        const startIndexOf = this.code.getLabel();
        const endIndexOf = this.code.getLabel();
        const foundIndexOf = this.code.getLabel();
        const notFoundIndexOf = this.code.getLabel();

        this.code.addLabel(startIndexOf);

        this.code.li(r.T4, object.length); // Cargar la longitud del array
        this.code.beq(r.T3, r.T4, notFoundIndexOf); // Si índice == longitud, no encontrado

        if (!isFloat){
            this.code.lw(r.T2, r.T5); // Cargar el valor en la posición actual
        }else{
            this.code.flw(f.FT2, r.T5); // Cargar el valor en la posición actual
        }

        if (!isFloat){
            this.code.beq(r.T1, r.T2, foundIndexOf); // Si valor == buscado, encontrado
        }else{
            this.code.feq(f.FT3, f.FT1, f.FT2); // Si valor == buscado, encontrado
            this.code.bnez(f.FT3, foundIndexOf);         
        }

        this.code.addi(r.T5, r.T5, 4); // Avanzar al siguiente elemento del array
        this.code.addi(r.T3, r.T3, 1); // Incrementar el índice
        this.code.j(startIndexOf);

        this.code.addLabel(notFoundIndexOf);
        this.code.li(r.T3, -1); // Si no se encontró, index = -1
        this.code.push(r.T3);
        this.code.j(endIndexOf);

        this.code.addLabel(foundIndexOf);
        this.code.push(r.T3);
        this.code.j(endIndexOf);

        this.code.addLabel(endIndexOf);
        this.code.pushObject({type: 'int', length: 4});
        this.code.comment(`End of IndexOf: ${node.id}`);
        
    }

    /**
     * @type {BaseVisitor['visitLength']}
    */
    visitLength(node) {
        this.code.comment(`Length: ${node.id}`);
        const [offset, object] = this.code.getObject(node.id);
        console.log(object);
        this.code.la(r.T5, node.id);
        this.code.li(r.T1, object.length);
        this.code.push(r.T1);
        this.code.pushObject({type: 'int', length: 4});
        this.code.comment(`End of Length: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitJoin']}
     */
    visitJoin(node) {
        this.code.comment(`Join: ${node.id}`);
        const [offset, object] = this.code.getObject(node.id);
        const isFloat = object.type === 'float';
        // arr1 = [1, 2, 3] => "123" (por el momento, sin separador)

        this.code.la(r.T5, node.id);
        this.code.li(r.T1, object.length); 
        this.code.li(r.T2, 0); // i = 0

        const joinLoop = this.code.getLabel();
        const joinEnd = this.code.getLabel();

        this.code.addLabel(joinLoop);
        this.code.beq(r.T2, r.T1, joinEnd); // Si i == longitud, terminar
        this.code.lw(r.T3, r.T5); // Cargar el valor en la posición actual
        this.code.addi(r.T5, r.T5, 4); // Avanzar al siguiente elemento del array


        this.code.push(r.T3);
        this.code.callBuiltin('toString');
        
        this.code.addi(r.T2, r.T2, 1); // Incrementar i
        this.code.j(joinLoop);

        this.code.addLabel(joinEnd);
        this.code.pushObject({type: 'string', length: 4});
        this.code.comment(`End of Join: ${node.id}`);
        //TODO: Implementar el join con un separador, igual aun no sirve

    }

    /**
     * @type {BaseVisitor['visitVectorAssign']}
     */
    visitVectorAssign(node) {
        this.code.comment(`Vector Assignation: ${node.id}`);
        const [offset, object] = this.code.getObject(node.id);
        this.code.la(r.T5, node.id);
        this.code.li(r.T2, 4); // Cargar el tamaño de un elemento del array
        node.index.accept(this);
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FT1 : r.T1);
        this.code.mul(r.T1, r.T1, r.T2); // Aqui es el indice * 4
        this.code.add(r.T5, r.T5, r.T1); // sse sumará el indice al puntero base
        node.assi.accept(this);
        const isFloatValue = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloatValue ? f.FT0 : r.T0);
        if (isFloatValue) {
            this.code.fsw(f.FT0, r.T5); // Guardar el valor en la posición del array
        }else{
            this.code.sw(r.T0, r.T5); // Guardar el valor en la posición del array
        }
        this.code.pushObject({type: object.type.replace('array-', ''), length: object.length});
        this.code.comment(`End of Vector Assignation: ${node.id}`);
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