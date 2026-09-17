import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The application's name, written the one way it is written everywhere: the wordmark a bar or a page renders to say
 * which application a visitor is in. The name is a text like any other, so it comes from the dictionary rather than
 * from a template, and every place that shows it reads the same key instead of spelling it out again.
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
    imports: [RouterLink, TranslatePipe],
})
export class BrandComponent {}
