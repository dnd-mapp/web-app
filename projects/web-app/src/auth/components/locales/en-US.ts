import type { TranslationObject } from '@ngx-translate/core';

/**
 * The texts these components show in US English, the source locale: the ones a translation into another locale
 * starts from. Keys nest by the component the text belongs to, so a component's texts sit together and its template
 * reads `{{ 'logInButton.label' | translate }}`. See docs/localization.md.
 */
export const enUS: TranslationObject = {
    logInButton: {
        label: 'Log in',
    },
    signUpButton: {
        label: 'Sign up',
    },
};
