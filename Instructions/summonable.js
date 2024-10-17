import { InterpreterVisitor } from "../JS_Analyzer_parts/interpreter.js";
import { Entorno } from "../environments/environments.js";

export class Summonable {


    aridad() {
        throw new Error('Not implemented');
    }

    /**
     * @param interprete {InterpreterVisitor}
     * @param args {any[]}
     */
    invocar(interprete, args) {
        throw new Error('Not implemented');
    }

}