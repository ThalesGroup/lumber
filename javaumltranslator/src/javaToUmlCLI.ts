#!/usr/bin/env node

import { program } from 'commander';
import { lstat, opendir, readFile, writeFile } from 'fs/promises';
import { parse } from 'java-parser';
import { join } from 'path';
import { exit } from 'process';
import { UMLTranslator } from './UMLTranslator';
import { JavaToDatamodelVisitor } from './utils/JavaToDatamodelVisitor';

program
    .version('1.0.0')
    .description('Java To UML Translator')
    .requiredOption(
        '-o, --outfile <outputFile>',
        'The name of the output file diagram'
    )
    .argument(
        '<javaDir>',
        'Root directory in which the parsing will start, it can also be a java file'
    )
    .action(async (javaDir, options) => {
        if (!options.outfile.includes('.')) {
            options.outfile += '.puml';
        }

        const myVisitor = new JavaToDatamodelVisitor();

        const dirs = [javaDir];
        const files = [];

        console.log('Searching java files...');
        while (dirs.length) {
            const currentDir = dirs.shift();

            try {
                const stats = await lstat(currentDir);

                if (stats.isDirectory()) {
                    const dir = await opendir(currentDir);
                    for await (const dirent of dir)
                        dirs.push(join(currentDir, dirent.name));
                } else if (stats.isFile()) {
                    if (currentDir.endsWith('.java')) {
                        files.push(currentDir);
                        console.log('- Found : ' + currentDir);
                    }
                } else {
                    console.warn(`Unsupported file type : ${currentDir}`);
                }
            } catch (error) {
                console.error(error);
            }
        }

        console.log('Starting parsing files...');
        for (const file of files) {
            myVisitor.clear();
            console.log(`- Parsing : ${file}...`);
            const cst = parse(await readFile(file, { encoding: 'utf-8' }));
            myVisitor.visit(cst);
        }

        const datamodel = myVisitor.datamodel;

        const umlDiagram = new UMLTranslator().translateAll(datamodel);

        writeFile(options.outfile, umlDiagram)
            .then(() => {
                console.log(
                    'Successfully generated plantuml diagram into ' +
                        options.outfile
                );
            })
            .catch((err) => {
                console.error(err);
                exit(1);
            });
    });

program.parse(process.argv);
