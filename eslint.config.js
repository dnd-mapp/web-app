// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['.angular/', '.vitest/', 'coverage/', 'dist/']),
    {
        files: ['**/*.{ts,mts,cts}'],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            angular.configs.tsRecommended,
        ],
        // Typed linting resolves each file's types through the tsconfig that includes it.
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'app',
                    style: 'kebab-case',
                },
            ],
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'app',
                    style: 'camelCase',
                },
            ],
        },
    },
    {
        // JavaScript files are tooling config such as this one, which runs in Node.js and which no tsconfig includes,
        // so they get the untyped recommended rules. Without this block ESLint matches them with zero rules and
        // reports nothing. nodeBuiltin holds the Node.js globals shared by ES modules and CommonJS, so an ES module
        // that uses require or __dirname is still reported.
        files: ['**/*.{js,mjs,cjs}'],
        extends: [eslint.configs.recommended],
        languageOptions: {
            globals: globals.nodeBuiltin,
        },
    },
    {
        // The commonjs source type that .cjs files get by default supplies require, module and exports, but not
        // __dirname and __filename; the full Node.js set does.
        files: ['**/*.cjs'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ['**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    },
]);
