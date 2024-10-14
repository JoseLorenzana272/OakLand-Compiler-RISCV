import { registers as r, floatRegisters as f } from "./constants.js"
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

    
    // Caso bool (optimizado)
    const copyString = code.getLabel()
    const endCopyString = code.getLabel()
    code.addLabel(boolCase)
    code.beqz(r.A0, falseBranch)
    // true
    code.la(r.T1, 'true_str')
    code.j(copyString)

    code.addLabel(falseBranch)
    code.la(r.T1, 'false_str')

    // Copiar la cadena correspondiente al heap
    
    code.addLabel(copyString)
    code.lb(r.T2, (r.T1))
    code.beqz(r.T2, endCopyString)
    code.sb(r.T2, (r.HP))
    code.addi(r.HP, r.HP, 1)
    code.addi(r.T1, r.T1, 1)
    code.j(copyString)
    code.addLabel(endCopyString)
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

export const floatToString = (code) => {
    // A0 -> valor a convertir
    // A1 -> tipo del valor
    code.comment('Guardando en el stack la dirección en heap del resultado')
    code.push(r.HP);

    const endFunction = code.getLabel()
    const floatCase = code.getLabel()
    const floatEnd = code.getLabel()
    const floatLoop = code.getLabel()
    const floatReverse = code.getLabel()

    code.comment('Convertir float a string')
    code.fcvtsw(f.FT0, r.A0)
    code.fmvxw(r.A0, f.FT0)

    code.addLabel(floatCase)
    code.add(r.T1, r.ZERO, r.HP)

    // Si es negativo, poner el signo '-'
    code.flt(r.T0, f.FT0, f.FT0); // Comparar si FT0 < 0
    code.beqz(r.T0, floatLoop);
    code.li(r.T2, 45)    // ASCII de '-'
    code.sb(r.T2, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.fneg(f.FT0, f.FT0)   // Hacer positivo el número

    code.addLabel(floatLoop)
    // Dividir por 10 y guardar el residuo
    code.li(r.T2, 10);
    code.fdiv(f.FT1, f.FT0, f.FT2); // FT1 = cociente (parte entera)
    
    // Calcular el residuo
    code.fmul(f.FT1, f.FT1, f.FT2); // FT1 = parte entera * 10
    code.fsub(f.FT1, f.FT0, f.FT1); // FT1 = valor - (parte entera * 10)
    
    // Convertir dígito a ASCII y guardarlo
    code.fmvwx(r.T3, f.FT1)
    code.addi(r.T3, r.T3, 48)   // ASCII '0' = 48
    code.sb(r.T3, r.HP)
    code.addi(r.HP, r.HP, 1)

    code.fmvwx(r.T3, f.FT0)
    code.fmvwx(r.T2, f.FT2)
    code.fmvwx(r.T1, f.FT1)
    code.j(floatLoop)

    // Revertir los dígitos
    code.add(r.T2, r.ZERO, r.HP)  // T2 = fin
    code.addi(r.T2, r.T2, -1)     // Ajustar para último dígito

    code.addLabel(floatReverse)
    code.bge(r.T1, r.T2, floatEnd)
    code.lb(r.T3, (r.T1))      // Cargar dígito del inicio
    code.lb(r.T4, (r.T2))      // Cargar dígito del final
    code.sb(r.T4, (r.T1))      // Guardar dígito del final al inicio
    code.sb(r.T3, (r.T2))      // Guardar dígito del inicio al final
    code.addi(r.T1, r.T1, 1)    // Mover inicio hacia adelante
    code.addi(r.T2, r.T2, -1)   // Mover final hacia atrás
    code.j(floatReverse)

    code.addLabel(floatEnd)
    code.j(endFunction)

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
    const isFloat = obj.compiler.code.getTopObject().type === 'float';
    const valor = obj.compiler.code.popObject(isFloat ? f.FA0 : r.A0);
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

export const parseIntString = (code) => {
    // A0 -> dirección en heap de la cadena a convertir
    // result -> push en el stack el valor entero resultante

    code.comment('Inicializando el resultado en 0')
    code.li(r.T0, 0)

    code.comment('Verificando si el primer carácter es un signo negativo')
    code.lb(r.T1, r.A0)
    code.li(r.T2, 45)  // ASCII del signo '-'
    const notNegative = code.getLabel()
    code.bne(r.T1, r.T2, notNegative)
    code.addi(r.A0, r.A0, 1)  // Si es negativo, avanzamos al siguiente carácter
    code.addLabel(notNegative)

    const parseLoop = code.getLabel()
    const endParse = code.getLabel()
    const isNegative = code.getLabel()
    const pushResult = code.getLabel()

    code.comment('Iterando sobre cada carácter de la cadena')
    code.addLabel(parseLoop)
    code.lb(r.T1, r.A0)
    code.beqz(r.T1, endParse)  // Si llegamos al final de la cadena (carácter nulo), terminamos


    code.comment('Convirtiendo el carácter ASCII a su valor numérico')
    code.addi(r.T1, r.T1, -48)  // ASCII '0' = 48

    code.comment('Verificando si el carácter es un dígito válido (0-9)')
    code.li(r.T2, 0)
    code.blt(r.T1, r.T2, endParse)  // Si es menor que 0, terminamos
    code.li(r.T2, 9)
    code.bgt(r.T1, r.T2, endParse)  // Si es mayor que 9, terminamos

    code.comment('Multiplicando el resultado acumulado por 10 y sumando el nuevo dígito')
    code.li(r.T3, 10)
    code.mul(r.T0, r.T0, r.T3)
    code.add(r.T0, r.T0, r.T1)

    code.comment('Avanzando al siguiente carácter')
    code.addi(r.A0, r.A0, 1)
    code.j(parseLoop)



    code.addLabel(endParse)

    code.comment('Verificando si el número es negativo')
    code.lb(r.T1, r.A0)
    code.li(r.T2, 45)  // ASCII del signo '-'
    code.bne(r.T1, r.T2, pushResult)
    
    code.addLabel(isNegative)
    code.comment('Si es negativo, negamos el resultado antes de guardarlo')
    code.neg(r.T0, r.T0)

    code.addLabel(pushResult)
    code.comment('Guardando el resultado en el stack')
    code.push(r.T0)

    code.comment('Retornando de la función')
    code.jr(r.RA)
}

export const parseIntFloat = (code) => {
    // A0 -> contiene el valor flotante a convertir
    // result -> push en el stack el valor entero resultante

    code.comment('Convertir float a int')
    
    // Mover el valor flotante de A0 a FT0
    code.fmvs(f.FT0, f.FA0)
    
    // Truncar el float a int
    code.fcvtws(r.T0, f.FT0)
    
    code.comment('Guardando el resultado en el stack')
    code.push(r.T0)

    code.comment('Retornando de la función')
    code.jr(r.RA)
}

export const parseFloat = (code) => {
    // A0 -> dirección en heap de la cadena a convertir
    // result -> push en el stack el valor flotante resultante

    code.comment('Inicializando el resultado en 0')
    code.li(r.T0, 0)  // Parte entera
    code.li(r.T1, 0)  // Parte decimal
    code.li(r.T2, 1)  // Divisor para la parte decimal

    code.comment('Verificando si el primer carácter es un signo negativo')
    code.lb(r.T3, r.A0)
    code.li(r.T4, 45)  // ASCII del signo '-'
    const notNegative = code.getLabel()
    code.bne(r.T3, r.T4, notNegative)
    code.addi(r.A0, r.A0, 1)  // Si es negativo, avanzamos al siguiente carácter
    code.addLabel(notNegative)

    const parseLoop = code.getLabel()
    const parseDecimal = code.getLabel()
    const endParse = code.getLabel()
    const isNegative = code.getLabel()
    const pushResult = code.getLabel()

    code.comment('Iterando sobre cada carácter de la cadena')
    code.addLabel(parseLoop)
    code.lb(r.T3, r.A0)
    code.beqz(r.T3, endParse)  // Si llegamos al final de la cadena, terminamos

    code.comment('Verificando si es un punto decimal')
    code.li(r.T4, 46)  // ASCII del punto '.'
    code.beq(r.T3, r.T4, parseDecimal)

    code.comment('Convirtiendo el carácter ASCII a su valor numérico')
    code.addi(r.T3, r.T3, -48)  // ASCII '0' = 48

    code.comment('Verificando si el carácter es un dígito válido (0-9)')
    code.li(r.T4, 0)
    code.blt(r.T3, r.T4, endParse)  // Si es menor que 0, terminamos
    code.li(r.T4, 9)
    code.bgt(r.T3, r.T4, endParse)  // Si es mayor que 9, terminamos

    code.comment('Multiplicando el resultado acumulado por 10 y sumando el nuevo dígito')
    code.li(r.T4, 10)
    code.mul(r.T0, r.T0, r.T4)
    code.add(r.T0, r.T0, r.T3)

    code.comment('Avanzando al siguiente carácter')
    code.addi(r.A0, r.A0, 1)
    code.j(parseLoop)

    code.comment('Procesando la parte decimal')
    code.addLabel(parseDecimal)
    code.addi(r.A0, r.A0, 1)  // Avanzamos después del punto decimal
    code.li(r.T2, 1)  // Inicializamos el divisor en 1

    const parseDecimalLoop = code.getLabel()
    code.addLabel(parseDecimalLoop)
    code.lb(r.T3, r.A0)
    code.beqz(r.T3, endParse)  // Si llegamos al final de la cadena, terminamos

    code.comment('Convirtiendo el carácter ASCII a su valor numérico')
    code.addi(r.T3, r.T3, -48)  // ASCII '0' = 48

    code.comment('Verificando si el carácter es un dígito válido (0-9)')
    code.li(r.T4, 0)
    code.blt(r.T3, r.T4, endParse)  // Si es menor que 0, terminamos
    code.li(r.T4, 9)
    code.bgt(r.T3, r.T4, endParse)  // Si es mayor que 9, terminamos

    code.comment('Agregando el dígito a la parte decimal')
    code.mul(r.T1, r.T1, r.T2)  // Multiplicamos la parte decimal actual por 10
    code.add(r.T1, r.T1, r.T3)  // Sumamos el nuevo dígito
    code.li(r.T4, 10)
    code.mul(r.T2, r.T2, r.T4)  // Actualizamos el divisor (multiplicamos por 10)

    code.comment('Avanzando al siguiente carácter')
    code.addi(r.A0, r.A0, 1)
    code.j(parseDecimalLoop)

    code.addLabel(endParse)

    code.comment('Combinando parte entera y decimal')
    code.fcvtsw(f.FT0, r.T0)  // Convertimos la parte entera a float
    code.fcvtsw(f.FT1, r.T1)  // Convertimos la parte decimal a float
    code.fcvtsw(f.FT2, r.T2)  // Convertimos el divisor a float
    code.fdiv(f.FT1, f.FT1, f.FT2)  // Dividimos la parte decimal por el divisor
    code.fadd(f.FT0, f.FT0, f.FT1)  // Sumamos la parte entera y decimal

    code.comment('Verificando si el número es negativo')
    code.lb(r.T3, r.A0)
    code.li(r.T4, 45)  // ASCII del signo '-'
    code.bne(r.T3, r.T4, pushResult)
    
    code.addLabel(isNegative)
    code.comment('Si es negativo, negamos el resultado')
    code.fneg(f.FT0, f.FT0)

    code.addLabel(pushResult)
    code.comment('Guardando el resultado en el stack')
    code.pushFloat(f.FT0)

    code.comment('Retornando de la función')
    code.jr(r.RA)
}

export const parseFloatInt = (code) => {
    code.comment('Convirtiendo el entero a float')
    code.fcvtsw(f.FT0, r.A0)

    code.comment('Guardando el resultado en el stack')
    code.pushFloat(f.FT0)

    code.comment('Retornando de la función')
    code.jr(r.RA)
}

export const builtins = {
    concatString: concatString,
    typeof: typeOf,
    toString: toString,
    toLowerCase: toLowerCase,
    toUpperCase: toUpperCase,
    parseIntString: parseIntString,
    parseIntFloat: parseIntFloat,
    floatToString: floatToString,
    parseFloat: parseFloat,
    parseFloatInt: parseFloatInt,
}
