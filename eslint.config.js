import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
    {
        ignores: ['**/out', '**/dist', '**/*.d.ts']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            globals: {
                module: 'writable',
                require: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off'
        }
    },
    eslintConfigPrettier
]);
