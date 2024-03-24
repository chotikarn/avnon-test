import { ApplicationConfig } from '@angular/core';
import { provideRouter, withDebugTracing, withRouterConfig } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideRouter(appRoutes,
      withDebugTracing(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }))
  ],
};
