import { registers as r, floatRegisters as f } from "./constants.js";
import { stringTo32BitsArray, stringTo1ByteArray, numberToF32 } from "./utils.js";
import { builtins } from "./builtins.js";

class Instruction {

    constructor(instruccion, rd, rs1, rs2) {
        this.instruccion = instruccion;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operandos = []
        if (this.rd !== undefined) operandos.push(this.rd)
        if (this.rs1 !== undefined) operandos.push(this.rs1)
        if (this.rs2 !== undefined) operandos.push(this.rs2)
        return `${this.instruccion} ${operandos.join(', ')}`
    }

}

export class Generador {

    constructor() {
        this.instrucciones = []
        this.objectStack = []
        this.depth = 0
        this._usedBuiltins = new Set()
        this._labelCounter = 0;
        this._Array = new Map();
        
    }

    setArray(id, length){
        this._Array.set(id, length);
    }

    getLabel() {
        return `L${this._labelCounter++}`
    }

    addLabel(label) {
        label = label || this.getLabel()
        this.instrucciones.push(new Instruction(`${label}:`))
        return label
    }

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }

    addi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inmediato))
    }

    neg(rd, rs1) {
        this.instrucciones.push(new Instruction('neg', rd, rs1))
    }

    fmvw(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.w.x', rd, rs1))
    }

    /* ---------------- Instrucciones de punto flotante --------------------- */
    // --- Instruciones flotantes

    fadd(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fadd.s', rd, rs1, rs2))
    }

    fsub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fsub.s', rd, rs1, rs2))
    }

    fmul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fmul.s', rd, rs1, rs2))
    }

    fdiv(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fdiv.s', rd, rs1, rs2))
    }

    frem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('frem.s', rd, rs1, rs2))
    }

    fli(rd, inmediato) {
        this.instrucciones.push(new Instruction('fli.s', rd, inmediato))
    }

    flt(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('flt.s', rd, rs1, rs2))
    }

    fle(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fle.s', rd, rs1, rs2))
    }

    fcvtsw(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    fmvwx(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.x.w', rd, rs1))
    }

    fmvxw(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.x.w', rd, rs1))
    }

    fcvtws (rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.w.s', rd, rs1))
    }

    fmv(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    fsw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('fsw', rs1, `${inmediato}(${rs2})`))
    }

    fcvtsw(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    fneg(rd, rs1) {
        this.instrucciones.push(new Instruction('fneg.s', rd, rs1))
    }

    fmvs(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    feq(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('feq.s', rd, rs1, rs2))
    }



    /* ---------------- Instrucciones Relacionales --------------------- */

    slt(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2))
    }

    slti(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('slti', rd, rs1, inmediato))
    }

    sltu(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sltu', rd, rs1, rs2))
    }

    sltiu(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('sltiu', rd, rs1, inmediato))
    }

    seq(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('seq', rd, rs1, rs2))
    }

    seqz(rd, rs1) {
        this.instrucciones.push(new Instruction('seqz', rd, rs1))
    }

    snez(rd, rs1) {
        this.instrucciones.push(new Instruction('snez', rd, rs1))
    }

    sltz(rd, rs1) {
        this.instrucciones.push(new Instruction('sltz', rd, rs1))
    }

    sgtz(rd, rs1) {
        this.instrucciones.push(new Instruction('sgtz', rd, rs1))
    }

    /* ---------------- Instrucciones lógicas --------------------- */

    and(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('and', rd, rs1, rs2))
    }

    or(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('or', rd, rs1, rs2))
    }

    xor(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('xor', rd, rs1, rs2))
    }

    andi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('andi', rd, rs1, inmediato))
    }

    ori(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('ori', rd, rs1, inmediato))
    }

    xori(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('xori', rd, rs1, inmediato))
    }

    not(rd, rs1) {
        this.instrucciones.push(new Instruction('not', rd, rs1))
    }
    /* ------------------------------------------------------------------ */
    /* ----------------- Instrucciones para if -------------------------- */

    beq(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('beq', rs1, rs2, label))
    }

    beqz(rs1, label) {
        this.instrucciones.push(new Instruction('beqz', rs1, label))
    }

    bne(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bne', rs1, rs2, label))
    }

    bnez(rs1, label) {
        this.instrucciones.push(new Instruction('bnez', rs1, label))
    }

    blt(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('blt', rs1, rs2, label))
    }

    bltu(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bltu', rs1, rs2, label))
    }

    bltz(rs1, label) {
        this.instrucciones.push(new Instruction('bltz', rs1, label))
    }

    bgt(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bgt', rs1, rs2, label))
    }

    bgtu(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bgtu', rs1, rs2, label))
    }

    bgtz(rs1, label) {
        this.instrucciones.push(new Instruction('bgtz', rs1, label))
    }

    ble(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('ble', rs1, rs2, label))
    }

    bleu(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bleu', rs1, rs2, label))
    }

    blez(rs1, label) {
        this.instrucciones.push(new Instruction('blez', rs1, label))
    }

    bge(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bge', rs1, rs2, label))
    }

    bgeu(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bgeu', rs1, rs2, label))
    }

    bgez(rs1, label) {
        this.instrucciones.push(new Instruction('bgez', rs1, label))
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'))
    }

    /* ------ Salto incondicional ------ */

    jal(label) {
        this.instrucciones.push(new Instruction('jal', label))
    }

    j(label) {
        this.instrucciones.push(new Instruction('j', label))
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'))
    }

    jr(rs1) {
        this.instrucciones.push(new Instruction('jr', rs1))
    }

    /* ------------------------------------------------------------------- */

    /* ------------------------ Instrucción de Break ---------------------- */


    sw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inmediato}(${rs2})`))
    }

    sb(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }

    lw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inmediato}(${rs1})`))
    }

    lb(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lb', rd, `${inmediato}(${rs1})`))
    }

    li(rd, inmediato) {
        this.instrucciones.push(new Instruction('li', rd, inmediato))
    }

    la(rd, label) {
        this.instrucciones.push(new Instruction('la', rd, label))
    }

    push(rd = r.T0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, r.SP)
    }

    pushFloat(rd = f.FT0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.fsw(rd, r.SP)
    }

    rem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('rem', rd, rs1, rs2))
    }

    mv(rd, rs) {
        this.instrucciones.push(new Instruction('mv', rd, rs))
    }

    pop(rd = r.T0) {
        this.lw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }

    ecall() {
        this.instrucciones.push(new Instruction('ecall'))
    }

    callBuiltin(builtinName, compiler, args) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }

        if (builtinName === "typeof") {
            builtins[builtinName]({ compiler, args })
            return
        }

        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }

    printInt(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 1)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }

    }

    printFloat() {
        this.li(r.A7, 2)
        this.ecall()
    }

    printString(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 4)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }

    printBool(rd = r.A0) {
        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        //Imprimir "true" o "false"
        const falseLabel = this.getLabel()
        const endLabel = this.getLabel()

        this.beqz(r.A0, falseLabel)

        // Imprimir "true"
        this.la(r.A0, 'true_str')
        this.li(r.A7, 4)
        this.ecall()
        this.j(endLabel)

         // Imprimir false
        this.addLabel(falseLabel)
        this.la(r.A0, 'false_str')
        this.li(r.A7, 4)
        this.ecall()

        this.addLabel(endLabel)

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }

    printChar(rd = r.A0) {
        if (rd !== r.A0) {
            // Mover el valor del registro rd a a0
            this.mv(r.A0, rd)
        }

        // tecnicamnete aqui se imprime solo el primer byte
        this.andi(r.A0, r.A0, 0xFF)

        this.li(r.A7, 11)
        this.ecall()
    }
    

    endProgram() {
        this.li(r.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    pushContant(object) {
        let length = 0;

        switch (object.type) {
            case 'int':
                this.li(r.T0, object.value);
                this.push()
                length = 4;
                break;

            case 'string':
                const stringArray = stringTo1ByteArray(object.value);

                this.comment(`Pushing string ${object.value}`);
                // this.addi(r.T0, r.HP, 4);
                // this.push(r.T0);
                this.push(r.HP);

                stringArray.forEach((charCode) => {
                    this.li(r.T0, charCode);
                    // this.push(r.T0);
                    // this.addi(r.HP, r.HP, 4);
                    // this.sw(r.T0, r.HP);

                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                });

                length = 4;
                break;
            
            case 'bool':
                this.li(r.T0, object.value ? 1 : 0);
                this.push(r.T0);
                length = 4;
                break;
            
            case 'char':
                this.li(r.T0, object.value.charCodeAt(0));
                this.push(r.T0);
                length = 4;
                break;
            
            case 'float':
                const ieee754 = numberToF32(object.value);
                this.li(r.T0, ieee754);
                this.push(r.T0);
                length = 4;
                break;
            default:
                break;
        }

        this.pushObject({ type: object.type, length, depth: this.depth });
    }

    pushObject(object) {
        this.objectStack.push(object);
    }

    popFloat(rd = f.FT0) {
        this.flw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }

    popObject(rd = r.T0) {
        const object = this.objectStack.pop();


        switch (object.type) {
            case 'int':
                this.pop(rd);
                break;

            case 'string':
                this.pop(rd);
                break;
            case 'bool':
                this.pop(rd);
                break;
            case 'char':
                this.pop(rd);
                break;
            case 'float':
                this.popFloat(rd);
                break;
            default:
                break;
        }

        return object;
    }

    /*
     FUNCIONES PARA ENTORNOS
    */

    getTopObject() {
        return this.objectStack[this.objectStack.length - 1];
    }

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0;

        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                byteOffset += this.objectStack[i].length;
                this.objectStack.pop();
            } else {
                break;
            }
        }
        this.depth--

        return byteOffset;
    }


    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Variable ${id} not found`);
    }

    toString() {
        this.comment('End of program')
        this.endProgram()
        this.comment('Builtins')

        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.addLabel(builtinName)
            builtins[builtinName](this)
            this.ret()
        })
        return `

.data
        ${Array.from(this._Array.entries()).map(([key, value]) => `${key}: .space ${value * 4}`).join('\n')}
        true_str:    .string "true"
        false_str:   .string "false"
        zero_division_error: .string "Error: Division by zero"
        heap:
.text

# initializing stack pointer
    la ${r.HP}, heap

main:
    ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
`
    }

}