import { Summonable } from "./summonable.js";
import { Literal } from "../JS_Analyzer_parts/nodos.js";


class NativeFunction extends Summonable {
    constructor(aridad, func) {
        super();
        this.aridad = aridad;
        this.invocar = func;
    }
}


export const embedded = {
    'parseInt': new NativeFunction(() => 1, (interprete, args) => {
        const parsedValue = parseInt(args[0].value);
        if (isNaN(parsedValue)) {
            throw new Error(`Cannot parse value to int: ${args[0].value}`);
        }
        return new Literal({
            value: parsedValue,
            type: 'int'
        });
    }),
    'parsefloat': new NativeFunction(() => 1, (interprete, args) => {
        const parsedValue = parseFloat(args[0].value);
        if (isNaN(parsedValue)) {
            throw new Error(`Cannot parse value to float: ${args[0].value}`);
        }
        return new Literal({
            value: parsedValue,
            type: 'float'
        });
    }),
    'toString': new NativeFunction(() => 1, (interprete, args) => {
        if (args[0] === undefined || args[0].value === null) {
            throw new Error(`Cannot convert value to string: ${args[0].value}`);
        }
        return new Literal({
            value: args[0].value.toString(),
            type: 'string'
        });
    }),
    'toLowerCase': new NativeFunction(() => 1, (interprete, args) => {
        if (typeof args[0].value !== 'string') {
            throw new Error(`The value ${args[0].value} is not a string, cannot convert to lowercase`);
        }
        return new Literal({
            value: args[0].value.toLowerCase(),
            type: 'string'
        });
    }),
    'toUpperCase': new NativeFunction(() => 1, (interprete, args) => {
        if (typeof args[0].value !== 'string') {
            throw new Error(`The value ${args[0].value} is not a string, cannot convert to uppercase`);
        }
        return new Literal({
            value: args[0].value.toUpperCase(),
            type: 'string'
        });
    }),
    'typeof': new NativeFunction(() => 1, (interprete, args) => {
        return new Literal({
            value: args[0].type,
            type: 'string'
        });
    }),
}