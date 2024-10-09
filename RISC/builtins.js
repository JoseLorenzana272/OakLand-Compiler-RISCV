import { registers as r } from "./constants.js"
import { Generador } from "./generator.js"

/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada')
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap')
    const end1 = code.getLabel()
    const loop1 = code.addLabel()

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end1)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    code.comment('Copiando la 2da cadena en el heap')
    const end2 = code.getLabel()
    const loop2 = code.addLabel()

    code.lb(r.T1, r.A1)
    code.beq(r.T1, r.ZERO, end2)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A1, r.A1, 1)
    code.j(loop2)
    code.addLabel(end2)

    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}

// Funciones embebidas

export const toString = (code) => {
    obj.args.forEach(arg => {
        console.log(arg, obj.compiler);
        arg.accept(obj.compiler);
    });
    const valor = obj.compiler.code.popObject(r.T0);

    return
}

export const typeOf = (obj) => {
    obj.args.forEach(arg => {
        console.log(arg, obj.compiler);
        arg.accept(obj.compiler);
    });
    const valor = obj.compiler.code.popObject(r.T0);
    if (valor.type === 'int') {
        obj.compiler.code.pushContant({ type: 'string', value: 'int' });
    } else if (valor.type === 'float') {
        obj.compiler.code.pushContant({ type: 'string', value: 'float' });
    } else if (valor.type === 'char') {
        obj.compiler.code.pushContant({ type: 'string', value: 'char' });
    } else if (valor.type === 'bool') {
        obj.compiler.code.pushContant({ type: 'string', value: 'bool' });
    } else if (valor.type === 'string') {
        obj.compiler.code.pushContant({ type: 'string', value: 'string' });
    }
    obj.compiler.code.pushObject({ type: 'string', length: 4 });
    return
}

export const toLowerCase = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // result -> push en el stack la dirección en heap de la cadena convertida a minúsculas
    code.comment('Guardando en el stack la dirección en heap de la cadena convertida a minúsculas')
    code.push(r.HP);
    code.comment('Copiando la cadena en el heap')

    const end = code.getLabel()
    const loop = code.getLabel()
    const noConvert = code.getLabel()
    const convert = code.getLabel()
    const nextChar = code.getLabel()

    code.addLabel(loop)

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end)

    // Caracteres de A-Z
    code.li(r.T2, 65)
    code.li(r.T3, 90)

    // Menor que A, no se convierte
    code.blt(r.T1, r.T2, noConvert)
    // Mayor que Z, no se convierte
    code.bgt(r.T1, r.T3, noConvert)

    // Aqui, el caracter es Mayúscula
    code.j(convert)

    // noConvert -> copiar el caracter tal cual
    code.addLabel(noConvert)
    code.sb(r.T1, r.HP)
    // nextChar -> siguiente caracter
    code.addLabel(nextChar)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop)

    // convert -> convertir el caracter a minúscula
    code.addLabel(convert)
    code.addi(r.T1, r.T1, 32)
    code.sb(r.T1, r.HP)

    code.j(nextChar)
    code.addLabel(end)
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)

    code.comment('Fin de la cadena')
    
}

export const toUpperCase = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // result -> push en el stack la dirección en heap de la cadena convertida a mayúsculas
    code.comment('Guardando en el stack la dirección en heap de la cadena convertida a mayúsculas')
    code.push(r.HP);
    code.comment('Copiando la cadena en el heap')

    const end = code.getLabel()
    const loop = code.getLabel()
    const noConvert = code.getLabel()
    const convert = code.getLabel()
    const nextChar = code.getLabel()

    code.addLabel(loop)

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end)

    // Caracteres de a-z
    code.li(r.T2, 97)
    code.li(r.T3, 122)

    // Menor que A, no se convierte
    code.blt(r.T1, r.T2, noConvert)
    // Mayor que Z, no se convierte
    code.bgt(r.T1, r.T3, noConvert)
    
    // Aqui, el caracter es minúscula
    code.j(convert)

    // noConvert -> copiar el caracter tal cual
    code.addLabel(noConvert)
    code.sb(r.T1, r.HP)
    // nextChar -> siguiente caracter
    code.addLabel(nextChar)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop)

    // convert -> convertir el caracter a mayúscula
    code.addLabel(convert)
    code.addi(r.T1, r.T1, -32)
    code.sb(r.T1, r.HP)

    code.j(nextChar)
    code.addLabel(end)
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)

    code.comment('Fin de la cadena')
}


export const builtins = {
    concatString: concatString,
    typeof: typeOf,
    toString: toString,
    toLowerCase: toLowerCase,
    toUpperCase: toUpperCase,
}
