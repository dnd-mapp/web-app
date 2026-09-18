import type { AreaTexts } from '@dnd-mapp/web-ui/localization';
import { enUS } from './en-US';

/**
 * The texts these components own, which travel with them: an application that renders the button to log in passes
 * these to `provideLocalization` and gets its label, rather than writing the word again and rendering the key when
 * it forgets. A second locale is a dictionary beside `en-US.ts` and an entry here.
 */
export const authComponentTexts: AreaTexts = {
    'en-US': enUS,
};
