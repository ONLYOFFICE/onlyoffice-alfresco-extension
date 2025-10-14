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
