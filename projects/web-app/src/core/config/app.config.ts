import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * The providers `main.ts` bootstraps the application with: the router over the application's routes, and the
 * listeners that report uncaught errors and unhandled rejections through Angular's error handler.
 */
export const appConfig: ApplicationConfig = {
    providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
