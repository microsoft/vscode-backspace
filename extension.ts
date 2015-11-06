
import {ExtensionContext, TextDocument, Selection, Range, Position, commands, window} from 'vscode';

export function activate(context:ExtensionContext) {

    context.subscriptions.push(commands.registerCommand('jrieken.backspaceLeft', backspace));
}

function backspace() {

    let editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    let {document, options} = editor;
    let ranges: Range[] = [];

    for (let selection of editor.selections) {
        
        let deleteRange = backspaceOne(selection, document, options.tabSize);
        
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

    editor.edit(edit => {
        for (let range of ranges) {
            edit.delete(range);
        }
    });
}

export function backspaceOne(selection: Selection, document: TextDocument, tabSize: number): Range {
    
    let {isEmpty, start} = selection;

    if (!isEmpty) {
        // remove selected things
        return selection;
    }
    
    if (start.character === 0) {
        let prevLine = start.line - 1;
        if (prevLine < 0) {
            // already at first line
            return;
        }
        // delete line separator
        let end = document.lineAt(prevLine).range.end;
        return new Range(start, end);
    }
    
    let line = document.lineAt(start);
    let toRemove = 1;
    
    // check for n-space characters
    if (line.firstNonWhitespaceCharacterIndex >= start.character) {
        let match = /^\t*((?: )+)$/.exec(line.text.substr(0, selection.start.character));
        if (match) {
            // we have matched n-spaces and what go back to a happy
            toRemove = (match[1].length % tabSize) || tabSize;
        }
    }

    return new Range(new Position(start.line, start.character - toRemove), start);
}
