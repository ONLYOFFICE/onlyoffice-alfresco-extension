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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { GenericErrorComponent } from '@alfresco/aca-shared';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { TranslationService } from '@alfresco/adf-core';
import { DocumentEditorModule, IConfig } from '@onlyoffice/document-editor-angular';

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
  url = '';

  @Input()
  extension = '';

  @Input()
  nodeId = '';

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
