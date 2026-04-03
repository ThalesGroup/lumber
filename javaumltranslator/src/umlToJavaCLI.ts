#!/usr/bin/env node

import { program } from 'commander';
import { readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { UmlToJavaTranslator } from './umltojavatranslator';

program
    .version('1.0.0')
    .description('UML To Java Translator')
    .requiredOption(
        '-o, --outdir <outputDirectory>',
        'Output directory in which java files will be placed'
    )
    .argument('<diagram>', 'Plantuml diagram file')
    .action((diagram, options) => {
        console.log(
            `Parsing file or directory, ${diagram} into ${options.outdir}`
        );

        umlToJava(diagram, options.outdir);
    });

async function umlToJava(diagramFile: string, outputDir: string) {
    const info = await stat(outputDir).catch((err) => {
        console.error(`Could not Stats output "${outputDir}": ${err}`);
        return null;
    });
    if (!info) return;

    if (!info.isDirectory) {
        console.error(`Output must be a directory, "${outputDir}" isn't`);
        return;
    }

    console.log('Diagram read attempt');
    const diagram = await readFile(diagramFile, 'utf-8').catch((err) => {
        console.error(`Error while reading "${diagramFile}": `, err);
        return null;
    });
    if (!diagram) return;
    console.log('Diagram read succesfully');

    const files = new UmlToJavaTranslator().toJava(diagram);

    const writes = files.map(
        async (file) =>
            new Promise((res, rej) => {
                const filepath = join(outputDir, file.name + '.java');
                writeFile(filepath, file.body)
                    .then(() => {
                        console.log(`Generated file ${filepath}`);
                        res(true);
                    })
                    .catch(rej);
            })
    );

    try {
        await Promise.all(writes);
    } catch (err) {
        console.error('Could not write all files :', err);
    }

    console.log('Successfully translated UML to Java');
}

program.parse(process.argv);
