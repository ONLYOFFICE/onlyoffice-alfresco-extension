/**
 *
 * (c) Copyright Ascensio System SIA 2025
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { Location } from '@angular/common';
import { EnvironmentProviders, inject, NgModule, provideAppInitializer, Provider } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { provideTranslations } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { provideEffects } from '@ngrx/effects';
import { first } from 'rxjs';

import { EXTENSION_DATA_LOADERS } from '@alfresco/aca-shared';

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
