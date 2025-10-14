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
import { Component, ViewEncapsulation, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AppStore } from '@alfresco/aca-shared/store';
import { Node } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';

import { CreateFile } from '../../actions/onlyoffice-alfresco-extension.actions';

@Component({
  imports: [CommonModule, TranslatePipe, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './create-file.dialog.html',
  styleUrls: ['./create-file.dialog.scss'],
  selector: 'onlyoffice-alfresco-extension-create-file-dialog',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'onlyoffice-alfresco-extension' }
})
export class CreateFileDialogComponent implements OnInit {
  form: UntypedFormGroup;

  constructor(
    private store: Store<AppStore>,
    private formBuilder: UntypedFormBuilder,
    private dialogRef: MatDialogRef<CreateFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Node
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      documentType: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', [Validators.required]]
    });
  }

  onSubmit() {
    this.store.dispatch(new CreateFile(this.form.value.documentType));
  }

  close() {
    this.dialogRef.close();
  }
}
