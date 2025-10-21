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
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { NotificationService } from '@alfresco/adf-core';
import { Node, NodeEntry } from '@alfresco/js-api';
import { TranslatePipe } from '@ngx-translate/core';

import { OnlyofficeApi } from '../../api/onlyoffice.api';
import { NodeSelectorService, SelectorType } from '../../services/node-selector.service';

@Component({
  imports: [CommonModule, TranslatePipe, MatDialogModule, MatButtonModule, MatInputModule, ReactiveFormsModule, MatFormFieldModule, MatIcon],
  templateUrl: './save-as.dialog.html',
  styleUrls: ['./save-as.dialog.scss'],
  selector: 'onlyoffice-alfresco-extension-save-as-dialog',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'onlyoffice-alfresco-extension' }
})
export class SaveAsDialogComponent implements OnInit {
  private onlyofficeApi: OnlyofficeApi;

  public form: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private dialogRef: MatDialogRef<SaveAsDialogComponent>,
    private nodeSelectorService: NodeSelectorService,
    private notificationService: NotificationService,
    apiService: AlfrescoApiService,
    @Inject(MAT_DIALOG_DATA) public data: { nodeEntry: NodeEntry; title: string; url: string }
  ) {
    this.onlyofficeApi = new OnlyofficeApi(apiService.getInstance().contentPrivateClient);
  }

  ngOnInit() {
    const name = this.data.title.substring(0, this.data.title.lastIndexOf('.'));

    this.form = this.formBuilder.group({
      name: [name, [Validators.required, this.forbidEndingDot, this.forbidOnlySpaces, this.forbidSpecialCharacters]],
      destinationFolderId: [null, Validators.required]
    });
  }

  onInputDestinationFolder() {
    this.form.get('destinationFolderId')?.setValue(null);
  }

  onClickDestinationFolder() {
    const select = this.nodeSelectorService.getContentNodeSelection(SelectorType.FOLDER, this.data.nodeEntry);

    select.subscribe((nodes: Node[]) => {
      this.form.get('destinationFolderId')?.setValue(nodes[0].id);
    });
  }

  onSubmit() {
    this.onlyofficeApi
      .saveAs({
        title: this.form.value.name.trim(),
        ext: this.data.title.split('.').pop() || '',
        url: this.data.url,
        saveNode: 'workspace://SpacesStore/' + this.form.value.destinationFolderId
      })
      .then(() => {
        this.notificationService.showInfo('ONLYOFFICE_ALFRESCO_EXTENSION.PAGES.SAVE_AS.MESSAGES.SUCCESS');
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
      })
      .finally(() => {
        this.close();
      });
  }

  close() {
    this.dialogRef.close();
  }

  private forbidSpecialCharacters({ value }: UntypedFormControl): ValidationErrors | null {
    const specialCharacters = /([\*\"\<\>\\\/\?\:\|])/;
    const isValid = !specialCharacters.test(value);

    return isValid
      ? null
      : {
          message: `NODE_FROM_TEMPLATE.FORM.ERRORS.SPECIAL_CHARACTERS`
        };
  }

  private forbidEndingDot({ value }: UntypedFormControl): ValidationErrors | null {
    const isValid: boolean = (value || '').trim().split('').pop() !== '.';

    return isValid
      ? null
      : {
          message: `NODE_FROM_TEMPLATE.FORM.ERRORS.ENDING_DOT`
        };
  }

  private forbidOnlySpaces({ value }: UntypedFormControl): ValidationErrors | null {
    if (value.length) {
      const isValid = !!(value || '').trim();

      return isValid
        ? null
        : {
            message: `NODE_FROM_TEMPLATE.FORM.ERRORS.ONLY_SPACES`
          };
    } else {
      return {
        message: `NODE_FROM_TEMPLATE.FORM.ERRORS.REQUIRED`
      };
    }
  }
}
