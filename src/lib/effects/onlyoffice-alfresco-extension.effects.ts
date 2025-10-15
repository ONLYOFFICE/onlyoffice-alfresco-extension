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

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AppStore, getAppSelection, getCurrentFolder, NavigateRouteAction } from '@alfresco/aca-shared/store';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { NotificationService } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, from, map, Observable, of, switchMap, take } from 'rxjs';

import {
  CreateFile,
  OnlyofficeAlfrescoExtensionActionTypes,
  OpenConvertFileDialog,
  OpenCreateFileDialog,
  OpenRoute
} from '../actions/onlyoffice-alfresco-extension.actions';
import { OnlyofficeApi } from '../api/onlyoffice.api';
import { ConvertFileDialogComponent } from '../dialogs/convert/convert-file.dialog';
import { CreateFileDialogComponent } from '../dialogs/create/create-file.dialog';
import { UrlService } from '../services/url.service';
import { getNodeId } from '../utils/utils';

@Injectable()
export class OnlyofficeAlfrescoExtensionEffects {
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private urlService = inject(UrlService);

  private _onlyofficeApi: OnlyofficeApi;
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
              switchMap((folderId) => this.createNode(folderId, action.mimeType)),
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

  private getNodeId(node: Node | undefined): string {
    if (!node) {
      return '';
    }

    return (node as any).nodeId || (node as any).guid || node.id;
  }

  private createNode(parentId: string, mimeType: string): Observable<{ nodeRef: string } | null> {
    return from(this.onlyofficeApi.createNode(parentId, mimeType)).pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: Error): Observable<null> {
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

    return of(null);
  }

  private focusCreateMenuButton(): void {
    document.querySelector<HTMLElement>('app-toolbar-menu button[id="app.toolbar.create"]').focus();
  }

  private focusAfterClose(focusedElementSelector?: string): void {
    if (focusedElementSelector) {
      document.querySelector<HTMLElement>(focusedElementSelector)?.focus();
    }
  }
}
