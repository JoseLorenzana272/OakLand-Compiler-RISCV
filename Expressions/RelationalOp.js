import { Literal } from "../JS_Analyzer_parts/nodos.js";

/**
   * @param {string} op
   * @param {Literal} izq
   * @param {Literal} der
   * @returns {Literal}
   * @throws {Error}
 */

export function RelationalOp(op, izq, der){
    let resultado;

    if (typeof izq.value === 'string' && typeof der.value === 'string') {
        // Comparaciones para cadenas
        switch (op) {
            case '==':
                resultado = izq.value === der.value;
                break;
            case '!=':
                resultado = izq.value !== der.value;
                break;
            
        }
    } else {
        // Comparaciones para números
        const leftValue = parseFloat(izq.value);
        const rightValue = parseFloat(der.value);


        switch (op) {
            case '<':
                resultado = leftValue < rightValue;
                break;
            case '>':
                resultado = leftValue > rightValue;
                break;
            case '<=':
                resultado = leftValue <= rightValue;
                break;
            case '>=':
                resultado = leftValue >= rightValue;
                break;
            case '==':
                resultado = leftValue === rightValue;
                break;
            case '!=':
                resultado = leftValue !== rightValue;
                break;
            default:
                throw new Error(`Operador relacional desconocido: ${op}`);
        }
    }
    console.log("OPERAACION: ", izq, op, der, "RESULTADO: ", resultado);
    // El tipo de resultado siempre será booleano
    return new Literal({ value: resultado, type: 'bool' });
}