// @ts-check
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ESLint picks the config for a file by walking up from the file's directory, so this one holds the rules that
// apply everywhere and covers every file without a closer config. projects/web-app/eslint.config.js spreads it
// and adds the Angular rules.
export default defineConfig([
    globalIgnores(['.angular/', '.vitest/', 'coverage/', 'dist/']),
    {
        files: ['**/*.{ts,mts,cts}'],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        // Typed linting resolves each file's types through the tsconfig that includes it.
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // JavaScript files are tooling config such as this one, which runs in Node.js. tsconfig.tooling.json gives
        // editors types for them; the lint stays untyped, since the type-aware rules target TypeScript source.
        // Without this block ESLint matches them with zero rules and reports nothing. nodeBuiltin holds the Node.js
        // globals shared by ES modules and CommonJS, so an ES module that uses require or __dirname is still reported.
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
]);
