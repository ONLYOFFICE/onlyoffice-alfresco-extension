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
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { PermissionListComponent } from '@alfresco/adf-content-services';
import { Node } from '@alfresco/js-api';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe, PermissionListComponent],
  templateUrl: './permissions.dialog.html',
  styleUrls: ['./permissions.dialog.scss'],
  selector: 'onlyoffice-alfresco-extension-permissions-dialog',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'onlyoffice-alfresco-extension' }
})
export class PermissionsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public node: Node) {}
}
