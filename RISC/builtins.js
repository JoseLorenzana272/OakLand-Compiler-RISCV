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
    //Pendiente
}

export const typeOf = (obj) => {
    obj.args.forEach(arg => {
        console.log(arg, obj.compiler);
        arg.accept(obj.compiler);
    });
    const valor = obj.compiler.code.popObject(r.T0);
    if (valor.type === 'int') {
        obj.compiler.code.pushContant({ type: 'string', value: 'int' });} else if (valor.type === 'float') {
        obj.compiler.code.pushContant({ type: 'string', value: 'float' });} else if (valor.type === 'char') {
        obj.compiler.code.pushContant({ type: 'string', value: 'char' });} else if (valor.type === 'bool') {
        obj.compiler.code.pushContant({ type: 'string', value: 'bool' });} else if (valor.type === 'string') {
        obj.compiler.code.pushContant({ type: 'string', value: 'string' });}
    obj.compiler.code.pushObject({ type: 'string', length: 4 });
    return
}


export const builtins = {
    concatString: concatString,
    typeof: typeOf

}
