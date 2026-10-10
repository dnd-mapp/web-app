import javascript from '@dnd-mapp/config-eslint/javascript';
import typescript from '@dnd-mapp/config-eslint/typescript';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['.angular/', 'dist/', '.coverage/', '.vitest/', 'tsc-out/']),
    javascript,
    typescript,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Every class member states its access, so `public` API is a choice rather than a default.
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
        },
    },
    {
        files: ['src/**/*.ts'],
        extends: [angular.configs.tsRecommended],
        plugins: {
            '@angular-eslint/template': angular.templatePlugin,
        },
        processor: '@angular-eslint/template/extract-inline-html',
        rules: {
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
            // The classes follow the naming of the 2016 Angular style guide, such as `AppComponent`.
            '@angular-eslint/component-class-suffix': 'error',
            '@angular-eslint/directive-class-suffix': 'error',
        },
    },
    {
        files: ['src/**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    },
]);
