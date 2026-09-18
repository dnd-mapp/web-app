import type { StrictTranslation, TranslationObject } from '@ngx-translate/core';
import type { AreaTexts } from '../locales/area-texts';

/**
 * Tells a group of nested keys apart from a text. Keys nest by the component they belong to, so a dictionary holds
 * both: `logInButton` is a group and `logInButton.label` is a text.
 *
 * @param value The value a key holds.
 * @returns Whether the value is a group of keys rather than a text.
 */
function isGroup(value: StrictTranslation): value is TranslationObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Lays one dictionary over another, key by key, down to the texts. Going all the way down is what lets an override
 * name the one key it replaces: an application that rewords `logInButton.label` keeps every other key the library
 * put under `logInButton` rather than replacing the group whole.
 *
 * @param under The dictionary being covered.
 * @param over The dictionary laid over it, whose texts win.
 * @returns The two dictionaries as one.
 */
function layer(under: TranslationObject, over: TranslationObject): TranslationObject {
    const merged: TranslationObject = { ...under };

    for (const [key, text] of Object.entries(over)) {
        const covered = merged[key];
        merged[key] = isGroup(covered) && isGroup(text) ? layer(covered, text) : text;
    }

    return merged;
}

/**
 * Merges the texts of several areas into the dictionaries the loader hands out, one per locale. Order is
 * precedence: a later area's text wins over an earlier one's for the same key, so an application that passes its own
 * texts last fills in a key a library left open and overrides one it disagrees with, without the library ever
 * knowing. An area that ships a locale the others do not simply adds it.
 *
 * @param texts The areas' texts, in the order they are laid over one another.
 * @returns Every locale the areas ship between them, each holding their merged texts.
 */
export function mergeAreaTexts(texts: AreaTexts[]): AreaTexts {
    const merged: AreaTexts = {};

    for (const areaTexts of texts) {
        for (const [locale, dictionary] of Object.entries(areaTexts)) {
            merged[locale] = layer(merged[locale] ?? {}, dictionary);
        }
    }

    return merged;
}
