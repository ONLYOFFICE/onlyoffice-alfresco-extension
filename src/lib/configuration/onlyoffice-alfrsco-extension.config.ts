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
