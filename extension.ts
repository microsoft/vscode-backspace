import * as vscode from 'vscode';

export function activate() {

    vscode.commands.registerCommand('backspace++', () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let document = editor.document;
        let tabSize = editor.options.tabSize;
        let ranges: vscode.Range[] = [];

        for (let selection of editor.selections) {
            let deleteRange: vscode.Range;
            if (!selection.isEmpty) {
                // remove selected things
                deleteRange = selection;

            } else if (selection.start.character === 0) {
                // remove line, unless first
                if (selection.start.line > 0) {
                    
                    deleteRange = new vscode.Range(
                        document.lineAt(selection.start.line - 1).range.end,
                        selection.start);
                }
            } else {
                let line = document.lineAt(selection.start);
                if (line.firstNonWhitespaceCharacterIndex >= selection.start.character) {
                    let match = /^\t*((?: )*)$/.exec(line.text.substr(0, selection.start.character));
                    let toRemove = (match[1].length % tabSize) || tabSize;
                    deleteRange = new vscode.Range(selection.start.line, selection.start.character - toRemove, selection.start.line, selection.start.character);
                } else {
                    deleteRange = new vscode.Range(selection.start.line, selection.start.character - 1, selection.start.line, selection.start.character);
                }
            }

            if (deleteRange) {
                let skip = false;
                for (let range of ranges) {
                    if (range.contains(deleteRange.start) || range.contains(deleteRange.end)) {
                        skip = true;
                        break;
                    }
                }

                if (!skip) {
                    ranges.push(deleteRange);
                }
            }
        }

        // make edits
        let newSelections: vscode.Selection[] = [];
        editor.edit(edit => {
            for (let range of ranges) {
                newSelections.push(new vscode.Selection(range.start, range.start));
                edit.delete(range);
            }
        });

        // set selection
        editor.selections = newSelections;
    });
}
