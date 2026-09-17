# Localization

## Setup

The application's texts live in dictionaries rather than in its templates, resolved at runtime by [ngx-translate](https://ngx-translate.org), which sits in its own `ngx-translate` catalog in [pnpm-workspace.yaml](../pnpm-workspace.yaml). `en-US` is the source locale, the one every text is written in, and the only one the application ships; [index.html](../projects/web-app/src/index.html) declares it on its `html` element.

Everything the setup needs lives in the `localization` area under [shared/localization](../projects/web-app/src/shared/localization), behind the `@/localization` alias. `provideLocalization` is its one export: it provides the translation service with the source locale in use and as the fallback, reading through `BundledTranslationsLoader`. [app.config.ts](../projects/web-app/src/core/config/app.config.ts) bootstraps the application with those providers and `setupTestEnvironment` provides the same ones, so a spec asserts on the words a user reads rather than on the keys behind them.

The dictionaries are bundled with the application instead of fetched. The loader hands the service the dictionary it already holds, so a locale is there the moment the service asks for it: no request, no loading state, and nothing for a page or a spec to wait on. This is what keeps a component harness able to read a label the instant the component renders.

## Marking text

```html
<button appButton>{{ 'logInButton.label' | translate }}</button>
```

Every text a user reads comes from a key. A template resolves one with the `translate` pipe from `TranslatePipe`, which the component lists in its `imports` like any other pipe, and an attribute a user reads takes the same pipe through a binding: `[title]="'mapCard.hint' | translate"`. Keys nest by the component the text belongs to, in camelCase, followed by what the text is: `logInButton.label`, `homePage.title`. The dictionary in [en-US.ts](../projects/web-app/src/shared/localization/locales/en-US.ts) holds the texts under those same nested keys, in alphabetical order, so a component's texts sit together and a translator reads them in context.

Keys are strings, so nothing checks a misspelled one at compile time. A key the dictionary does not hold renders as the key itself, which is what a missing text looks like in the interface and in a failing spec.

The [`i18n` template rule](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/i18n.md) from angular-eslint stands in for the lint rule ngx-translate does not have, configured in [projects/web-app/eslint.config.js](../projects/web-app/eslint.config.js). Its checks for a custom ID and a description are turned off, since those belong to Angular's own i18n; what is left reports a template holding literal text or a literal attribute value, which is the one thing that has to be caught. Its message and its autofix still name the `i18n` attribute, which this repository no longer uses: the fix is always a key in the dictionary, never the attribute the rule offers to insert. An attribute that carries a value from a component's API rather than a text, such as the button's `variant`, is named under `ignoreAttributes`, which adds to the rule's own list of attributes that hold no text; without it the value would have to be bound to get past the rule. Two overrides turn the rule off where it does not apply: the inline templates of the host components in specs, whose text is fixture data, and `index.html`, which holds no Angular template. [TypeScript and JavaScript](linting.md#typescript-and-javascript) describes how the configs fit together.

## Adding a locale

A second locale takes three steps, all of them inside the `localization` area: a dictionary beside `en-US.ts` holding the same keys, an entry for it in [translations.ts](../projects/web-app/src/shared/localization/locales/translations.ts), and a way for a visitor to pick one, which calls `TranslateService.use` with the tag. Nothing outside that area knows how many locales there are. The source locale stays the fallback, so a key a translation has not reached yet falls back to its US English text rather than to the key.

Two things that do not change are worth naming. The build stays one bundle for every locale, since the dictionaries are data rather than compiled-in text, so the [Docker image](docker.md) and [nginx.conf](../.docker/nginx.conf) serve one directory as they do now. And the `lang` attribute in `index.html` is written for the source locale, so switching at runtime means setting it on the `html` element along with the service's locale.
