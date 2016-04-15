
import {ExtensionContext, TextDocument, Selection, Range, Position, commands, window} from 'vscode';

export function activate(context:ExtensionContext) {

    context.subscriptions.push(commands.registerCommand('jrieken.backspaceLeft', backspace));
}


function backspace() {

    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    const {document, selections, options} = editor;
    let hasNewSelections = false;

    const newSelections = selections.map(selection => {
        if (!selection.isEmpty) {
            return selection;
        }

        const {start} = selection; // since it's empty start is the same as 'active'
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
            let toRemove = (match[1].length % options.tabSize) || options.tabSize;
            return new Selection(start.with(void 0, start.character - toRemove), start);
        }
    });

    // set the new (expanded) selections and run 'deleteLeft'
    if (hasNewSelections) {
        editor.selections = newSelections;
    }

    return commands.executeCommand('deleteLeft');
}
