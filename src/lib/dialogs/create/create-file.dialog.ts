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
  form!: UntypedFormGroup;

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
