import { Literal } from "../JS_Analyzer_parts/nodos.js";
import { embedded } from "../Instructions/embedded.js";
import { Errors } from "../Errors/Errors.js";

const ReservedWords = {'if': 1, 'else':1, 'while':1, 'for':1, 'switch':1, 'case':1, 'break':1, 'continue':1, 'return':1, 'var':1, 'true':1, 'false':1, 'null':1, 'struct':1, 'void':1}

export class Entorno {
    /**
     * @param {Entorno} padre
     */
    constructor(padre = undefined) {
        this.valores = {};
        this.padre = padre;
        Object.entries(embedded).forEach(([nombre, funcion]) => {
            this.setOrUpdateVariable("string", nombre, funcion);
        });

        
    }

    /**
     * @param {string} tipo
     * @param {string} nombre
     * @param {any} valor
     */
    setVariable(tipo, nombre, valor) {
        //Verificar si el nombre de la variable es una palabra reservada
        if (ReservedWords.hasOwnProperty(nombre)) {
            throw new Errors(`The variable ${nombre} is a reserved word`, {end : {line: 0, column: 0}});
        }

        //Verificar si la variable ya existe en el entorno
        if (this.existsInCurrentScope(nombre)) {
            throw new Errors(`The variable ${nombre} is already defined in this scope`, {end : {line: 0, column: 0}});
        }

        if (Array.isArray(valor)) {
            // Si es un array, se crea un nuevo Literal almacenando una copia del array
            this.valores[nombre] = new Literal({ value: [...valor], type: tipo });
        } else {
            // Para otros tipos de datos, se almacena directamente
            this.valores[nombre] = new Literal({ value: valor, type: tipo });
        }
    }

    /**
     * @param {string} nombre
     * @returns {Literal}
     */
    getVariable(nombre) {
        const valorActual = this.valores[nombre];
        if (valorActual !== undefined) return valorActual;

        if (!valorActual && this.padre) {
            return this.padre.getVariable(nombre);
        }

        throw new Errors(`Variable ${nombre} not defined`, {end : {line: 0, column: 0}});
    }

    /**
     * @param {string} nombre
     * @param {any} valor
     */
    assignVariable(nombre, valor) {
        const variable = this.valores[nombre];

        if (variable) {
            this.valores[nombre].value = valor;
            return;
        }

        if (this.padre) {
            this.padre.assignVariable(nombre, valor);
            return;
        }

        throw new Errors(`Variable ${nombre} not defined`, {end : {line: 0, column: 0}});
    }

    /**
     * @param {string} tipo
     * @param {string} nombre
     * @param {any} valor
     */
    setOrUpdateVariable(tipo, nombre, valor) {
        if (this.valores.hasOwnProperty(nombre)) {
            console.log(`Actualizando variable ${nombre} con valor: ${valor}`);
            if (this.valores[nombre] instanceof Literal) {
                this.valores[nombre].value = valor;
            } else {
                this.valores[nombre] = new Literal({ value: valor, type: tipo });
            }
        } else {
            console.log(`Guardando nueva variable ${nombre} con valor: ${valor}`);
            this.setVariable(tipo, nombre, valor);
        }
    }

    existsInCurrentScope(nombre) {
        console.log(Object.keys(this.valores));
        return this.valores.hasOwnProperty(nombre);
    }
}