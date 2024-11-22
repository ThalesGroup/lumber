#!/usr/bin/env node

import { program } from 'commander';
import { readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { UmlToJavaTranslator } from './umltojavatranslator';

program
    .version('1.0.0')
    .description('Java To UML Translator')
    .requiredOption(
        '-o, --outfile <outputFile>',
        'The name of the output file diagram'
    )
    .argument('<javaDir>', 'Root directory in which the parsing will start')
    .action((javaDir, options) => {
        console.error(`Not implemented yet.`);
    });

program.parse(process.argv);
