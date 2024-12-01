import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';

import { routes } from './app.routes';
import {provideHttpClient} from '@angular/common/http';

const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(SocketIoModule.forRoot(config))
  ]
};
