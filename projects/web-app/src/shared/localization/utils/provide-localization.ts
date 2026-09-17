import type { Provider } from '@angular/core';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { BundledTranslationsLoader } from '../loaders/bundled-translations.loader';
import { sourceLocale } from '../locales/translations';

/**
 * The providers that give the application its texts: the translation service reading the bundled dictionaries, with
 * the source locale both in use and as the fallback, since it is the one locale that is complete. `appConfig`
 * bootstraps with these and `setupTestEnvironment` provides the same ones, so a spec asserts on the text a user
 * reads rather than on a key.
 *
 * @returns The providers to hand to `bootstrapApplication` or to the TestBed.
 */
export function provideLocalization(): Provider[] {
    return provideTranslateService({
        lang: sourceLocale,
        fallbackLang: sourceLocale,
        loader: provideTranslateLoader(BundledTranslationsLoader),
    });
}
