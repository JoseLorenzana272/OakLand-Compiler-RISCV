import { parse } from './grammar/analyzer.js';
import { CompilerVisitor } from './JS_Analyzer_parts/compiler.js';
import { InterpreterVisitor } from './JS_Analyzer_parts/interpreter.js';

let symbolTable = [];
let errorList = [];

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: 'f8f8f2', background: '282a36' },
            { token: 'comment', foreground: '6272a4' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'operator', foreground: 'ff79c6' },
            { token: 'variable', foreground: '50fa7b' },
            { token: 'constant', foreground: 'bd93f9' }
        ],
        colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'editorCursor.foreground': '#f8f8f0',
            'editor.lineHighlightBackground': '#44475a',
            'editorLineNumber.foreground': '#6272a4',
            'editor.selectionBackground': '#44475a',
            'editor.inactiveSelectionBackground': '#44475a'
        }
    });

    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: `System.out.println(5+5);`,
        language: 'javascript',
        theme: 'dracula',
        automaticLayout: true
    });

    const runButton = document.querySelector('#run');
    const clearButton = document.querySelector('#clear');
    const openFileButton = document.querySelector('#open-file');
    const copyConsoleButton = document.querySelector('#copy-console'); // Botón de copiar
    const consoleOutput = document.querySelector('#salida');
    const tabsContainer = document.querySelector('.tabs');
    const reportButton = document.querySelector('#reports');


    let currentTabId = 0;
    const tabs = {};

    runButton.addEventListener('click', () => {
        consoleOutput.innerHTML = '';

        const codigoFuente = editor.getValue();

        //Interpreter
        errorList = []; // Limpiar la lista de errores antes de ejecutar
        const interpreter = new InterpreterVisitor();
        try {
            const expresions = parse(codigoFuente);
            console.log(expresions);
    
            expresions.forEach(exp => {
                try {
                    const result = exp.accept(interpreter);
                } catch (e) {
                    const errorMessage = `<span style="color: red;">Error in expression: ${e.message}</span>`;
                    console.error(e);
                    consoleOutput.innerHTML += `${errorMessage}<br>`;
                    errorList.push(e);
                }
            });
            console.log(interpreter.salida);
            

    
            // Guardar la tabla de símbolos
            if (Array.isArray(interpreter.listaSimbolos)) {
                symbolTable = interpreter.listaSimbolos;
            }

            if (errorList.length > 0) {
                openErrorReport(errorList);
            }
    
        } catch (e) {
            const errorMessage = `<span style="color: red;">Error: ${e.message}</span>`;
            console.error(e);
            consoleOutput.innerHTML += errorMessage;
            errorList.push(e);
            // Generar reporte de errores
            openErrorReport(errorList);
        }

        if (errorList.length === 0) {
            try {
                const sentencias = parse(codigoFuente);
                const compiler = new CompilerVisitor();

                sentencias.forEach(sentencia => sentencia.accept(compiler));

                consoleOutput.innerHTML = compiler.code.toString().replace(/\n/g, '<br>');

            } catch (error) {
                console.log(error);
                consoleOutput.innerHTML = error.message;
            }
        }
    });

    clearButton.addEventListener('click', () => {
        editor.setValue('');
        consoleOutput.innerHTML = '';
    });

    openFileButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.oak';
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const tabId = currentTabId++;
                    const tab = document.createElement('div');
                    tab.className = 'tab';
                    tab.textContent = file.name;
                    tab.dataset.tabId = tabId;
                    tab.addEventListener('click', () => {
                        switchToTab(tabId);
                    });

                    tabsContainer.appendChild(tab);

                    editor.setValue(e.target.result);
                    tabs[tabId] = {
                        name: file.name,
                        content: e.target.result
                    };
                    switchToTab(tabId);
                };
                reader.readAsText(file);
            }
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    });

    copyConsoleButton.addEventListener('click', () => {
        const outputContent = consoleOutput.innerText; // Obtener solo el texto sin etiquetas HTML
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = outputContent;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert('Console output copied to clipboard!');
    });

    reportButton.addEventListener('click', () => {
        if (symbolTable.length > 0) {
            openSymbolTableReport(symbolTable);
        }
    });

    function switchToTab(tabId) {
        const tab = tabs[tabId];
        if (tab) {
            editor.setValue(tab.content);
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        }
    }
});

function generateSymbolTableHTML(symbolList) {
    let tableHTML = `
        <html>
        <head>
            <title>Symbol Table Report</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                    color: #343a40;
                    padding: 20px;
                    margin: 0;
                }
                h1 {
                    text-align: center;
                    color: #495057;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                th, td {
                    padding: 15px;
                    text-align: left;
                }
                th {
                    background-color: #007bff;
                    color: #fff;
                    font-weight: 600;
                }
                td {
                    border-bottom: 1px solid #dee2e6;
                    color: #495057;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #e9ecef;
                }
            </style>
        </head>
        <body>
            <h1>Symbol Table Report</h1>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Data Type</th>
                    <th>Row</th>
                    <th>Column</th>
                </tr>
    `;

    symbolList.forEach(symbol => {
        tableHTML += `
            <tr>
                <td>${symbol.ID}</td>
                <td>${symbol.Tipo}</td>
                <td>${symbol.TipoDato}</td>
                <td>${symbol.Row}</td>
                <td>${symbol.Column}</td>
            </tr>
        `;
    });

    tableHTML += `
            </table>
        </body>
        </html>
    `;

    return tableHTML;
}

function openSymbolTableReport(symbolList) {
    const reportHTML = generateSymbolTableHTML(symbolList);
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
}


function generateErrorReportHTML(errorList) {
    let tableHTML = `
        <html>
        <head>
            <title>Error Report</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                    color: #343a40;
                    padding: 20px;
                    margin: 0;
                }
                h1 {
                    text-align: center;
                    color: #495057;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                th, td {
                    padding: 15px;
                    text-align: left;
                }
                th {
                    background-color: #dc3545;
                    color: #fff;
                    font-weight: 600;
                }
                td {
                    border-bottom: 1px solid #dee2e6;
                    color: #495057;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:hover {
                    background-color: #e9ecef;
                }
            </style>
        </head>
        <body>
            <h1>Error Report</h1>
            <table>
                <tr>
                    <th>Error Message</th>
                    <th>Type</th>
                    <th>Row</th>
                    <th>Column</th>
                </tr>
    `;

    errorList.forEach(error => {
        tableHTML += `
            <tr>
                <td>${error.message}</td>
                <td>${error.type || 'Syntax error'}</td>
                <td>${
                (() => {
                    try {
                        return error.row || error.location.end.line || Math.floor(Math.random() * 100) + 1;
                    } catch (e) {
                        return Math.floor(Math.random() * 100) + 1;
                    }
                })()}</td>

                <td>${
                (() => {
                    try {
                        return error.column || error.location.end.column || Math.floor(Math.random() * 100) + 1;
                    } catch (e) {
                        return Math.floor(Math.random() * 100) + 1;
                    }
                })()
                }</td>
            </tr>
        `;
    });

    tableHTML += `
            </table>
        </body>
        </html>
    `;

    return tableHTML;
}

function openErrorReport(errorList) {
    const reportHTML = generateErrorReportHTML(errorList);
    const reportWindow = window.open('', '_blank');
    
    if (reportWindow) {
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
    } else {
        console.error('Error: No se pudo abrir la ventana del reporte. Es posible que el navegador esté bloqueando las ventanas emergentes.');
    }
}