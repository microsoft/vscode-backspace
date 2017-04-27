
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('jrieken.backspaceLeft', backspace));
}


function backspace(editor: vscode.TextEditor) {

    const { document, selections, options: { tabSize } } = editor;

    if (typeof tabSize === 'number') {

        let hasNewSelections = false;
        const newSelections = selections.map(selection => {
            if (!selection.isEmpty) {
                return selection;
            }

            const { start } = selection; // since it's empty start is the same as 'active'
            if (start.character === 0) {
                return selection;
            }

            const line = document.lineAt(start);
            if (line.firstNonWhitespaceCharacterIndex < start.character) {
                return selection;
            }

            // check for n-space characters preceeding the caret
            let match = /^\t*((?: )+)$/.exec(line.text.substr(0, start.character));
            if (match) {
                hasNewSelections = true;
                let toRemove = (match[1].length % tabSize) || tabSize;
                return new vscode.Selection(start.with(void 0, start.character - toRemove), start);
            }

            return selection;
        });

        // set the new (expanded) selections and run 'deleteLeft'
        if (hasNewSelections) {
            editor.selections = newSelections;
        }
    }

    return vscode.commands.executeCommand('deleteLeft');
}
