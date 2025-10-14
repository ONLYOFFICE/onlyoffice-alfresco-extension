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
