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

import { ModalConfiguration } from '@alfresco/aca-shared/store';
import { Action } from '@ngrx/store';

export enum OnlyofficeAlfrescoExtensionActionTypes {
  OpenRoute = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_ROUTE',
  OpenCreateFileDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_CREATE_FILE_DIALOG',
  OpenConvertFileDialog = 'ONLYOFFICE_ALFRESCO_EXTENSION_OPEN_CONVERT_FILE_DIALOG',
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
