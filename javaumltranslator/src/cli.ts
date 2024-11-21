#!/usr/bin/env node

import { program } from 'commander';
import { readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { UmlToJavaTranslator } from './umltojavatranslator';

program
    .version('1.0.0')
    .description('JavaUMLTranslator')
    .requiredOption(
        '-o, --out <output>',
        'Output, file if output is plantuml, dir otherwise'
    )
    .argument(
        '<input>',
        "Plantuml diagram or java root folder(s) (separated by ',')"
    )
    .action((input, options) => {
        console.log(`Parsing file or directory, ${input} into ${options.out}`);

        umlToJava(input, options.out);
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

    console.log(files);

    const writes = files.map(
        async (file) =>
            new Promise(async (res, rej) => {
                const filepath = join(outputDir, file.name + '.java');
                await writeFile(filepath, file.body)
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
