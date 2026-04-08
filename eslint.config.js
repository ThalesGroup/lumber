import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: [
            '**/out',
            '**/coverage',
            '**/dist',
            '**/*.d.ts',
            '**/jest.config.js'
        ]
    },
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
