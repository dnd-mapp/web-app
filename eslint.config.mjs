// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        name: 'dnd-mapp/ignores',
        ignores: ['.angular/', '.vitest/', 'coverage/', 'dist/'],
    },
    {
        name: 'dnd-mapp/typescript',
        files: ['**/*.ts', '**/*.mts', '**/*.cts'],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            angular.configs.tsRecommended,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        processor: angular.processInlineTemplates,
        rules: {
            // Naming conventions, mirroring `prefix` and `addTypeToClassName` in angular.json.
            '@angular-eslint/component-class-suffix': 'error',
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
            '@angular-eslint/directive-class-suffix': 'error',
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
            '@angular-eslint/pipe-prefix': ['error', { prefixes: ['app'] }],
            '@angular-eslint/relative-url-prefix': 'error',

            // Signals correctness: these catch reads that silently never track.
            '@angular-eslint/computed-must-return': 'error',
            '@angular-eslint/no-uncalled-signals': 'error',
            '@angular-eslint/prefer-signals': 'error',
            '@angular-eslint/reactive-context-must-read-signal': 'error',

            '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
            '@angular-eslint/use-component-selector': 'error',
        },
    },
    {
        // `eslint.config.mjs` and friends are outside every `tsconfig.json`, so they cannot be type-checked.
        name: 'dnd-mapp/javascript',
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        extends: [eslint.configs.recommended],
        languageOptions: { sourceType: 'module' },
    },
    {
        name: 'dnd-mapp/templates',
        // `index.html` is served to the browser as-is rather than compiled as an Angular
        // template, so template rules (and their fixers) do not apply to it.
        files: ['**/*.html'],
        ignores: ['projects/*/src/index.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
        rules: {
            '@angular-eslint/template/button-has-type': 'error',
            '@angular-eslint/template/no-duplicate-attributes': 'error',
            '@angular-eslint/template/no-empty-control-flow': 'error',
            '@angular-eslint/template/no-positive-tabindex': 'error',
            '@angular-eslint/template/prefer-at-else': 'error',
            '@angular-eslint/template/prefer-at-empty': 'error',
            '@angular-eslint/template/prefer-contextual-for-variables': 'error',
            '@angular-eslint/template/prefer-self-closing-tags': 'error',
            '@angular-eslint/template/require-switch-default': 'error',
        },
    },
);
