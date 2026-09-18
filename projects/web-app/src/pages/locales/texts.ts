import type { AreaTexts } from '@dnd-mapp/web-ui/localization';
import { enUS } from './en-US';

/**
 * The texts the pages own. These are this application's own words rather than a library's, so `appConfig` passes
 * them to `provideLocalization` last, where they override a default an area it uses shipped. A second locale is a
 * dictionary beside `en-US.ts` and an entry here.
 */
export const pageTexts: AreaTexts = {
    'en-US': enUS,
};
