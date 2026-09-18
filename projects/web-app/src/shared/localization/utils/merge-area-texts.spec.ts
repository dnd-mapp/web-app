import { mergeAreaTexts } from './merge-area-texts';

describe('mergeAreaTexts', () => {
    it('should keep the texts of every area', () => {
        const merged = mergeAreaTexts([
            { 'en-US': { logInButton: { label: 'Log in' } } },
            { 'en-US': { homePage: { title: 'Your companion' } } },
        ]);

        expect(merged).toEqual({
            'en-US': {
                homePage: { title: 'Your companion' },
                logInButton: { label: 'Log in' },
            },
        });
    });

    it('should let a later area override an earlier one', () => {
        const merged = mergeAreaTexts([
            { 'en-US': { logInButton: { label: 'Log in' } } },
            { 'en-US': { logInButton: { label: 'Sign in' } } },
        ]);

        expect(merged).toEqual({ 'en-US': { logInButton: { label: 'Sign in' } } });
    });

    it('should leave the keys an override does not name alone', () => {
        const merged = mergeAreaTexts([
            { 'en-US': { logInButton: { hint: 'Takes you to the log in page', label: 'Log in' } } },
            { 'en-US': { logInButton: { label: 'Sign in' } } },
        ]);

        expect(merged).toEqual({
            'en-US': { logInButton: { hint: 'Takes you to the log in page', label: 'Sign in' } },
        });
    });

    it('should keep a locale only one area ships', () => {
        const merged = mergeAreaTexts([
            { 'en-US': { logInButton: { label: 'Log in' } } },
            { 'nl-NL': { logInButton: { label: 'Inloggen' } } },
        ]);

        expect(merged).toEqual({
            'en-US': { logInButton: { label: 'Log in' } },
            'nl-NL': { logInButton: { label: 'Inloggen' } },
        });
    });

    it('should leave the areas it merged untouched', () => {
        const library = { 'en-US': { logInButton: { label: 'Log in' } } };

        mergeAreaTexts([library, { 'en-US': { logInButton: { label: 'Sign in' } } }]);

        expect(library).toEqual({ 'en-US': { logInButton: { label: 'Log in' } } });
    });

    it('should hold no texts when no area ships any', () => {
        expect(mergeAreaTexts([])).toEqual({});
    });
});
