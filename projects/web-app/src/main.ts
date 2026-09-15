import { appConfig, RootComponent } from '@/core';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(RootComponent, appConfig).catch((error) => console.error(error));
