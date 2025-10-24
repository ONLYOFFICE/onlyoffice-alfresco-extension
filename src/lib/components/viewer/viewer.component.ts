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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { TranslationService } from '@alfresco/adf-core';
import { DocumentEditorModule, IConfig } from '@onlyoffice/document-editor-angular';

import { GenericErrorComponent } from '../../../../../aca-shared/src/public-api';
import { OnlyofficeApi } from '../../api/onlyoffice.api';

@Component({
  selector: 'onlyoffice-alfresco-extension-viewer',
  imports: [CommonModule, DocumentEditorModule, GenericErrorComponent],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ViewerComponent implements OnInit, OnDestroy {
  showToolbar = true;

  @Input()
  url: string;

  @Input()
  extension: string;

  @Input()
  nodeId: string;

  @Output()
  contentLoaded = new EventEmitter<void>();

  loadingConfig = true;

  editorId = 'onlyofficeEditor';
  documentServerUrl = '';
  config: IConfig = {};
  error: string | undefined;

  private onlyofficeApi: OnlyofficeApi;

  constructor(
    private route: ActivatedRoute,
    private translationService: TranslationService,
    apiService: AlfrescoApiService
  ) {
    this.onlyofficeApi = new OnlyofficeApi(apiService.getInstance().contentPrivateClient);
  }

  ngOnInit(): void {
    if (this.nodeId) {
      this.onlyofficeApi
        .getEditorConfig(this.nodeId, true)
        .then(this._loadConfigHandler)
        .catch((error) => {
          console.error(error);

          this._handleError(error);
          this.contentLoaded.emit();
        })
        .finally(() => {
          this.loadingConfig = false;
        });
    } else {
      this.route.params.subscribe(({ id }: Params) => {
        this.onlyofficeApi
          .getShareEditorConfig(id)
          .then(this._loadConfigHandler)
          .catch((error) => {
            console.error(error);

            this._handleError(error);
            this.contentLoaded.emit();
          })
          .finally(() => {
            this.loadingConfig = false;
          });
      });
    }
  }

  ngOnDestroy(): void {
    if (window.DocsAPI) {
      delete window.DocsAPI;
    }
  }

  onAppReady = () => {
    this.contentLoaded.emit();
  };

  onLoadComponentError = () => {
    this.error = 'ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.EDITOR.MESSAGES.DOCS_API_UNDEFINED';
    this.contentLoaded.emit();
  };

  private _loadConfigHandler = (config: any) => {
    this.documentServerUrl = new URL(config.documentServerApiUrl).origin; // ToDo send from backend
    this.config = config.editorConfig;

    if (this.config.editorConfig) {
      this._updateCustomization(this.config.editorConfig.customization);
      this.config.editorConfig.lang = this.translationService.userLang;
      this.config.editorConfig.embedded = {};
    }

    this.config.events = {
      onAppReady: this.onAppReady
    };
  };

  private _updateCustomization = (customization: any) => {
    customization = customization || {};
    customization.goback = {};
  };

  private _handleError(error: Error) {
    let statusCode: number;

    try {
      statusCode = JSON.parse(error.message).error.statusCode;
    } catch (e) {
      statusCode = 0;
    }

    if (statusCode !== 409) {
      this.error = 'APP.MESSAGES.ERRORS.GENERIC';
    } else {
      this.error = 'APP.MESSAGES.ERRORS.CONFLICT';
    }
  }
}
