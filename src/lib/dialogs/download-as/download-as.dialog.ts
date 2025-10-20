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
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ContentUrlService } from '@alfresco/aca-content';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import {
  DataColumnComponent,
  DataColumnListComponent,
  DataRow,
  DataTableComponent,
  DateColumnHeaderComponent,
  LoadingContentTemplateDirective,
  NotificationService,
  ObjectDataTableAdapter,
  ThumbnailService,
  TranslationService
} from '@alfresco/adf-core';
import { NodeEntry } from '@alfresco/js-api';
import { TranslatePipe } from '@ngx-translate/core';

import { OnlyofficeApi } from '../../api/onlyoffice.api';
import { getConvertExtensions } from '../../configuration/onlyoffice-alfrsco-extension.config';

@Component({
  imports: [
    CommonModule,
    TranslatePipe,
    MatDialogModule,
    MatButtonModule,
    DataTableComponent,
    DataColumnListComponent,
    DataColumnComponent,
    DateColumnHeaderComponent,
    MatSelectModule,
    MatIcon,
    MatProgressSpinnerModule,
    LoadingContentTemplateDirective
  ],
  templateUrl: './download-as.dialog.html',
  styleUrls: ['./download-as.dialog.scss'],
  selector: 'onlyoffice-alfresco-extension-download-as-dialog',
  encapsulation: ViewEncapsulation.None
})
export class DownloadAsDialogComponent {
  private onlyofficeApi: OnlyofficeApi;

  dataTable: ObjectDataTableAdapter;
  schemaTable: any[];
  commonOutputTypeOptions: string[] = [];
  showSpinner = false;

  constructor(
    private thumbnailService: ThumbnailService,
    private dialogRef: MatDialogRef<DownloadAsDialogComponent>,
    private translationService: TranslationService,
    private contentUrlService: ContentUrlService,
    private notificationService: NotificationService,
    apiService: AlfrescoApiService,
    @Inject(MAT_DIALOG_DATA)
    public nodes: Array<NodeEntry>
  ) {
    this.onlyofficeApi = new OnlyofficeApi(apiService.getInstance().contentPrivateClient);

    const data: any[] = [];

    nodes.forEach((nodeEntry: NodeEntry) => {
      const node = nodeEntry.entry;
      const isFile = node.isFile;
      const name = nodeEntry.entry.name;

      if (isFile) {
        const extension = name.split('.').pop()?.toLowerCase();
        const outputTypes = getConvertExtensions(extension || '');

        if (outputTypes && outputTypes.length > 0) {
          if (this.commonOutputTypeOptions.length === 0) {
            this.commonOutputTypeOptions = outputTypes;
          } else {
            this.commonOutputTypeOptions = this.commonOutputTypeOptions.filter((value) => outputTypes.includes(value));
          }

          data.push({
            id: nodeEntry.entry.id,
            icon: this._getIcon(nodeEntry),
            name: name,
            outputType: {
              value: outputTypes[0],
              options: outputTypes
            }
          });
        }
      }
    });

    this.dataTable = new ObjectDataTableAdapter(data);

    this.schemaTable = [
      {
        key: 'icon',
        type: 'image',
        sortable: true
      },
      {
        type: 'text',
        key: 'name',
        title: this.translationService.instant('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.DOWNLOAD_AS.TABLE.COLUMNS.NAME'),
        sortable: true,
        cssClass: 'adf-expand-cell-5'
      }
    ];
  }

  onSubmit = () => {
    this.showSpinner = true;

    const items = this.dataTable.getRows().map((row: DataRow) => {
      return {
        nodeRef: 'workspace://SpacesStore/' + row.getValue('id'),
        outputType: row.getValue('outputType').value
      };
    });

    this.onlyofficeApi
      .downloadAs(items)
      .then((response) => {
        const { downloadUrl } = response;
        const pathNames = downloadUrl.split('/');
        const nodeName = pathNames[pathNames.length - 1];
        const nodeId = pathNames[pathNames.length - 2];

        this.contentUrlService.getNodeContentUrl(nodeId, true).subscribe((contentUrl) => {
          this.download(contentUrl, nodeName);
        });
      })
      .catch((error) => {
        console.error(error);

        this.notificationService.showError('APP.MESSAGES.ERRORS.GENERIC');
      })
      .finally(() => {
        this.close();
      });
  };

  onChangeOutputType(value: any, object: any) {
    object.outputType.value = value;
  }

  onChangeAllOutputTypes(value: any) {
    this.dataTable.getRows().forEach((row: DataRow) => {
      row.getValue('outputType').value = value;
    });
  }

  removeFile(id: string) {
    let rows = this.dataTable.getRows();
    rows = rows.filter((row: DataRow) => {
      return row.getValue('id') !== id;
    });

    this.dataTable.setRows(rows);

    if (rows.length === 0) {
      this.close();
    }

    rows.forEach((row: DataRow) => {
      const outputTypes = row.getValue('outputType').options;

      if (this.commonOutputTypeOptions.length === 0) {
        this.commonOutputTypeOptions = outputTypes;
      } else {
        this.commonOutputTypeOptions = this.commonOutputTypeOptions.filter((value) => outputTypes.includes(value));
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  private download(url: string, fileName: string) {
    if (url && fileName) {
      const link = document.createElement('a');

      link.style.display = 'none';
      link.download = fileName;
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private _getIcon(node: NodeEntry) {
    if (node.entry.content) {
      const mimeType = node.entry.content.mimeType;
      if (mimeType) {
        return this.thumbnailService.getMimeTypeIcon(mimeType);
      }
    }

    return this.thumbnailService.getDefaultMimeTypeIcon();
  }
}
