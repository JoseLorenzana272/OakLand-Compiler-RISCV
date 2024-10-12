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
    // A0 -> valor a convertir
    // A1 -> tipo del valor (asumiendo que tienes un sistema de tipos)
    code.comment('Guardando en el stack la dirección en heap del resultado')
    code.push(r.HP);

    const endFunction = code.getLabel()
    const intCase = code.getLabel()
    const boolCase = code.getLabel()
    const charCase = code.getLabel()
    const stringCase = code.getLabel()
    const falseBranch = code.getLabel()

    // Determinar el tipo y saltar a la sección correspondiente
    code.li(r.T0, 1)  // 1 = int
    code.beq(r.A1, r.T0, intCase)
    code.li(r.T0, 2)  // 2 = bool
    code.beq(r.A1, r.T0, boolCase)
    code.li(r.T0, 3)  // 3 = char
    code.beq(r.A1, r.T0, charCase)
    code.li(r.T0, 4)  // 4 = string
    code.beq(r.A1, r.T0, stringCase)

    // Caso int
    code.addLabel(intCase)
    const intEnd = code.getLabel()
    const intLoop = code.getLabel()
    const intReverse = code.getLabel()
    
    code.add(r.T1, r.ZERO, r.HP)
    
    // Si es negativo, poner el signo '-'
    code.bgez(r.A0, intLoop)
    code.li(r.T2, 45)    // ASCII de '-'
    code.sb(r.T2, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.neg(r.A0, r.A0)   // Hacer positivo el número
    
    code.addLabel(intLoop)
    // Dividir por 10 y guardar el residuo
    code.li(r.T2, 10)
    code.rem(r.T3, r.A0, r.T2)    // T3 = residuo
    code.div(r.A0, r.A0, r.T2)    // A0 = cociente
    
    // Convertir dígito a ASCII y guardarlo
    code.addi(r.T3, r.T3, 48)   // ASCII '0' = 48
    code.sb(r.T3, r.HP)
    code.addi(r.HP, r.HP, 1)
    
    code.bnez(r.A0, intLoop)
    
    // Revertir los dígitos
    code.add(r.T2, r.ZERO, r.HP)  // T2 = fin
    code.addi(r.T2, r.T2, -1)     // Ajustar para último dígito
    
    code.addLabel(intReverse)
    code.bge(r.T1, r.T2, intEnd)
    code.lb(r.T3, (r.T1))      // Cargar dígito del inicio
    code.lb(r.T4, (r.T2))      // Cargar dígito del final
    code.sb(r.T4, (r.T1))      // Guardar dígito del final al inicio
    code.sb(r.T3, (r.T2))      // Guardar dígito del inicio al final
    code.addi(r.T1, r.T1, 1)    // Mover inicio hacia adelante
    code.addi(r.T2, r.T2, -1)   // Mover final hacia atrás
    code.j(intReverse)
    
    code.addLabel(intEnd)
    code.j(endFunction)

    // Caso bool
    code.addLabel(boolCase)
    code.beqz(r.A0, falseBranch)
    // true
    code.li(r.T1, 116)  // 't'
    code.sb(r.T1, r.HP)
    code.li(r.T1, 114)  // 'r'
    code.sb(r.T1, (r.HP))
    code.li(r.T1, 117)  // 'u'
    code.sb(r.T1, (r.HP))
    code.li(r.T1, 101)  // 'e'
    code.sb(r.T1, (r.HP))
    code.addi(r.HP, r.HP, 4)
    code.j(endFunction)

    code.addLabel(falseBranch)
    code.li(r.T1, 102)  // 'f'
    code.sb(r.T1, r.HP)
    code.li(r.T1, 97)   // 'a'
    code.sb(r.T1, (r.HP))
    code.li(r.T1, 108)  // 'l'
    code.sb(r.T1, (r.HP))
    code.li(r.T1, 115)  // 's'
    code.sb(r.T1, (r.HP))
    code.li(r.T1, 101)  // 'e'
    code.sb(r.T1, (r.HP))
    code.addi(r.HP, r.HP, 5)
    code.j(endFunction)

    // Caso char
    code.addLabel(charCase)
    code.sb(r.A0, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.j(endFunction)

    // Caso string (simplemente copiar)
    code.addLabel(stringCase)
    const endString = code.getLabel()
    const loopString = code.addLabel()
    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, endString)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loopString)
    code.addLabel(endString)

    // Fin de la función
    code.addLabel(endFunction)
    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
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
