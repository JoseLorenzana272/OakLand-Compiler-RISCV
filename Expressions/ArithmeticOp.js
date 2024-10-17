import { Literal } from "../JS_Analyzer_parts/nodos.js";

/**
   * @param {string} op
   * @param {Literal} izq
   * @param {Literal} der
   * @returns {Literal}
   * @throws {Error}
 */

export function ArithmeticOp(op, izq, der){
    let resultado;

    // Convertir los operandos a números
    const leftValue = izq.type !== 'string' ? parseFloat(izq.value) : izq.value;
    const rightValue = der.type !== 'string' ? parseFloat(der.value) : der.value;

    switch (op) {
        case '+':
            if (izq.type === 'string' || der.type === 'string') {
                resultado = izq.value + der.value;
            } else {
                resultado = leftValue + rightValue;
            }
            break;
        case '-':
            resultado = leftValue - rightValue;
            break;
        case '*':
            resultado = leftValue * rightValue;
            break;
        case '/':
            if (rightValue === 0) {
                console.warn('División por cero, resultado será null');
                return new Literal({ value: null, type: 'null' });
            }
            resultado = leftValue / rightValue;
            break;
        case '%':
            if (rightValue === 0) {
                console.warn('Módulo por cero, resultado será null');
                return new Literal({ value: null, type: 'null' });
            }
            resultado = leftValue % rightValue;
            break;
        default:
            throw new Error(`Operador no soportado: ${op}`);
    }
    

    if (typeof resultado === 'number' && isNaN(resultado)) {
        console.warn('Resultado es NaN, se devolverá null');
        return new Literal({ value: null, type: 'null' });
    }

    // Determinar el tipo de resultado
    const resultType = comprobarTipo(izq.type, der.type, op);

    console.log(resultType);
    
    return new Literal({ value: resultado, type: resultType });
    
}

function comprobarTipo(tipo1, tipo2, op) {
    if (op === '+') {
        if (tipo1 === 'string' && tipo2 === 'string') {
            return 'string';
        }
        if (tipo1 === 'int' && tipo2 === 'int') {
            return 'int';
        }
        if (tipo1 === 'int' || tipo2 === 'float' || tipo1 === 'float' || tipo2 === 'int') {
            return 'float';
        }
    } else if (op === '-') {
        if (tipo1 === 'int' && tipo2 === 'int') {
            return 'int';
        }
        if (tipo1 === 'int' || tipo2 === 'float' || tipo1 === 'float' || tipo2 === 'int') {
            return 'float';
        }
    } else if (op === '*') {
        if (tipo1 === 'int' && tipo2 === 'int') {
            return 'int';
        }
        if (tipo1 === 'int' || tipo2 === 'float' || tipo1 === 'float' || tipo2 === 'int') {
            return 'float';
        }
    } else if (op === '/') {
        if (tipo1 === 'int' && tipo2 === 'int') {
            return 'int';
        }
        if (tipo1 === 'int' || tipo2 === 'float' || tipo1 === 'float' || tipo2 === 'int') {
            return 'float';
        }
    } else if (op === '%') {
        if (tipo1 === 'int' && tipo2 === 'int') {
            return 'int';
        }
    }

    return false;
}