import { HomePageComponent, NotFoundPageComponent } from '@/pages';
import { type Routes } from '@angular/router';

/**
 * The application's routes. The home page sits at the root path and every page that follows gets a path of its own
 * here, so the outlet in `RootComponent` has one place to read from. The home page is the first thing a visitor
 * sees, so it is part of the initial bundle rather than loaded on demand. The `**` wildcard route closes the array
 * and renders the not found page for a URL none of the others match; the router picks the first match, so it has to
 * stay last.
 */
export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
    },
    {
        path: '**',
        component: NotFoundPageComponent,
    },
];
