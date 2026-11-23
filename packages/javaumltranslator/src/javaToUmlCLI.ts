#!/usr/bin/env node

import { JavaParser } from '@lumber/java-engine';
import { UMLGenerator } from '@lumber/uml-engine';
import { program } from 'commander';
import { lstat, opendir, writeFile } from 'fs/promises';
import { join } from 'path';
import { exit } from 'process';

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
    .action(async (javaDir: string, options) => {
        if (!options.outfile.includes('.')) {
            options.outfile += '.puml';
        }

        const dirs = [javaDir];
        const files = [];

        console.log('Searching java files...');
        while (dirs.length) {
            const currentDir = dirs.shift()!;

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

        const datamodel = await new JavaParser().parse(files);

        const umlDiagram = new UMLGenerator().translateAll(datamodel);

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
