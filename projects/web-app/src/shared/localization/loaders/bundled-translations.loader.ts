import { TranslateLoader, type Language, type TranslationObject } from '@ngx-translate/core';
import { of, type Observable } from 'rxjs';
import { translations } from '../locales/translations';

/**
 * Hands the translation service the dictionary for a locale. The dictionaries are bundled with the application
 * rather than fetched, so a locale is there the moment the service asks for it: no request, no loading state, and
 * nothing for a spec or a page to wait on. A locale the application does not ship resolves to no texts at all,
 * which the service then reports through its missing translation handler.
 */
export class BundledTranslationsLoader extends TranslateLoader {
    /**
     * Reads the dictionary for a locale.
     *
     * @param locale The locale tag the service asks for.
     * @returns The texts of that locale, or none when the application does not ship it.
     */
    public getTranslation(locale: Language): Observable<TranslationObject> {
        return of(translations[locale] ?? {});
    }
}
