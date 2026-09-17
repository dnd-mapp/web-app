import type { Language, TranslationObject } from '@ngx-translate/core';
import { enUS } from './en-US';

/** The locale the templates are written against, and the only one the application ships today. */
export const sourceLocale: Language = 'en-US';

/**
 * Every locale the application ships, under the tag `index.html` puts on its `html` element. A second locale is a
 * dictionary beside `en-US.ts` and an entry here; nothing outside this file knows how many there are.
 */
export const translations: Record<Language, TranslationObject> = {
    'en-US': enUS,
};
