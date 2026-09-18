import type { Language, TranslationObject } from '@ngx-translate/core';

/**
 * The texts one area owns: a dictionary per locale, under the tag `index.html` puts on its `html` element. An area
 * that shows text of its own ships one of these from its barrel, so the texts travel with the code that reads them
 * and a package carries its own words rather than leaving every application to write them again. The application
 * hands the ones it uses to `provideLocalization`, which merges them. See docs/localization.md.
 */
export type AreaTexts = Record<Language, TranslationObject>;
