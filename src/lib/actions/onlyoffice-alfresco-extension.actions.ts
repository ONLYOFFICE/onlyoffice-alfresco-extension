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

import { ModalConfiguration } from '@alfresco/aca-shared/store';
import { NodeEntry } from '@alfresco/js-api';
import { Action } from '@ngrx/store';

export enum OnlyofficeAlfrescoExtensionActionTypes {
  OpenRoute = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_ROUTE',
  OpenCreateFileDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_CREATE_FILE_DIALOG',
  OpenConvertFileDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_CONVERT_FILE_DIALOG',
  OpenDownloadAsDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_DOWNLOAD_AS_DIALOG',
  OpenSaveAsDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_SAVE_AS_DIALOG',
  CreateFile = 'ONLYOFFICE_ALFRESCO_EXTENSION_CREATE_FILE',
  ConvertFile = 'ONLYOFFICE_ALFRESCO_EXTENSION_CONVERT_FILE'
}

export class OpenRoute implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.OpenRoute;

  constructor(public payload: any[]) {}
}

export class OpenCreateFileDialog implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.OpenCreateFileDialog;
}

export class OpenConvertFileDialog implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.OpenConvertFileDialog;

  constructor(public configuration?: ModalConfiguration) {}
}

export class OpenDownloadAsDialog implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.OpenDownloadAsDialog;

  constructor(public configuration?: ModalConfiguration) {}
}

export class OpenSaveAsDialog implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.OpenSaveAsDialog;

  constructor(
    public payload: {
      nodeEntry: NodeEntry;
      title?: string;
      url?: string;
    },
    public configuration?: ModalConfiguration
  ) {}
}

export class CreateFile implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.CreateFile;

  constructor(
    public mimeType: string,
    public folderId?: string,
    public handleError?: (error: Error) => void
  ) {}
}

export class ConvertFile implements Action {
  readonly type = OnlyofficeAlfrescoExtensionActionTypes.ConvertFile;

  constructor(public mimeType: string) {}
}
