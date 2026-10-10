import { appConfig, RootComponent } from '@/core';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(RootComponent, appConfig).catch((error: unknown) => console.error(error));
