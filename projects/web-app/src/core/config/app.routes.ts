import { HomePageComponent } from '@/pages';
import { type Routes } from '@angular/router';

/**
 * The application's routes. The home page sits at the root path and every page that follows gets a path of its own
 * here, so the outlet in `RootComponent` has one place to read from. The home page is the first thing a visitor
 * sees, so it is part of the initial bundle rather than loaded on demand.
 */
export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
    },
];
