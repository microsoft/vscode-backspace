import * as vscode from 'vscode';

export function activate() {

    vscode.commands.registerCommand('backspace++', () => {

        let editor = vscode.window.getActiveTextEditor();
        if (!editor) {
            return;
        }

        let document = editor.getTextDocument();
        let tabSize = editor.getOptions().tabSize;

        let ranges: vscode.Range[] = [];

        for (let selection of editor.getSelections()) {
            let deleteRange: vscode.Range;
            if (!selection.isEmpty()) {
                // remove selected things
                deleteRange = selection;

            } else if (selection.start.character === 1) {
                // remove line, unless first
                if (selection.start.line > 1) {
                    deleteRange = new vscode.Range(new vscode.Position(selection.start.line - 1, Number.MAX_VALUE), selection.start);
                }
            } else {
                let value = document.getTextOnLine(selection.start.line);
                let len = selection.start.character - 1;
                let match = /^\t*((?: )*)$/.exec(value.substr(0, len));
                if (match) {
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
        editor.setSelections(newSelections);
    });
}
