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

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AppStore, getAppSelection, getCurrentFolder, NavigateRouteAction } from '@alfresco/aca-shared/store';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { NotificationService } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, from, map, of, switchMap, take } from 'rxjs';

import {
  CreateFile,
  OnlyofficeAlfrescoExtensionActionTypes,
  OpenConvertFileDialog,
  OpenCreateFileDialog,
  OpenDownloadAsDialog,
  OpenRoute,
  OpenSaveAsDialog
} from '../actions/onlyoffice-alfresco-extension.actions';
import { OnlyofficeApi } from '../api/onlyoffice.api';
import { ConvertFileDialogComponent } from '../dialogs/convert/convert-file.dialog';
import { CreateFileDialogComponent } from '../dialogs/create/create-file.dialog';
import { DownloadAsDialogComponent } from '../dialogs/download-as/download-as.dialog';
import { SaveAsDialogComponent } from '../dialogs/save-as/save-as.dialog';
import { UrlService } from '../services/url.service';
import { getNodeId } from '../utils/utils';

@Injectable()
export class OnlyofficeAlfrescoExtensionEffects {
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private urlService = inject(UrlService);

  private _onlyofficeApi!: OnlyofficeApi;
  get onlyofficeApi(): OnlyofficeApi {
    this._onlyofficeApi = this._onlyofficeApi ?? new OnlyofficeApi(this.apiService.getInstance().contentPrivateClient);
    return this._onlyofficeApi;
  }

  store = inject(Store<AppStore>);
  apiService = inject(AlfrescoApiService);
  actions$ = inject(Actions);

  openRoute$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OpenRoute>(OnlyofficeAlfrescoExtensionActionTypes.OpenRoute),
        map((action) => {
          window.open(this.urlService.createUrl(action.payload), '_blank');
        })
      ),
    { dispatch: false }
  );

  openCreateFileDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OpenCreateFileDialog>(OnlyofficeAlfrescoExtensionActionTypes.OpenCreateFileDialog),
        map(() => {
          const dialog = this.dialog.open(CreateFileDialogComponent, {
            width: '630px'
          });

          dialog.afterClosed().subscribe(() => this.focusCreateMenuButton());
          return dialog;
        })
      ),
    { dispatch: false }
  );

  createFile$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CreateFile>(OnlyofficeAlfrescoExtensionActionTypes.CreateFile),
        map((action) => {
          const folderId$ = action.folderId ? of(action.folderId) : this.store.select(getCurrentFolder).pipe(map((folder) => folder.id));

          folderId$
            .pipe(
              switchMap((folderId) => {
                return from(this.onlyofficeApi.createNode(folderId, action.mimeType)).pipe(
                  catchError((error) => {
                    if (action.handleError) {
                      action.handleError(error);
                    } else {
                      this.handleError(error);
                    }
                    return of(null);
                  })
                );
              }),
              take(1)
            )
            .subscribe((data: { nodeRef: string } | null) => {
              if (data) {
                const nodeId = getNodeId(data.nodeRef);

                this.dialog.closeAll();
                this.store.dispatch(new NavigateRouteAction(['onlyoffice-editor', nodeId]));
              }
            });
        })
      ),
    { dispatch: false }
  );

  openConvertFileDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OpenConvertFileDialog>(OnlyofficeAlfrescoExtensionActionTypes.OpenConvertFileDialog),
        map((action) => {
          this.store
            .select(getAppSelection)
            .pipe(take(1))
            .subscribe((selection) => {
              this.dialog
                .open(ConvertFileDialogComponent, {
                  width: '600px',
                  disableClose: true,
                  data: {
                    nodeId: this.getNodeId(selection.first?.entry),
                    name: selection.first?.entry.name
                  }
                })
                .afterClosed()
                .subscribe(() => this.focusAfterClose(action.configuration?.focusedElementOnCloseSelector));
            });
        })
      ),
    { dispatch: false }
  );

  openDownloadAsDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OpenDownloadAsDialog>(OnlyofficeAlfrescoExtensionActionTypes.OpenDownloadAsDialog),
        map((action) => {
          this.store
            .select(getAppSelection)
            .pipe(take(1))
            .subscribe((selection) => {
              this.dialog
                .open(DownloadAsDialogComponent, {
                  width: '800px',
                  data: selection.nodes
                })
                .afterClosed()
                .subscribe(() => this.focusAfterClose(action.configuration?.focusedElementOnCloseSelector));
            });
        })
      ),
    { dispatch: false }
  );

  openSaveAsDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OpenSaveAsDialog>(OnlyofficeAlfrescoExtensionActionTypes.OpenSaveAsDialog),
        map((action) => {
          this.dialog
            .open(SaveAsDialogComponent, {
              width: '630px',
              data: action.payload
            })
            .afterClosed()
            .subscribe(() => this.focusAfterClose(action.configuration?.focusedElementOnCloseSelector));
        })
      ),
    { dispatch: false }
  );

  private getNodeId(node: Node | undefined): string {
    if (!node) {
      return '';
    }

    return (node as any).nodeId || (node as any).guid || node.id;
  }

  private handleError(error: Error) {
    let statusCode: number;

    try {
      statusCode = JSON.parse(error.message).error.statusCode;
    } catch (e) {
      statusCode = 0;
    }

    if (statusCode !== 409) {
      this.notificationService.showError('APP.MESSAGES.ERRORS.GENERIC');
    } else {
      this.notificationService.showError('APP.MESSAGES.ERRORS.CONFLICT');
    }
  }

  private focusCreateMenuButton(): void {
    document.querySelector<HTMLElement>('app-toolbar-menu button[id="app.toolbar.create"]')?.focus();
  }

  private focusAfterClose(focusedElementSelector?: string): void {
    if (focusedElementSelector) {
      document.querySelector<HTMLElement>(focusedElementSelector)?.focus();
    }
  }
}
