{
  const createNode = (typeNode, props) => {
    const type = {
      'Literal': nodos.Literal,
      'Print': nodos.Print,
      'Arithmetic': nodos.Arithmetic,
      'Relational': nodos.Relational,
      'Grouping': nodos.Grouping,
      'Igualation': nodos.Igualation,
      'Logical': nodos.Logical,
      'Unario': nodos.Unario,
      'VariableDeclaration': nodos.VariableDeclaration,
      'VariableValue': nodos.VariableValue,
      'Block': nodos.Block,
      'OpSentence': nodos.OpSentence,
      'VariableAssign': nodos.VariableAssign,
      'TernaryOp': nodos.TernaryOp,
      'IfNode': nodos.IfNode,
      'WhileNode': nodos.WhileNode,
      'ForLoop': nodos.ForLoop,
      'IncrementDecrement': nodos.IncrementDecrement,
      'BreakNode': nodos.BreakNode,
      'ContinueNode': nodos.ContinueNode,
      'ReturnNode': nodos.ReturnNode,
      'SwitchNode': nodos.SwitchNode,
      'VectorDeclaration': nodos.VectorDeclaration,
      'CallNode': nodos.CallNode,
      'ArrayAccess': nodos.ArrayAccess,
      'IndexOf': nodos.IndexOf,
      'Join': nodos.Join,
      'Length': nodos.Length,
      'VectorAssign': nodos.VectorAssign,
      'FuncDeclaration': nodos.FuncDeclaration,
      'ForEach': nodos.ForEach,
    }

    const node = new type[typeNode](props);
    node.location = location();
    return node;
  }
}

Program = _ statements:Statements* _ { return statements; }

Statements = Statement

Statement =  _ vard:VariableDeclaration _ { return vard; }
            /_ fund:FunctionDeclaration _ { return fund; }
            /_ vecd:VectorDeclaration _ { return vecd; }
            /_ s:Sentence _ { return s; } 

/*---------------------Declaracion de variables----------------------*/
VariableDeclaration = type:(Types / "var") _ id:Id _ exp:("=" _ exp:Operations {return exp})? _ ";" 
                      { return createNode('VariableDeclaration', { type, id, value: exp || null }); }

VectorDeclaration 
  = type:(Id/Types) _ "[]" _ id:Id _
      "=" _ "{" _ values:VectorValues _ "}" _ ";"{ 
        return createNode('VectorDeclaration', { type, id, values, size: values.length }); 
      }
    / type:Types _ "[]" _ id:Id _ "=" _ "new" _ newType:Types _ "[" _ size:Operations _ "]" _ ";" { 
        if (type === newType || (type === 'float' && newType === 'int')) {
          return createNode('VectorDeclaration', { type, id, size });
        }
        if (size < 0) {
          throw new Error("Array size cannot be negative");
        }
        throw new Error("Type mismatch");
      }
    / type:Types _ "[]" _ id:Id _ "=" _ values:Id ";" { return createNode('VectorDeclaration', { type, id, values }); }

VectorValues = head:Operations tail:(_ "," _ Operations)* { return [head, ...tail.map(t => t[3])]; }

/*-----------------------------Matrices de 2 a n dimensiones-----------------------------*/


/*---------------------Funciones----------------------*/

FunctionDeclaration = type:((AType:Types _ "[]" { return AType+"[]" })/Id/Types/"void") _ id:Id _ "(" _ params:Parameters? _ ")" _ block:Block { return createNode('FuncDeclaration', { type, id, params: params || [], block }) }

// Aceptar tanto parámetros simples como arrays.
Parameters = type:(Id/Types) _ arrayDecl:ArrayDecl? _ id:Id _ "," _ params:Parameters { return [{ type: type + (arrayDecl || ""), id }, ...params]; }
           / type:(Id/Types) _ arrayDecl:ArrayDecl? _ id:Id { return [{ type: type + (arrayDecl || ""), id }]; }

// Declaración de arrays en parámetros de múltiples dimensiones
ArrayDecl = "[" _ "]" dims:("[" _ "]")* { return "[]".repeat(1 + dims.length); }

/*---------------------Structs----------------------*/


/*-------------------------------------------------------------------*/

Operations = Assignment

Assignment = id:Id _ op:("="/"+="/"-=") _ assi:Assignment{ return createNode('VariableAssign', {id, op, assi})}
            /id:Id "[" _ index:Operations _ "]" _ op:("=") _ assi:Assignment{ return createNode('VectorAssign', {id, index, op, assi})} 
            /TernaryOp

TernaryOp = condition:LogicalOperations _ "?" _ trueExp:TernaryOp _ ":" _ falseExp:TernaryOp { return createNode('TernaryOp', { condition, trueExp, falseExp }); }
          /LogicalOperations

/*---------------------Operaciones Logicas----------------------*/
LogicalOperations = And/Or

And = izq:Or expansion:(
  _ op:"&&" _ der:Or { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return createNode('Logical', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

Or = izq:Igualation expansion:(
  _ op:"||" _ der:Igualation { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return createNode('Logical', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}



/*--------------------------------------------------------------------*/
/*--------------------Operaciones Relacionales------------------------*/
Igualation = izq:RelationalOperations expansion:(
  _ op:("==" / "!=") _ der:RelationalOperations { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return createNode('Igualation', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

RelationalOperations = izq:ArithmeticOperations expansion:(
  _ op:("<=" / ">=" / "<" / ">" ) _ der:ArithmeticOperations { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return createNode('Relational', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}




/*--------------------Operaciones Arimeticas----------------------*/


ArithmeticOperations = Sum/Multiply/Modulus/DataType

Sum = izq:Multiply expansion:(
  _ op:("+" / "-") _ der:Multiply { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return createNode('Arithmetic', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Multiply = izq:Modulus expansion:(
  _ op:("*" / "/") _ der:Modulus { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, der } = operacionActual
        return createNode('Arithmetic', { op:tipo, izq: operacionAnterior, der })
      },
      izq
    )
}

Modulus = izq:Unary expansion:(
  _ op:"%" _ der:Unary { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, der } = operacionActual
        return createNode('Arithmetic', { op:tipo, izq: operacionAnterior, der })
      },
      izq
    )
}


/*---------------------- Print & Block ---------------------------*/
Sentence = p:Print { return p; }
          /b:Block { return b; }
          /i: If { return i; }
          /w: While { return w; }
          /f: ForLoop { return f; }
          /fe: ForEach { return fe; }
          /sw: Switch { return sw; }
          /br: Break { return br; }
          /c: Continue { return c; }
          /rt: Return { return rt; }
          /o:Operations _ ";" { return createNode('OpSentence', {o}) }

Break = "break" _ ";" { return createNode('BreakNode', {}); }

Continue = "continue" _ ";" { return createNode('ContinueNode', {}); }

Return = "return" _ exp:(Operations / ("["_ vecVal:VectorValues _ "]" { return vecVal }))? _ ";" { return createNode('ReturnNode', { exp }) }

Switch = "switch" _ "(" _ exp:Operations _ ")" _ "{" _ 
             cases:SwitchCase* 
             def:DefaultCase? 
             _ "}" { return createNode('SwitchNode', { exp, cases, def }) }

SwitchCase = _ "case" _ value:Operations _ ":" _ inst:Statements* _ { return { value, inst } }

DefaultCase = _ "default" _ ":" _ stmts:Sentence* { return { stmts } }

If = "if" _ "(" _ cond:Operations _ ")" _ stmtTrue:Sentence 
      stmtFalse:(
        _ "else" _ stmtFalse:Sentence { return stmtFalse } 
      )? { return createNode('IfNode', { cond, stmtTrue, stmtFalse }) }

While = "while" _ "(" _ cond:Operations _ ")" _ stmt:Sentence { return createNode('WhileNode', { cond, stmt }) }

ForLoop = "for" _ "("_ init:Statement _ cond:TernaryOp _ ";" _ inc:(IncrementDecrement/Assignment) _ ")" _ stmt:Sentence { return createNode('ForLoop', { init, cond, inc, stmt }) }

IncrementDecrement = id:Id _ op:("++" / "--") { return createNode('IncrementDecrement', { id, op }); }

ForEach = "for" _ "(" _ type:Types _ id:Id _ ":" _ id2:Id _ ")" _ stmt:Sentence { return createNode('ForEach', { type, id, id2, stmt }) }

Print = "System.out.println" _ "(" _ expressions:ExpressionPrint  _ ")" _ ";"  { return createNode('Print', {exp: expressions}); }

ExpressionPrint = head:Operations tail:(_ "," _ Operations)* { return [head, ...tail.map(t => t[3])]; }

Block = "{" _ stmt:Statements* _ "}" { return createNode('Block', { statements: stmt }); }

/*-------------------------------------------------------- */
Unary = "-" _ un:Unary { console.log("desgracia", un); return createNode('Unario', { op: '-', exp: un }); }
      / "!" _ un:Unary { return createNode('Unario', { op: '!', exp: un }); }
      /FCall

/*----------------------Llamadas a funciones----------------------*/

FCall = callee:(id:"typeof" { return createNode('VariableValue', { id }) }) " "* args:Arguments   { return createNode('CallNode', { callee, args: args}) }
/callee:DataType _ params:("(" args:Arguments? ")" { return args })* {
  return params.reduce(
    (callee, args) => {
      return createNode('CallNode', { callee, args: args || [] })
    },
    callee
  )
}

FCallStruct = callee:(id:Id  { return createNode('VariableValue', { id })})_ params:("(" args:Arguments? ")" { return args })* {
  
      return createNode('CallNode', { callee, args: args || [] })
}

Arguments = arg:Operations _ args:("," _ exp:Operations { return exp })* { return [arg, ...args] }

/*----------- Tipos de datos ---------------------------- */

DataType = "(" _ exp:Operations _ ")" {return createNode('Grouping', { exp })}
            
            /dato:Number { return dato; }
            /dato:Boolean { return dato; }
            /dato:String { return dato; }
            /dato:Char { return dato; }
            /dato:ArrayAccess { return dato; }
            /dato:IndexOf { return dato; }
            /dato:Join { return dato; }
            /dato:Length { return dato; }
            /Null
            /id:Id { return createNode('VariableValue', { id }) }

ArrayAccess = id:Id "[" _ index:Operations _ "]" { return createNode('ArrayAccess', { id, index }) }

IndexOf = id:Id "." "indexOf" "(" _ exp:Operations _ ")" { return createNode('IndexOf', { id, exp }) }

Join = id:Id "." "join" "()" { return createNode('Join', { id }) }

Length = id:Id "." "length" { return createNode('Length', { id }) }

Number = Float/Integer

Integer = [0-9]+ { return createNode('Literal', {value: parseInt(text()), type: 'int'}); }

Float = [0-9]+ "." [0-9]+ { return createNode('Literal', {value: parseFloat(text(), 10), type: 'float'}); }

Boolean = ("true"/"false") { return createNode('Literal', {value: text() === "true" ? true : false, type: 'bool'}); }

String = "\"" [^\"]* "\"" { return createNode('Literal', {value: text().slice(1,-1), type: 'string'}); }

Char = "'" [^']* "'" { return createNode('Literal', {value: text().slice(1,-1), type: 'char'}); }

Null = 'null' { return createNode('Literal', {value: null, type: 'null'}); }


/*----------------------------------------------------- */
/* ----------------- Comentarios ---------------------------- */
Comments = SimpleComment / MultilineComment

SimpleComment = "//" [^\r\n]*

MultilineComment = "/*" (!"*/" .)* "*/"
 /*-------------------------------------------------------------*/

Types = ("int" / "float" / "string" / "char" / "bool") { return text(); }

Id = !TypesChar [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

TypesChar = Types ![a-zA-Z0-9_]

_ = [ \t\n\r]* Comments* [ \t\n\r]*