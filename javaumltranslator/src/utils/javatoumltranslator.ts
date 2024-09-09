import { parse } from 'java-parser';
import { JavaToDatamodelVisitor } from './JavaToDatamodelVisitor';
import { UMLTranslator } from '../UMLTranslator';
import { UMLStructure } from '../datamodel';
import { lstat, opendir, readFile } from 'fs/promises';
import path = require('path');
import * as vscode from 'vscode';

export class JavaToUmlTranslator {
    public async translate(
        fromUri: string[],
        progress?: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>
    ) {
        const datamodel = await this.toDatamodel(fromUri, progress);

        return this.toUml(datamodel);
    }

    public async toDatamodel(
        fromUri: string[],
        progress?: vscode.Progress<{
            message?: string | undefined;
            increment?: number | undefined;
        }>
    ) {
        const allFiles = [];

        while (fromUri.length) {
            const currentUri = fromUri.pop();

            if (!currentUri) continue;

            try {
                const stats = await lstat(currentUri);

                if (stats.isDirectory()) {
                    const dir = await opendir(currentUri);
                    for await (const dirent of dir)
                        fromUri.push(path.join(currentUri, dirent.name));
                } else if (stats.isFile()) {
                    if (currentUri.endsWith('.java')) allFiles.push(currentUri);
                } else {
                    console.warn(`Unsupported file type : ${currentUri}`);
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (!allFiles.length)
            vscode.window.showInformationMessage('0 java files found');

        const myVisitor = new JavaToDatamodelVisitor();

        const incrementValue = (1 / allFiles.length) * 100;
        let currentIncrement = 0;

        for (const fileUri of allFiles) {
            if (progress) {
                currentIncrement += incrementValue;
                const reportData = {
                    increment: 0,
                    message: vscode.workspace.asRelativePath(fileUri)
                };

                if (currentIncrement >= 1) {
                    reportData.increment = Math.floor(currentIncrement);
                    currentIncrement =
                        currentIncrement - Math.floor(currentIncrement);
                }

                progress.report(reportData);
            }
            myVisitor.clearPackage();
            const cst = parse(await readFile(fileUri, { encoding: 'utf-8' }));
            myVisitor.visit(cst);
        }

        return myVisitor.datamodel;
    }

    public toUml(datamodel: UMLStructure): string {
        const translator = new UMLTranslator();

        return translator.translateAll(datamodel);
    }
}
