import { parse } from './grammar/analyzer.js';
import { CompilerVisitor } from './JS_Analyzer_parts/compiler.js';

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

    // Crear el editor de Monaco con el tema Dracula
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: `// Type your code here...`,
        language: 'javascript',
        theme: 'dracula',  // Aplicar el tema
        automaticLayout: true
    });

    const runButton = document.querySelector('#run');
    const clearButton = document.querySelector('#clear');
    const openFileButton = document.querySelector('#open-file');
    const consoleOutput = document.querySelector('#salida');
    const tabsContainer = document.querySelector('.tabs');

    let currentTabId = 0;
    const tabs = {};

    runButton.addEventListener('click', () => {
        consoleOutput.innerHTML = ''; 

        const codigoFuente = editor.getValue();

        try {
            const sentencias = parse(codigoFuente);
            const interprete = new CompilerVisitor();

            sentencias.forEach(sentencia => sentencia.accept(interprete));

            consoleOutput.innerHTML = interprete.code.toString().replace(/\n/g, '<br>');

        } catch (error) {
            console.log(error);
            consoleOutput.innerHTML = error.message;
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
