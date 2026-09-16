// @ts-check
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.js';

// angular-eslint reads the processor from the template plugin's optional processors map, so its type allows
// undefined, which exactOptionalPropertyTypes rejects for the processor property. Failing here beats silently
// linting no inline templates.
if (!angular.processInlineTemplates) {
    throw new Error('angular-eslint did not export the inline template processor.');
}

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
