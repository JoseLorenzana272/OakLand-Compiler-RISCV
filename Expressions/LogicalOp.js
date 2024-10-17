import { Literal } from "../JS_Analyzer_parts/nodos.js";

/**
   * @param {string} op
   * @param {Literal} izq
   * @param {Literal} der
   * @returns {Literal}
   * @throws {Error}
 */

export function LogicalOp(op, izq, der){
    let resultado;
    console.log("VALORES: ", izq, der);
    if (izq.type === 'bool' && der.type === 'bool') {
        switch (op) {
            case '&&':
                resultado = izq.value && der.value;
                break;
            case '||':
                resultado = izq.value || der.value;
                break;
            default:
                throw new Error(`Operador lógico no soportado para booleanos: ${op}`);
        }
    } else {
        throw new Error('Operaciones lógicas solo soportan comparaciones entre booleanos.');
    }

    return new Literal({ value: resultado, type: 'bool' });

}