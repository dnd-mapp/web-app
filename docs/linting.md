# Formatting and linting

Every tool below reads its config from the repository and has a VS Code extension that reads the same config and flags violations while you type. The `pre-commit` hook runs the tools over the staged files and CI runs them over the whole repository; see [Commit hooks](commits.md#commit-hooks) and [run-checks](ci.md#run-checks).

## Formatting

```bash
pnpm run format
```

Prettier formats the file types allowed in [.prettierignore](../.prettierignore), with [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) sorting imports and dropping unused ones as part of the same pass. Prettier reads [.editorconfig](../.editorconfig) for indentation, line width and line endings, so [.prettierrc.json](../.prettierrc.json) only carries what EditorConfig cannot express. Run `pnpm run format-check` to report violations without rewriting anything.

## Markdown

```bash
pnpm run lint-md
```

[markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) checks every Markdown file that Git tracks against the rules in [.markdownlint-cli2.yaml](../.markdownlint-cli2.yaml). The config turns off the line length rule, because paragraphs are written as one line. It pins the heading, list and table styles used throughout the repository: ATX headings, dashes for lists, and tables with leading and trailing pipes lined up across rows. Run `pnpm run lint-md --fix` to apply every fix the rules can make on their own; the rest it reports for you to resolve by hand. A nested [.github/.markdownlint-cli2.yaml](../.github/.markdownlint-cli2.yaml) merges into it for the Markdown under `.github`, where it turns off the first-line-heading rule: the [pull request template](commits.md#pull-requests) starts at a second-level heading, since GitHub renders the title above it. The [vscode-markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) extension reads the same config.

## Styles

```bash
pnpm run lint-styles
```

[Stylelint](https://stylelint.io) checks every SCSS file under `projects/` against [.stylelintrc.json](../.stylelintrc.json), which extends [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss) and the error variant of [stylelint-config-clean-order](https://github.com/kutsan/stylelint-config-clean-order). The first parses the files as SCSS and brings Stylelint's standard rules plus the SCSS-specific ones: kebab-case selectors, variables and mixins, no duplicate or unknown properties, no invalid hex colors, and so on. The second enforces ordering: `@use` and Sass variables come before custom properties and mixin calls, and declarations come before nested rules and media queries. Properties are grouped by concern (positioning, layout, box model, typography, and so on), with an empty line between groups once a block holds more than five declarations. Run `pnpm run lint-styles --fix` to reorder in place. The [vscode-stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) extension reads the same config.

## TypeScript and JavaScript

```bash
pnpm run lint-ts
```

```bash
pnpm run lint-js
```

[ESLint](https://eslint.org) checks the TypeScript files and component templates under `projects/` through the `lint` target that [angular-eslint](https://github.com/angular-eslint/angular-eslint)'s builder provides in [angular.json](../angular.json), and the JavaScript files in the workspace through `lint-js`, which runs ESLint over `**/*.{js,mjs,cjs}` directly. The lint target stays scoped to `projects/web-app`, so a second project brings its own. `lint-js` spans the whole workspace, since tooling files sit at the root and in the projects; ESLint's ignore list keeps build output and caches out. Run `pnpm run lint-ts --fix` or `pnpm run lint-js --fix` to apply every fix the rules can make on their own. The [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension reads the same config.

ESLint picks the config for a file by walking up from the file's directory, so two configs share the work. [eslint.config.js](../eslint.config.js) at the root holds the global rules. TypeScript files, including the `.mts` and `.cts` variants, get ESLint's recommended rules and the type-checked `recommended` and `stylistic` sets from [typescript-eslint](https://typescript-eslint.io). JavaScript files (`.js`, `.mjs` and `.cjs`) get ESLint's recommended rules without type information, plus the Node.js globals from [globals](https://github.com/sindresorhus/globals). They are tooling config such as `eslint.config.js` itself, which runs in Node.js; [tsconfig.tooling.json](../tsconfig.tooling.json) type-checks them in the editor, while the lint stays untyped because the type-aware rules target TypeScript source.

[projects/web-app/eslint.config.js](../projects/web-app/eslint.config.js) spreads the root config and adds the Angular rules. Its TypeScript block extends angular-eslint's recommended rules and pins the selectors to the `prefix` in angular.json: a component selector is an `app-` element in kebab-case, or an `app` attribute in camelCase when the component dresses up a native element, as `button[appButton]` does; a directive selector is an `app` attribute in camelCase. Templates, whether in an `.html` file or inline in a component, get angular-eslint's recommended template rules plus its accessibility rules, and the `i18n` rule that [Marking text](localization.md#marking-text) describes, cut down to a check for literal text and turned off by two overrides for the inline templates of specs and for `index.html`. This is the layout `ng generate application` and `ng generate library` produce, since the `angular-eslint` collection is listed first under `schematicCollections` in angular.json; the other generators fall through to the Angular defaults.

The type-checked rules read types through the TypeScript project service, so a file has to be included by one of the tsconfig files described under [TypeScript configuration](workspace.md#typescript-configuration). Their `include` patterns only match `.ts`, so an `.mts` or `.cts` file goes under `files`, the way [vitest.config.ts](../projects/web-app/vitest.config.ts) does. The lint target's patterns match `.ts` and `.html` as well, like the angular-eslint schematic generates them, so such a file also needs a pattern there. The hook lints it either way, and a file no tsconfig includes fails with a parsing error instead of being skipped.
