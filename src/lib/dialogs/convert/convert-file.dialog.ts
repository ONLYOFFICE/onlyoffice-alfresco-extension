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

import { Component, inject, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AlfrescoApiService, DocumentListService } from '@alfresco/adf-content-services';
import { NotificationService } from '@alfresco/adf-core';
import { TranslatePipe } from '@ngx-translate/core';

import { OnlyofficeApi } from '../../api/onlyoffice.api';

@Component({
  imports: [TranslatePipe, MatDialogModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './convert-file.dialog.html',
  styleUrls: ['./convert-file.dialog.scss'],
  selector: 'onlyoffice-alfresco-extension-convert-file-dialog',
  encapsulation: ViewEncapsulation.None
})
export class ConvertFileDialogComponent implements OnInit {
  private documentListService = inject(DocumentListService);
  private notificationService = inject(NotificationService);
  private onlyofficeApi: OnlyofficeApi;

  percentageDone = 0;

  constructor(
    private dialogRef: MatDialogRef<ConvertFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    apiService: AlfrescoApiService
  ) {
    this.onlyofficeApi = new OnlyofficeApi(apiService.getInstance().contentPrivateClient);
  }

  ngOnInit() {
    if (this.data?.nodeId) {
      this.convert(this.data?.nodeId);
    }
  }

  convert(nodeId: string) {
    this.onlyofficeApi
      .convertNode(nodeId)
      .then((response) => {
        if (response?.data?.status === 'success') {
          this.percentageDone = 100;
          this.notificationService.showInfo('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.CONVERT.MESSAGES.SUCCESS', undefined, { name: this.data.name });
          this.documentListService.reload();
        } else {
          console.error(response);
          this.notificationService.showError('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.CONVERT.MESSAGES.ERROR', undefined, { name: this.data.name });
        }
      })
      .catch((error) => {
        console.error(error);
        this.notificationService.showError('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.CONVERT.MESSAGES.ERROR', undefined, { name: this.data.name });
      })
      .finally(() => {
        this.dialogRef.close(false);
      });
  }
}
