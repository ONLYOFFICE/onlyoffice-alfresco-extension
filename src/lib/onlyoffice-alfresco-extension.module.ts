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

import { EnvironmentProviders, NgModule, Provider } from '@angular/core';

import { EXTENSION_DATA_LOADERS } from '@alfresco/aca-shared';
import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { provideEffects } from '@ngrx/effects';

import { EditorComponent } from './components/editor/editor.component';
import { OnlyofficeAlfrescoExtensionEffects } from './effects/onlyoffice-alfresco-extension.effects';
import { displayConvertAction, displayEditAction, displayViewAction, onlyofficeAlfrescoExtensionLoader } from './rules';

export function provideOnlyofficeAlfrescoExtension(): (Provider | EnvironmentProviders)[] {
  return [
    provideExtensionConfig(['onlyoffice-alfresco-extension.json']),
    provideExtensions({
      components: {
        'onlyoffice-alfresco-extension.editor.component': EditorComponent
      },
      evaluators: {
        'onlyoffice-alfresco-extension.rules.displayViewAction': displayViewAction,
        'onlyoffice-alfresco-extension.rules.displayEditAction': displayEditAction,
        'onlyoffice-alfresco-extension.rules.displayConvertAction': displayConvertAction
      }
    }),
    provideEffects([OnlyofficeAlfrescoExtensionEffects]),
    provideTranslations('onlyoffice-alfresco-extension', 'assets/onlyoffice-alfresco-extension'),
    {
      provide: EXTENSION_DATA_LOADERS,
      multi: true,
      useValue: onlyofficeAlfrescoExtensionLoader
    }
  ];
}

/* @deprecated use `provideOnlyofficeAlfrescoExtension()` provider api instead */
@NgModule({
  providers: [...provideOnlyofficeAlfrescoExtension()]
})
export class OnlyofficeAlfrescoExtensionModule {}
