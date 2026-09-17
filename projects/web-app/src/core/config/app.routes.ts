import { HomePageComponent, NotFoundPageComponent } from '@/pages';
import { type Routes } from '@angular/router';

/**
 * The application's routes. The home page sits at the root path and every page that follows gets a path of its own
 * here, so the outlet in `RootComponent` has one place to read from. The home page is the first thing a visitor
 * sees, so it is part of the initial bundle rather than loaded on demand.
 *
 * The not found page has a route of its own too, `not-found`, rather than sitting directly on the wildcard, so a
 * visitor can land on it from a link as any other page. The `**` wildcard route catches a URL none of the others
 * match and has to stay last, since the router picks the first match; it redirects there with the path it could not
 * match carried as the `path` query parameter, which `withComponentInputBinding` in `app.config.ts` binds onto the
 * page so it can say what the visitor tried to open.
 */
export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
    },
    {
        path: 'not-found',
        component: NotFoundPageComponent,
    },
    {
        path: '**',
        redirectTo: ({ url }) =>
            `/not-found?path=${encodeURIComponent('/' + url.map((segment) => segment.path).join('/'))}`,
    },
];
