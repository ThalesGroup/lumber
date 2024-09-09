import * as vscode from 'vscode';

import { umlToDatamodel } from './utils/umltodatamodel';
import { readFileSync } from 'fs';
import { ProtobufTranslator } from './ProtobufTranslator';

const TRANSLATOR = new ProtobufTranslator();

async function umlToProtobuf(previewToSide: boolean, umlStr: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dataModel = umlToDatamodel(umlStr);

    const protobufStr = TRANSLATOR.translateAll(dataModel);

    try {
        const newDocument = await vscode.workspace.openTextDocument({
            content: protobufStr,
            language: 'plantuml'
        });
        vscode.window.showTextDocument(
            newDocument,
            previewToSide ? vscode.ViewColumn.Beside : undefined
        );
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(
                'An error occured while displaying document... ' +
                    error.name +
                    ' :\n' +
                    error.message
            );
        } else if (error instanceof String) {
            vscode.window.showErrorMessage(
                'An error occured while displaying document...\n' + error
            );
        } else {
            vscode.window.showErrorMessage(
                'An error occured while displaying document...'
            );
            throw error;
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Protobuf / UML Translator is now active !!!');

    const umlToProtobufPreviewSideDisposable =
        vscode.commands.registerTextEditorCommand(
            'umltoprotobuf.previewToSide.umlToProtobuf',
            (textEditor: vscode.TextEditor) => {
                const umlStr = textEditor.document.getText();

                umlToProtobuf(true, umlStr);
            }
        );

    const umlToProtobufDisposable = vscode.commands.registerCommand(
        'umltoprotobuf.umlToProtobuf',
        (uri: vscode.Uri) => {
            let umlStr;

            if (uri) {
                // File explorer context menu && Editor context menu
                umlStr = readFileSync(uri.fsPath, 'utf-8');
            } else if (vscode.window.activeTextEditor !== undefined) {
                // Command palette
                uri = vscode.window.activeTextEditor.document.uri;
                umlStr = vscode.window.activeTextEditor.document.getText();
            } else {
                vscode.window.showErrorMessage('Aucun fichier trouvé...');
                return;
            }

            umlToProtobuf(false, umlStr);
        }
    );

    context.subscriptions.push(umlToProtobufPreviewSideDisposable);
    context.subscriptions.push(umlToProtobufDisposable);
}

export function deactivate() {
    console.log('Protobuf / UML Translator is now off...');
}
