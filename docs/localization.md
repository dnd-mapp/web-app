# Localization

## Setup

The application's texts live in dictionaries rather than in its templates, resolved at runtime by [ngx-translate](https://ngx-translate.org), which sits in its own `ngx-translate` catalog in [pnpm-workspace.yaml](../pnpm-workspace.yaml). `en-US` is the source locale, the one every text is written in, and the only one the application ships; [index.html](../projects/web-app/src/index.html) declares it on its `html` element.

The setup itself lives in the `localization` area under [shared/localization](../projects/web-app/src/shared/localization), behind the `@dnd-mapp/web-ui/localization` alias. It exports two things: `provideLocalization`, and the `AreaTexts` type an area's texts take. `provideLocalization` merges the texts it is handed, then provides the translation service with the source locale in use and as the fallback, reading the merged dictionaries through `BundledTranslationsLoader`. [app.config.ts](../projects/web-app/src/core/config/app.config.ts) bootstraps the application with those providers, naming every area it shows words from. A spec hands `setupTestEnvironment` the same kind of list, so it asserts on the words a user reads rather than on the keys behind them.

The dictionaries are bundled with the application instead of fetched. The loader hands the service the dictionary it already holds, so a locale is there the moment the service asks for it: no request, no loading state, and nothing for a page or a spec to wait on. This is what keeps a component harness able to read a label the instant the component renders.

## Marking text

```html
<button appButton>{{ 'logInButton.label' | translate }}</button>
```

Every text a user reads comes from a key. A template resolves one with the `translate` pipe from `TranslatePipe`, which the component lists in its `imports` like any other pipe, and an attribute a user reads takes the same pipe through a binding: `[title]="'mapCard.hint' | translate"`. Keys nest by the component the text belongs to, in camelCase, followed by what the text is: `logInButton.label`, `homePage.title`. The dictionary of the area that owns the text holds it under those same nested keys, in alphabetical order, so a component's texts sit together and a translator reads them in context.

Keys are strings, so nothing checks a misspelled one at compile time. A key no dictionary holds renders as the key itself, which is what a missing text looks like in the interface and in a failing spec.

The [`i18n` template rule](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/i18n.md) from angular-eslint stands in for the lint rule ngx-translate does not have, configured in [projects/web-app/eslint.config.js](../projects/web-app/eslint.config.js). Its checks for a custom ID and a description are turned off, since those belong to Angular's own i18n; what is left reports a template holding literal text or a literal attribute value, which is the one thing that has to be caught. Its message and its autofix still name the `i18n` attribute, which this repository no longer uses: the fix is always a key in the dictionary, never the attribute the rule offers to insert. An attribute that carries a value from a component's API rather than a text, such as the button's `variant`, is named under `ignoreAttributes`, which adds to the rule's own list of attributes that hold no text; without it the value would have to be bound to get past the rule. Two overrides turn the rule off where it does not apply: the inline templates of the host components in specs, whose text is fixture data, and `index.html`, which holds no Angular template. [TypeScript and JavaScript](linting.md#typescript-and-javascript) describes how the configs fit together.

## Where a text lives

An area that shows text of its own ships that text, in a `locales/` folder beside the components that read it. Two files make it up, the way [auth/components/locales](../projects/web-app/src/auth/components/locales) does: `en-US.ts` holds the dictionary for one locale, and `texts.ts` names every locale the area ships as an `AreaTexts`, which is a dictionary per locale under the tag `index.html` puts on its `html` element. The area's barrel exports that `AreaTexts` alongside its components, so `@dnd-mapp/web-auth/components` hands out `authComponentTexts` next to `LogInButtonComponent`.

Texts travel with their code because `auth` and `shared` are written to be lifted out as packages; see [Application layout](workspace.md#application-layout). A package that shipped components without their words would leave every application that renders the button to log in writing `Log in` again. An application that forgot would render `logInButton.label` on screen, since ngx-translate falls back to the key. This application's own texts are an area's too: the pages ship theirs from [pages/locales](../projects/web-app/src/pages/locales) as `pageTexts`.

```typescript
provideLocalization(authComponentTexts, pageTexts);
```

The application names every area it shows words from, and `provideLocalization` merges them in that order. Later wins, key by key down to the texts, so an application overrides a library's default by naming that one key and keeps every other key the library put beside it. This application passes its own texts last for that reason, even though nothing overrides anything today.

The merge happens where the application provides its texts rather than inside any one dictionary, because which areas an application uses is the application's to know. An area that reached for the merged result would have to import from whoever uses it, and the dependency between the areas runs the other way. `setupTestEnvironment` takes its texts as an argument for the same reason: it ships inside `web-ui`, so a spec names the areas its component under test shows words from, and a component that shows none names nothing.

Not everything a user reads is a text. The application's name is the clearest case: `BrandComponent` writes out the wordmark, but the name is the application's own data and reads the same in every locale, so it comes in as a required input that [ShellTopBarComponent](../projects/web-app/src/core/shell-top-bar/shell-top-bar.component.ts) supplies. A key would have been the wrong tool twice over, since a library cannot fill it in and an application that never did would render the key rather than fail the build. A value a consumer has to supply belongs in the component's API; the dictionary is for words that a translator could rewrite.

## Adding a locale

A second locale takes three steps. Every area that ships texts gets a dictionary beside its `en-US.ts` holding the same keys, and an entry for it in that area's `texts.ts`. Then a visitor needs a way to pick one, which calls `TranslateService.use` with the tag. Nothing outside an area decides which locales it ships, and `provideLocalization` merges whatever the areas hand it, so an area that is ahead of the others simply adds the locale and the ones still behind fall back. The source locale stays the fallback, so a key a translation has not reached yet falls back to its US English text rather than to the key.

Two things that do not change are worth naming. The build stays one bundle for every locale, since the dictionaries are data rather than compiled-in text, so the [Docker image](docker.md) and [nginx.conf](../.docker/nginx.conf) serve one directory as they do now. And the `lang` attribute in `index.html` is written for the source locale, so switching at runtime means setting it on the `html` element along with the service's locale.
