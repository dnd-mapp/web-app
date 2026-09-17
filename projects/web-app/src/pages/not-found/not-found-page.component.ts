import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The page a visitor lands on for a URL no route matches, wired to the wildcard route in `app.routes.ts`. It says
 * the page does not exist and offers a way back to one that does: the home page. The shell around it, the top bar
 * and the region this renders in, belongs to `RootComponent`, so the page contributes its own content alone.
 */
@Component({
    selector: 'app-not-found-page',
    templateUrl: './not-found-page.component.html',
    styleUrl: './not-found-page.component.scss',
    imports: [TranslatePipe, RouterLink],
})
export class NotFoundPageComponent {}
