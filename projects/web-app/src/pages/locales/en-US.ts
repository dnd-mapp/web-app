import type { TranslationObject } from '@ngx-translate/core';

/**
 * The texts the pages show in US English, the source locale: the ones a translation into another locale starts
 * from. Keys nest by the page the text belongs to, so a page's texts sit together and its template reads
 * `{{ 'homePage.title' | translate }}`. See docs/localization.md.
 */
export const enUS: TranslationObject = {
    homePage: {
        intro: 'Manage characters, roll dice, and build maps and lore.',
        title: 'Your companion for tabletop D&D',
    },
    notFoundPage: {
        attemptedPath: 'You tried to open {{ path }}.',
        homeLinkLabel: 'Go to the home page',
        intro: 'The page you were looking for does not exist or has moved.',
        title: 'Page not found',
    },
};
