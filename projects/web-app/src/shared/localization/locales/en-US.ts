import type { TranslationObject } from '@ngx-translate/core';

/**
 * The texts the application shows in US English, its source locale: the ones a translation into another locale
 * starts from. Keys nest by the component the text belongs to, so a component's texts sit together and a template
 * reads `{{ 'root.title' | translate }}`. See docs/localization.md.
 */
export const enUS: TranslationObject = {
    root: {
        title: 'root works!',
    },
};
