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

import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { ExtensionService, ViewerExtensionRef } from '@alfresco/adf-extensions';
import { from, map } from 'rxjs';

export interface Format {
  name: string;
  type: string;
  actions: string[];
  convert: string[];
  mime: string[];
}

let settings:
  | {
      convertOriginal: boolean;
      editableFormats: Record<string, boolean>;
      supportedFormats?: Format[];
      previewEnabled?: boolean;
    }
  | undefined;

export const onlyofficeAlfrescoExtensionLoader = () => {
  if (settings && Object.keys(settings).length > 0) {
    return from(Promise.resolve(true));
  }

  const httpClient = inject(HttpClient);

  return httpClient.get('alfresco/service/parashift/onlyoffice/onlyoffice-settings').pipe(
    map((response: any) => {
      settings = response;

      return true;
    })
  );
};

export const setViewerExtensionConfig = (extensionService: ExtensionService) => {
  const viewerExtension = extensionService
    .getElements<ViewerExtensionRef>('features.viewer.extensions')
    .find((extension) => extension.id === 'onlyoffice-alfresco-extension:viewer:extension:viewer');

  if (viewerExtension) {
    // @ts-expect-error fileExtensions is not defined in ViewerExtensionRef, but it exists at runtime
    viewerExtension.fileExtension = getViewExtensions();
  }
};

export const getOnlyofficeAlfrescoExtensionSettings = () => {
  return settings;
};

export const getViewExtensions = () => {
  let viewExtensions: string[] = [];
  const currentSettings = getOnlyofficeAlfrescoExtensionSettings();
  const supportedFormats = currentSettings?.supportedFormats;

  if (supportedFormats) {
    viewExtensions = supportedFormats
      .filter((format) => format.actions.includes('view'))
      .reduce((extensions, format) => [...extensions, format.name], viewExtensions);
  }

  return viewExtensions;
};

export const getConvertExtensions = (sourceExtension: string, includeSource = false): string[] => {
  let convertExtensions: string[] = [];
  const currentSettings = getOnlyofficeAlfrescoExtensionSettings();
  const supportedFormats = currentSettings?.supportedFormats;

  if (supportedFormats) {
    for (const format of supportedFormats) {
      if (format.name === sourceExtension) {
        convertExtensions = format.convert ? format.convert : [];
      }
    }

    if (convertExtensions.length > 0 && !includeSource) {
      if (convertExtensions.includes(sourceExtension)) {
        convertExtensions.splice(convertExtensions.indexOf(sourceExtension), 1);
      }
    }
  }

  return convertExtensions;
};
