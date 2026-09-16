// @ts-check
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.js';

// The complete config for this project: the root config's global rules plus the Angular rules, in the layout
// angular-eslint's application and library schematics generate.
export default defineConfig([
    ...rootConfig,
    {
        files: ['**/*.{ts,mts,cts}'],
        extends: [angular.configs.tsRecommended],
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
        files: ['**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    },
]);
