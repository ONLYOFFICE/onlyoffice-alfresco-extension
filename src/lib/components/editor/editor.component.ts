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

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { GenericErrorComponent } from '@alfresco/aca-shared';
import { AppStore, NavigateToParentFolder } from '@alfresco/aca-shared/store';
import { AlfrescoApiService, NodeAction, ShareDataRow } from '@alfresco/adf-content-services';
import { LocalizedDatePipe, NotificationService, TranslationService } from '@alfresco/adf-core';
import { FavoritesApi, Node, NodeEntry, NodesApi } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { DocumentEditorModule, IConfig } from '@onlyoffice/document-editor-angular';

import { CreateFile } from '../../actions/onlyoffice-alfresco-extension.actions';
import { OnlyofficeApi } from '../../api/onlyoffice.api';
import { PermissionsDialogComponent } from '../../dialogs/permissions/permissions.dialog';
import { FaviconService } from '../../services/favicon.service';
import { NodeSelectorService } from '../../services/node-selector.service';
import { UrlService } from '../../services/url.service';
import { getNodeId } from '../../utils/utils';

@Component({
  selector: 'onlyoffice-alfresco-extension-editor',
  imports: [CommonModule, DocumentEditorModule, MatProgressSpinnerModule, GenericErrorComponent],
  providers: [LocalizedDatePipe],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {
  private localizedDatePipe = inject(LocalizedDatePipe);
  private nodeSelectorService = inject(NodeSelectorService);
  private dialog = inject(MatDialog);
  private onlyofficeApi: OnlyofficeApi;
  private nodesApi: NodesApi;
  private favoritesApi: FavoritesApi;

  showSpinner = true;

  editorId = 'onlyofficeEditor';
  documentServerUrl = '';
  config: IConfig = {};
  shardKey = '';
  isDemoServer = false;
  node: NodeEntry | undefined;
  error: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppStore>,
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private titleService: Title,
    private faviconService: FaviconService,
    private urlService: UrlService,
    apiService: AlfrescoApiService
  ) {
    this.onlyofficeApi = new OnlyofficeApi(apiService.getInstance().contentPrivateClient);
    this.nodesApi = new NodesApi(apiService.getInstance());
    this.favoritesApi = new FavoritesApi(apiService.getInstance());
  }

  ngOnInit() {
    this.route.params.subscribe(({ nodeId }: Params) => {
      this.nodesApi
        .getNode(nodeId, { include: ['path'] })
        .then((nodeEntry: NodeEntry) => {
          this.node = nodeEntry;
        })
        .catch((error) => {
          console.error(error);
          this.error = 'APP.MESSAGES.ERRORS.MISSING_CONTENT';
        });

      this.onlyofficeApi
        .getEditorConfig(nodeId)
        .then((config) => {
          const { error } = config;
          if (error) {
            this.error = 'APP.MESSAGES.ERRORS.MISSING_CONTENT';
            return;
          }

          this.documentServerUrl = new URL(config.documentServerApiUrl).origin; // ToDo send from backend
          this.config = config.editorConfig;
          this.shardKey = this.config.document?.key || '';
          this.isDemoServer = config.demo;

          this.titleService.setTitle(this.config.document?.title + ' - ONLYOFFICE');
          this.faviconService.setFavicon(`/assets/onlyoffice-alfresco-extension/images/${this.config.documentType}.ico`);

          this._updateCustomization(this.config.editorConfig?.customization);

          this.config.events = {
            onAppReady: this.onAppReady,
            onMetaChange: this.onMetaChange,
            onRequestCreateNew: this.onRequestCreateNew,
            onRequestClose: this.onRequestClose,
            onRequestHistory: this.onRequestHistory,
            onRequestHistoryClose: this.onRequestHistoryClose,
            onRequestHistoryData: this.onRequestHistoryData,
            onRequestInsertImage: this.onRequestInsertImage,
            onRequestMailMergeRecipients: this.onRequestMailMergeRecipients,
            onRequestOpen: this.onRequestOpen,
            onRequestCompareFile: this.onRequestCompareFile,
            onRequestReferenceData: this.onRequestReferenceData,
            onRequestReferenceSource: this.onRequestReferenceSource,
            onRequestSharingSettings: config.canManagePermissions ? this.onRequestSharingSettings : undefined
          };
        })
        .catch((error) => {
          console.error(error);
          this.error = 'APP.MESSAGES.ERRORS.GENERIC';
        })
        .finally(() => {
          this.showSpinner = false;
        });
    });
  }

  private _updateCustomization = (customization: any) => {
    customization = customization || {};
    customization.goback = {};
    customization.close = {
      text: '',
      visible: true
    };
  };

  onLoadComponentError = () => {
    this.error = 'ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.EDITOR.MESSAGES.DOCS_API_UNDEFINED';
  };

  onAppReady = () => {
    if (this.isDemoServer) {
      window?.DocEditor?.instances[this.editorId].showMessage(
        this.translationService.instant('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.EDITOR.MESSAGES.DEMO_NOTIFICATION')
      );
    }
  };

  onMetaChange = (event: { data: any }) => {
    if (this.node) {
      const { data } = event;
      const { favorite } = data;

      if (favorite) {
        this.favoritesApi
          .createFavorite('-me-', {
            target: {
              ['file']: {
                guid: this.node?.entry.id
              }
            }
          })
          .then(() => window?.DocEditor?.instances[this.editorId].setFavorite(favorite))
          .catch((error) => {
            console.error(error);
          });
      } else {
        this.favoritesApi
          .deleteFavorite('-me-', this.node?.entry.id)
          .then(() => window?.DocEditor?.instances[this.editorId].setFavorite(favorite))
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  onRequestCreateNew = () => {
    let mimeType = '';

    switch (this.config.documentType) {
      case 'word':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'cell':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'slide':
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      default:
        return;
    }

    this.store.dispatch(new CreateFile(mimeType, this.node?.entry.parentId));
  };

  onRequestHistory = () => {
    if (this.node) {
      this.onlyofficeApi
        .getHistory(this.node?.entry.id)
        .then((historyInfo) => {
          for (let i = 0; i < historyInfo.history.length; i++) {
            historyInfo.history[i].created = this.localizedDatePipe.transform(historyInfo.history[i].created, 'short');

            if (historyInfo.history[i].changes) {
              for (let t = 0; t < historyInfo.history[i].changes.length; t++) {
                const created = new Date(historyInfo.history[i].changes[t].created);
                const createdUTC = new Date(
                  Date.UTC(
                    created.getFullYear(),
                    created.getMonth(),
                    created.getDate(),
                    created.getHours(),
                    created.getMinutes(),
                    created.getSeconds()
                  )
                );

                historyInfo.history[i].changes[t].created = this.localizedDatePipe.transform(createdUTC.toISOString(), 'short');
              }
            }
          }

          window?.DocEditor?.instances[this.editorId].refreshHistory({
            currentVersion: historyInfo.currentVersion,
            history: historyInfo.history
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  onRequestHistoryClose = function () {
    document.location.reload();
  };

  onRequestHistoryData = (event: { data: string }) => {
    if (this.node) {
      const version = event.data;

      this.onlyofficeApi
        .getHistoryData(this.node?.entry.id, version)
        .then((historyData) => {
          if (historyData) {
            window?.DocEditor?.instances[this.editorId].setHistoryData(historyData);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  onRequestInsertImage = (event: { data: { c: string } }) => {
    if (this.node) {
      const select = this.nodeSelectorService.getContentNodeSelection(NodeAction.CHOOSE, this.node);

      const command = event.data.c;

      select.subscribe((nodes: Node[]) => {
        const items = nodes.map((node) => {
          return 'workspace://SpacesStore/' + node.id;
        });

        if (items.length > 0) {
          this.onlyofficeApi
            .getInsertData(command, items)
            .then((data) => {
              window?.DocEditor?.instances[this.editorId].insertImage(data[0]);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }
  };

  onRequestMailMergeRecipients = () => {
    if (this.node) {
      const select = this.nodeSelectorService.getContentNodeSelection(NodeAction.CHOOSE, this.node);

      select.subscribe((nodes: Node[]) => {
        const items = nodes.map((node) => {
          return 'workspace://SpacesStore/' + node.id;
        });

        if (items.length > 0) {
          this.onlyofficeApi
            .getInsertData(null, items)
            .then((data) => {
              window?.DocEditor?.instances[this.editorId].setMailMergeRecipients(data[0]);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }
  };

  onRequestCompareFile = () => {
    if (this.node) {
      const select = this.nodeSelectorService.getContentNodeSelection(NodeAction.CHOOSE, this.node);

      select.subscribe((nodes: Node[]) => {
        const items = nodes.map((node) => {
          return 'workspace://SpacesStore/' + node.id;
        });

        if (items.length > 0) {
          this.onlyofficeApi
            .getInsertData(null, items)
            .then((data) => {
              window?.DocEditor?.instances[this.editorId].setRevisedFile(data[0]);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }
  };

  onRequestOpen = (event: { data: any }) => {
    const { data } = event;
    const { referenceData, windowName } = data;
    const { fileKey } = referenceData;

    const nodeId = getNodeId(fileKey);

    window.open(this.urlService.createUrl(['/onlyoffice-editor', nodeId]), windowName);
  };

  onRequestReferenceData = (event: { data: any }) => {
    const { data } = event;

    this.onlyofficeApi
      .getReferenceData(data)
      .then((referenceData) => {
        window?.DocEditor?.instances[this.editorId].setReferenceData(referenceData);
      })
      .catch((error) => {
        let statusCode: number;

        try {
          statusCode = JSON.parse(error.message).error.statusCode;
        } catch (e) {
          statusCode = 0;
        }

        let errorMessage;
        if (statusCode === 403 || statusCode === 404) {
          errorMessage = this.translationService.instant('APP.MESSAGES.ERRORS.MISSING_CONTENT');
        } else {
          errorMessage = this.translationService.instant('APP.MESSAGES.ERRORS.GENERIC');
        }

        window?.DocEditor?.instances[this.editorId].setReferenceData({ error: errorMessage });
      });
  };

  onRequestReferenceSource = () => {
    if (this.node) {
      const select = this.nodeSelectorService.getContentNodeSelection(NodeAction.CHOOSE, this.node, (row: ShareDataRow) => {
        const node = row.node.entry;

        if (node.isFile) {
          const fileName = node.name;
          const fileExtension = fileName.split('.').pop()?.toLowerCase();

          return 'xlsx' === fileExtension;
        } else {
          return true;
        }
      });

      select.subscribe((nodes: Node[]) => {
        const items = nodes.map((node) => {
          return 'workspace://SpacesStore/' + node.id;
        });

        if (items.length > 0) {
          const data = {
            referenceData: {
              fileKey: items[0]
            }
          };

          this.onlyofficeApi
            .getReferenceData(data)
            .then((referenceData) => {
              window?.DocEditor?.instances[this.editorId].setReferenceSource(referenceData);
            })
            .catch((error) => {
              let statusCode: number;

              try {
                statusCode = JSON.parse(error.message).error.statusCode;
              } catch (e) {
                statusCode = 0;
              }

              if (statusCode === 403 || statusCode === 404) {
                this.notificationService.showError('APP.MESSAGES.ERRORS.MISSING_CONTENT');
              } else {
                this.notificationService.showError('APP.MESSAGES.ERRORS.GENERIC');
              }
            });
        }
      });
    }
  };

  onRequestSharingSettings = () => {
    if (this.node) {
      this.dialog.open(PermissionsDialogComponent, {
        data: this.node.entry,
        width: '800px',
        role: 'dialog'
      });
    }
  };

  onRequestSaveAs = () => {};

  onRequestClose = () => {
    if (this.node) {
      this.store.dispatch(new NavigateToParentFolder(this.node));
    }
  };
}
