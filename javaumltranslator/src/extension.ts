import * as vscode from 'vscode';
import { JavaFile, UmlToJavaTranslator } from './umltojavatranslator';
import { JavaToUmlTranslator } from './utils/javatoumltranslator';
import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('javaumltranslator is now active!');

    const umlToJavaTranslator: UmlToJavaTranslator = new UmlToJavaTranslator();
    const javaToUmlTranslator: JavaToUmlTranslator = new JavaToUmlTranslator();

    const umlToJavaDisposable = vscode.commands.registerCommand(
        'javaumltranslator.umlToJava',
        async (uri: vscode.Uri) => {
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

export function deactivate() {
    console.log('Java To UML Translator deactivated');
}
