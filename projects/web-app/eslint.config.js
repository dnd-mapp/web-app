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
            // A component is either an element of its own, or an attribute that dresses up a native element the way
            // `button[appButton]` does; the attribute form follows the directive convention below.
            '@angular-eslint/component-selector': [
                'error',
                [
                    {
                        type: 'element',
                        prefix: 'app',
                        style: 'kebab-case',
                    },
                    {
                        type: 'attribute',
                        prefix: 'app',
                        style: 'camelCase',
                    },
                ],
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
        rules: {
            // Every text a user reads comes from a message key rather than the template. ngx-translate ships no
            // lint rule of its own, so this one stands in for it: the checks below turn off everything that is
            // specific to Angular's own i18n, and what is left reports a template that holds literal text, which
            // is the one thing that has to be caught. Its message and its autofix still name the `i18n`
            // attribute, which this repository no longer uses: the fix is a key in the dictionary, never the
            // attribute the rule offers to insert. See docs/localization.md.
            '@angular-eslint/template/i18n': [
                'error',
                {
                    checkDuplicateId: false,
                    checkId: false,
                    requireDescription: false,
                },
            ],
        },
    },
    {
        // The inline template processor above hands each inline template to the template rules as a virtual .html
        // file under the path of the file that holds it. For a spec, that is the template of its host component,
        // whose text is fixture data nobody translates.
        files: ['**/*.spec.ts/*.html'],
        rules: {
            '@angular-eslint/template/i18n': 'off',
        },
    },
    {
        // index.html is the host document the application bootstraps into, not a template: nothing in it passes
        // through Angular's i18n, so its text is written for the source locale.
        files: ['**/src/index.html'],
        rules: {
            '@angular-eslint/template/i18n': 'off',
        },
    },
]);
