// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JavaFile, UmlToJavaTranslator } from './umltojavatranslator';
import { JavaToUmlTranslator } from './utils/javatoumltranslator';
import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('javaumltranslator is now active!!!');

    const umlToJavaTranslator: UmlToJavaTranslator = new UmlToJavaTranslator();
    const javaToUmlTranslator: JavaToUmlTranslator = new JavaToUmlTranslator();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const umlToJavaDisposable = vscode.commands.registerCommand(
        'javaumltranslator.umlToJava',
        async (uri: vscode.Uri) => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            let umlCode;
            if (uri) {
                // Context menu
                umlCode = readFileSync(uri.fsPath, 'utf-8');
            } else if (vscode.window.activeTextEditor !== undefined) {
                // Command palette
                uri = vscode.window.activeTextEditor.document.uri;
                umlCode = vscode.window.activeTextEditor.document.getText();
            } else {
                vscode.window.showErrorMessage('Aucun fichier trouvé...');
                return;
            }

            const javaFiles: JavaFile[] = umlToJavaTranslator.toJava(umlCode);

            const destinationFolder = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Destination folder'
            });

            let javaFile: JavaFile;
            if (destinationFolder && destinationFolder.length) {
                const folder = destinationFolder[0];
                const wsPath = folder.fsPath;
                for (javaFile of javaFiles) {
                    const filePath = vscode.Uri.file(
                        wsPath + '/' + javaFile.name + '.java'
                    );
                    console.log('generate : ' + filePath);
                    writeFile(
                        wsPath + '/' + javaFile.name + '.java',
                        javaFile.body
                    );
                }

                vscode.window.showInformationMessage(
                    `Successfully generated ${javaFiles.length} file${
                        javaFiles.length > 1 ? 's' : ''
                    } into ${vscode.workspace.asRelativePath(
                        folder
                    )} directory !`
                );
            }
        }
    );

    const javaToUmlDisposable = vscode.commands.registerCommand(
        'javaumltranslator.javaToUml',
        async (uri: vscode.Uri) => {
            let sourceFolders: vscode.Uri[] | undefined;

            if (uri) {
                sourceFolders = [uri];
            } else {
                sourceFolders = await vscode.window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectMany: true,
                    title: 'Select input folders'
                });
            }

            try {
                if (!sourceFolders) return;

                const datamodel = await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        cancellable: false,
                        title: 'Reading files'
                    },
                    (progress) => {
                        const datamodel = javaToUmlTranslator.toDatamodel(
                            sourceFolders?.map((uri) => uri.fsPath) || [],
                            progress
                        );

                        return datamodel;
                    }
                );

                const umlStr = javaToUmlTranslator.toUml(datamodel);

                const document = await vscode.workspace.openTextDocument({
                    content: umlStr,
                    language: 'plantuml'
                });
                await vscode.window.showTextDocument(document);
                vscode.window.showInformationMessage(
                    'Successfully translated Java to plantUML'
                );
            } catch (error) {
                if (error instanceof Error)
                    vscode.window.showErrorMessage(error.message);
                else if (typeof error == 'string')
                    vscode.window.showErrorMessage(error);
                else
                    vscode.window.showErrorMessage('Unable to open a document');
            }
        }
    );

    context.subscriptions.push(umlToJavaDisposable);
    console.log('UmlToJava subscribed');

    context.subscriptions.push(javaToUmlDisposable);
    console.log('JavaToUml subscribed');
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Java To UML Translator deactivated');
}
