import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideLocalization } from '@dnd-mapp/web-ui/localization';
import { routes } from './app.routes';

/**
 * The providers `main.ts` bootstraps the application with: the router over the application's routes, the texts the
 * interface is written in, and the listeners that report uncaught errors and unhandled rejections through Angular's
 * error handler. `withComponentInputBinding` binds a route's path and query parameters onto a routed component's
 * inputs of the same name, which is how the not found page reads the path a visitor tried to open.
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withComponentInputBinding()),
        provideLocalization(),
    ],
};
