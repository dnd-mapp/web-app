import type { Provider } from '@angular/core';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { BundledTranslationsLoader } from '../loaders/bundled-translations.loader';
import type { AreaTexts } from '../locales/area-texts';
import { sourceLocale } from '../locales/source-locale';
import { mergeAreaTexts } from './merge-area-texts';

/**
 * The providers that give the application its texts: the translation service reading the dictionaries the areas
 * ship between them, with the source locale both in use and as the fallback, since it is the one locale that is
 * complete. `appConfig` bootstraps with these and `setupTestEnvironment` provides the same ones, so a spec asserts
 * on the text a user reads rather than on a key.
 *
 * The merge happens here rather than in any one area's dictionary, because which areas an application uses is the
 * application's to know: an area that reached for the merged result would have to import from whoever uses it, and
 * the dependency between the areas runs the other way. See docs/workspace.md.
 *
 * @param texts The texts of every area the application shows, in order of precedence. A later area's text wins, so
 *   the application passes its own last and overrides a library's default by naming the same key.
 * @returns The providers to hand to `bootstrapApplication` or to the TestBed.
 */
export function provideLocalization(...texts: AreaTexts[]): Provider[] {
    const translations = mergeAreaTexts(texts);

    return provideTranslateService({
        lang: sourceLocale,
        fallbackLang: sourceLocale,
        loader: provideTranslateLoader(() => new BundledTranslationsLoader(translations)),
    });
}
