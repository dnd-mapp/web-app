import type { TranslationObject } from '@ngx-translate/core';

/**
 * The texts the application shows in US English, its source locale: the ones a translation into another locale
 * starts from. Keys nest by the component the text belongs to, so a component's texts sit together and a template
 * reads `{{ 'logInButton.label' | translate }}`. See docs/localization.md.
 */
export const enUS: TranslationObject = {
    logInButton: {
        label: 'Log in',
    },
    root: {
        title: 'root works!',
    },
    signUpButton: {
        label: 'Sign up',
    },
};
