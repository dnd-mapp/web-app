import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The page a visitor lands on, routed at the root path. It says what the application is for and what it does, and
 * is where everything a visitor starts from lands as it arrives: the campaigns they can open, the characters they
 * play, the tools they reach for. The application's name belongs to the top bar, which carries it on every page, so
 * the heading here says something the bar does not repeat. The shell around it, the top bar and the region this renders in, belongs to
 * `RootComponent`, so the page contributes its own content alone.
 */
@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    imports: [TranslatePipe],
})
export class HomePageComponent {}
