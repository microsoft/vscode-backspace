import * as vscode from 'vscode'; 

export function activate() { 
    
    vscode.commands.registerCommand('backspace++', ()   => { 
        
        let editor = vscode.window.getActiveTextEditor();
        if (!editor) {
            return;
        }

        let document = editor.getTextDocument();
        let tabSize = editor.getOptions().tabSize;
        
        let ranges: vscode.Range[] = [];
        
        for (let selection of editor.getSelections()) {
            if (!selection.isEmpty()) {
                // remove selected things
                ranges.push(selection);
                
            } else if (selection.start.character === 1) {
                // remove line, unless first
                if (selection.start.line > 1) {
                    ranges.push(new vscode.Range(new vscode.Position(selection.start.line - 1, Number.MAX_VALUE), selection.start));
                }
            } else {
                let value = document.getTextOnLine(selection.start.line);
                let len = selection.start.character - 1;
                if (/^ +$/.test(value.substr(0, len))) {
                    let toRemove = (len % tabSize) || 4;
                    ranges.push(new vscode.Range(selection.start.line, selection.start.character - toRemove, selection.start.line, selection.start.character));

                } else {
                    ranges.push(new vscode.Range(selection.start.line, selection.start.character - 1, selection.start.line, selection.start.character));
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
