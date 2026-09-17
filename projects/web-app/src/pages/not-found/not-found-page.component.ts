import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The page a visitor lands on for a URL no route matches, reached through the wildcard route's redirect in
 * `app.routes.ts`, which carries the path it could not match as the `path` query parameter. `provideRouter` in
 * `app.config.ts` binds that parameter onto `path` here, so the page can say which URL the visitor tried to open,
 * and offers a way back to one that does: the home page. The shell around it, the top bar and the region this
 * renders in, belongs to `RootComponent`, so the page contributes its own content alone.
 */
@Component({
    selector: 'app-not-found-page',
    templateUrl: './not-found-page.component.html',
    styleUrl: './not-found-page.component.scss',
    imports: [TranslatePipe, RouterLink],
})
export class NotFoundPageComponent {
    /** The path the visitor tried to open. Unset when the page is reached directly, rather than through a redirect. */
    public readonly path = input<string>();
}
