# Manual Técnico - OakLand.js - José Daniel Lorenzana Medina

Este documento proporciona una visión técnica detallada del proyecto `OakLand.js`, que implementa un intérprete para un lenguaje de programación personalizado. Este intérprete fue construido usando **PEG** (Parser Expression Grammar) con la herramienta **Peggy.js**, que fue instalada utilizando **npx**.

Para instalar PEG y usarlo en tu proyecto, puedes utilizar `npx`. Asegúrate de tener `npx` instalado en tu sistema y luego ejecuta el siguiente comando en tu terminal:

```bash
npx peggy -o output.js grammar.pegjs
```

## 1. Introducción

Este intérprete está diseñado para manejar un lenguaje de programación personalizado. El intérprete gestiona variables, estructuras de control, funciones, arreglos, matrices y estructuras (structs), entre otras características del lenguaje. El desarrollo del intérprete sigue una arquitectura modular basada en el patrón **Visitor**.

## 2. Resumen de la Arquitectura

El intérprete sigue una arquitectura modular basada en el patrón de diseño **Visitor**, lo que permite la separación de la sintaxis del lenguaje (AST) y la semántica (implementada en los métodos del visitante).

### 2.1 Componentes Clave

1. **Clase InterpreterVisitor**: El núcleo del intérprete, que extiende BaseVisitor.
2. **Clase Entorno (Environment)**: Maneja los ámbitos de variables y las tablas de símbolos.
3. **Clase Literal**: Representa valores literales en el lenguaje.
4. **Varias clases de nodos**: Representan diferentes construcciones sintácticas (p. ej., ArithmeticOp, LogicalOp).
5. **Clases de excepciones**: Manejan el control de flujo (BreakException, ContinueException, ReturnException).

### 2.2 Patrones de Diseño Utilizados

1. **Patrón Visitor**: Para recorrer e interpretar el AST.
2. **Patrón Factory**: Implícito en la creación de diferentes tipos de nodos.

## 3. Análisis Detallado de Funcionalidades

### 3.1 Manejo de Variables

#### 3.1.1 Declaración (visitVariableDeclaration)
- Soporta múltiples tipos: int, float, bool, string, char, var.
- Implementa la comprobación de tipos.
- Maneja la asignación de valores predeterminados.
- Actualiza la tabla de símbolos.

#### 3.1.2 Asignación (visitVariableAssign)
- Soporta varios operadores de asignación (=, +=, -=).
- Realiza comprobación de tipos.
- Maneja operaciones aritméticas durante la asignación.

#### 3.1.3 Acceso (visitVariableValue)
- Recupera el valor de la variable en el ámbito actual.
- Lanza un error para variables no definidas.

### 3.2 Estructuras de Control

#### 3.2.1 Declaración If-Else (visitIfNode)
- Evalúa la condición.
- Ejecuta la rama correspondiente.

#### 3.2.2 Bucle While (visitWhileNode)
- Implementa la evaluación de la condición y la ejecución del cuerpo del bucle.
- Maneja las sentencias break y continue.

#### 3.2.3 Bucle For (visitForLoop)
- Soporta inicialización, condición e incremento/decremento.
- Crea un nuevo ámbito para las variables del bucle.

#### 3.2.4 Declaración Switch (visitSwitchNode)
- Soporta múltiples casos y un caso predeterminado.
- Implementa el comportamiento de caída entre casos.

#### 3.2.5 Bucle For-Each (visitForEach)
- Itera sobre arreglos u otras estructuras iterables.
- Crea un nuevo ámbito para cada iteración.

### 3.3 Funciones

#### 3.3.1 Declaración (visitFuncDeclaration)
- Almacena la función en el entorno actual.
- Soporta la especificación del tipo de retorno.

#### 3.3.2 Invocación (visitCallNode)
- Verifica la aridad (número de argumentos).
- Crea un nuevo ámbito para la ejecución de la función.
- Maneja los valores de retorno.

### 3.4 Arreglos y Matrices

#### 3.4.1 Declaración de Arreglo (visitVectorDeclaration)
- Soporta varios métodos de inicialización (basado en tamaño, en valores, en copia).
- Implementa la verificación de tipos para los elementos del arreglo.

#### 3.4.2 Declaración de Matriz (visitMatrixDeclaration)
- Soporta arreglos multidimensionales.
- Verifica la consistencia de dimensiones.
- Implementa la verificación de tipos para los elementos de la matriz.

#### 3.4.3 Acceso y Asignación
- Acceso a arreglos (visitArrayAccess).
- Acceso a matrices (visitMatrixAccess).
- Asignación de arreglos (visitVectorAssign).
- Asignación de matrices (visitMatrixAssign).

#### 3.4.4 Operaciones en Arreglos
- indexOf (visitIndexOf).
- join (visitJoin).
- length (visitLength).

### 3.5 Structs

#### 3.5.1 Declaración (visitStructNode)
- Define la estructura del struct.
- Almacena la definición del struct en la lista global de structs.

#### 3.5.2 Instanciación (visitStructInstance)
- Crea instancias de structs con valores predeterminados o proporcionados.
- Soporta la instanciación de structs anidados.

#### 3.5.3 Acceso y Asignación
- Acceso a miembros de structs (visitStructAccess).
- Asignación a miembros de structs (visitStructAssign).

### 3.6 Manejo de Errores y Excepciones

- Utiliza excepciones personalizadas para el control de flujo (BreakException, ContinueException, ReturnException).
- Implementa una verificación y reporte de errores exhaustivos.

### 3.7 Funciones Integradas

- Función print para salida.
- Potencial para otras funciones integradas (no mostradas explícitamente en el código proporcionado).

## 4. Sistema de Tipos

### 4.1 Tipos Soportados
- Tipos primitivos: int, float, bool, string, char.
- Tipos complejos: arreglos, matrices, structs.
- Tipado dinámico con 'var'.

### 4.2 Comprobación de Tipos
- Verificación estática de tipos durante la declaración y asignación de variables.
- Verificación dinámica de tipos para el tipo 'var'.
- Reglas de coerción (p. ej., int a float).

### 4.3 Compatibilidad de Tipos
- Comprobación estricta de tipos en la mayoría de las operaciones.
- Conversiones implícitas en ciertos contextos (p. ej., int a float en operaciones aritméticas).

## 5. Gestión de Memoria

### 5.1 Gestión de Ámbitos
- Utiliza la clase Entorno para gestionar los ámbitos anidados.
- Crea nuevos ámbitos para bloques, bucles y llamadas a funciones.

### 5.2 Ciclo de Vida de Variables
- Las variables están ligadas al ámbito en que se declaran.
- Maneja correctamente el enmascaramiento de variables.

### 5.3 Posibles Mejoras
- Implementación de recolección de basura.
- Optimización del uso de memoria para estructuras de datos grandes.

## 6. Técnicas de Optimización

### 6.1 Optimizaciones Actuales
- Recorrido eficiente del AST usando el patrón Visitor.
- Potencial plegado de constantes en operaciones aritméticas.

### 6.2 Posibles Optimizaciones Futuras
- Eliminación de subexpresiones comunes.
- Eliminación de código muerto.
- Desenrollado de bucles.
- Optimización de llamadas recursivas (tail call optimization).

## 7. Extensibilidad y Modularidad

### 7.1 Añadir Nuevas Funcionalidades al Lenguaje
- Implementar nuevos tipos de nodos en el AST.
- Añadir métodos correspondientes de visit en la clase InterpreterVisitor.

## 8. Pruebas y Depuración

### 8.1 Capacidades Actuales
- Reporte de errores con mensajes descriptivos.
- Registro en consola para propósitos de depuración.

### 8.2 Posibles Mejoras
- Implementación de una suite de pruebas integral.
- Adición de niveles de registro de depuración.
- Integración con herramientas de depuración.

## 9. Consideraciones de Rendimiento

### 9.1 Aspectos Actuales de Rendimiento
- La naturaleza recursiva del recorrido del AST puede impactar el rendimiento en estructuras profundamente anidadas.
- Consultas frecuentes al entorno para el acceso a variables.

### 9.2 Posibles Optimizaciones
- Caché de variables consultadas frecuentemente.
- Optimización de llamadas recursivas en ciertas construcciones del lenguaje.

## 10. Consideraciones de Seguridad

### 10.1 Medidas de Seguridad Actuales
- Verificación de tipos para prevenir vulnerabilidades relacionadas con tipos.
- Aislamiento de ámbitos para prevenir el acceso no autorizado a variables.

### 10.2 Posibles Mejoras de Seguridad
- Implementación de límites de recursos (p. ej., tiempo de ejecución, memoria utilizada).
- Validación más estricta de entradas del usuario.

## 11. Internacionalización

### 11.1 Capacidades Actuales
- Mensajes de error en inglés.

## 12. Documentación y Mantenimiento

### 12.1 Documentación Actual
- Comentarios de código claros y consistentes.
- Esquema de nombres intuitivo para funciones y variables.

## 13. Conclusión

El proyecto `OakLand.js` proporciona una base sólida para un intérprete de lenguaje personalizado. Con su diseño modular, manejo robusto de errores, y características extensibles, es una implementación adecuada para proyectos de lenguaje de programación. Sin embargo, existen áreas de mejora en cuanto a rendimiento, seguridad y extensibilidad.

[Documentación Detallada de Clases y Funcionamiento (Inglés) ->](./tecnico.md)
