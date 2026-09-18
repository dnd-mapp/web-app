import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The application's name, written the one way it is written everywhere: the wordmark a bar or a page renders to say
 * which application a visitor is in. The name comes in as an input rather than from a dictionary. It is the
 * application's own data and reads the same in every locale, so there is nothing to translate, and a library that
 * declared a key for it would leave an application that never filled it in rendering that key on screen; a required
 * input fails the build instead. See docs/localization.md.
 *
 * The mark is the way back as well. It is a link to the root path, which is where a visitor lands and where every
 * application that renders this mark starts, so the destination is fixed here rather than passed in by whoever
 * renders it. A component that renders the mark provides the router, the way `app.config.ts` does for the
 * application and a spec does with `provideRouter`.
 */
@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrl: './brand.component.scss',
    imports: [RouterLink],
})
export class BrandComponent {
    /** The name to write the wordmark as, which whoever renders the mark supplies. */
    public readonly name = input.required<string>();
}
