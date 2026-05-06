/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Location } from '@angular/common';
import { EnvironmentProviders, inject, NgModule, provideAppInitializer, Provider } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { EXTENSION_DATA_LOADERS } from '@alfresco/aca-shared';
import { provideTranslations } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { provideEffects } from '@ngrx/effects';
import { first } from 'rxjs';

import { EditorComponent } from './components/editor/editor.component';
import { ViewerComponent } from './components/viewer/viewer.component';
import { onlyofficeAlfrescoExtensionLoader, setViewerExtensionConfig } from './configuration/onlyoffice-alfrsco-extension.config';
import { OnlyofficeAlfrescoExtensionEffects } from './effects/onlyoffice-alfresco-extension.effects';
import {
  disabledViewer,
  displayConvertAction,
  displayDownloadAsAction,
  displayEditAction,
  displayViewAction
} from './rules/onlyoffice-alfresco-extension.rules';

export function provideOnlyofficeAlfrescoExtension(): (Provider | EnvironmentProviders)[] {
  return [
    provideExtensionConfig(['onlyoffice-alfresco-extension.json']),
    provideExtensions({
      components: {
        'onlyoffice-alfresco-extension.editor.component': EditorComponent,
        'onlyoffice-alfresco-extension.viewer.component': ViewerComponent
      },
      evaluators: {
        'onlyoffice-alfresco-extension.rules.displayViewAction': displayViewAction,
        'onlyoffice-alfresco-extension.rules.displayEditAction': displayEditAction,
        'onlyoffice-alfresco-extension.rules.displayConvertAction': displayConvertAction,
        'onlyoffice-alfresco-extension.rules.displayDownloadAsAction': displayDownloadAsAction,
        'onlyoffice-alfresco-extension.rules.disabledViewer': disabledViewer
      }
    }),
    provideEffects([OnlyofficeAlfrescoExtensionEffects]),
    provideTranslations('onlyoffice-alfresco-extension', 'assets/onlyoffice-alfresco-extension'),
    {
      provide: EXTENSION_DATA_LOADERS,
      multi: true,
      useValue: onlyofficeAlfrescoExtensionLoader
    },
    provideAppInitializer(() => {
      const location = inject(Location);
      const extensionService = inject(ExtensionService);
      const router = inject(Router);

      router.events.pipe(first((event) => event instanceof NavigationEnd)).subscribe(() => {
        setViewerExtensionConfig(extensionService);
      });

      if (location.path().startsWith('/preview')) {
        return onlyofficeAlfrescoExtensionLoader();
      }

      return Promise.resolve(true);
    })
  ];
}

/* @deprecated use `provideOnlyofficeAlfrescoExtension()` provider api instead */
@NgModule({
  providers: [...provideOnlyofficeAlfrescoExtension()]
})
export class OnlyofficeAlfrescoExtensionModule {}
