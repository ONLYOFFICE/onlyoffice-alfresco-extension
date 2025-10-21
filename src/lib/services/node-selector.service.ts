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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  ContentNodeDialogService,
  ContentNodeSelectorComponent,
  ContentNodeSelectorComponentData,
  ContentService,
  NodeAction,
  ShareDataRow
} from '@alfresco/adf-content-services';
import { ThumbnailService, TranslationService } from '@alfresco/adf-core';
import { Node, NodeEntry, Site, SitePaging, SitePagingList } from '@alfresco/js-api';
import { Subject } from 'rxjs';

export enum SelectorType {
  FOLDER = 'FOLDER',
  INSERT_IMAGE = 'INSERT_IMAGE',
  MAIL_MERGE = 'MAIL_MERGE',
  COMPARE_FILE = 'COMPARE_FILE',
  REFERENCE_SOURCE = 'REFERENCE_SOURCE'
}

@Injectable({
  providedIn: 'root'
})
export class NodeSelectorService {
  constructor(
    private dialog: MatDialog,
    private translation: TranslationService,
    private contentService: ContentService,
    private thumbnailService: ThumbnailService
  ) {}

  getContentNodeSelection(action: SelectorType, node: NodeEntry): Subject<Node[]> {
    const currentParentFolderId = this.getEntryParentId(node.entry);

    const customDropdown = new SitePaging({
      list: {
        entries: [
          {
            entry: {
              guid: '-my-',
              title: this.translation.instant('APP.BROWSE.PERSONAL.SIDENAV_LINK.LABEL')
            } as Site
          },
          {
            entry: {
              guid: '-mysites-',
              title: this.translation.instant('APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.SIDENAV_LINK.LABEL')
            } as Site
          }
        ]
      } as SitePagingList
    });

    const title = this.getTitleTranslation();

    const data: ContentNodeSelectorComponentData = {
      title,
      actionName: NodeAction.CHOOSE,
      currentFolderId: currentParentFolderId,
      dropdownHideMyFiles: true,
      dropdownSiteList: customDropdown,
      selectionMode: 'single',
      rowFilter: this.getRowFilter(action),
      imageResolver: this.getImageResolver(action),
      breadcrumbTransform: this.customizeBreadcrumb.bind(this),
      isSelectionValid: this.getSelectionValidator(action),
      excludeSiteContent: ContentNodeDialogService.nonDocumentSiteContent,
      select: new Subject<Node[]>()
    };

    this.dialog.open(ContentNodeSelectorComponent, {
      data,
      panelClass: 'adf-content-node-selector-dialog',
      width: '630px',
      role: 'dialog'
    });

    data.select.subscribe({
      complete: this.close.bind(this)
    });

    return data.select;
  }

  getEntryParentId(nodeEntry: Node) {
    let entryParentId = '';

    if (nodeEntry.parentId) {
      entryParentId = nodeEntry.parentId;
    } else if (nodeEntry.path?.elements?.length) {
      entryParentId = nodeEntry.path.elements[nodeEntry.path.elements.length - 1].id;
    }

    return entryParentId;
  }

  getTitleTranslation(): string {
    return this.translation.instant(`NODE_SELECTOR.CHOOSE_ITEM`, { name: this.translation.instant('APP.BROWSE.PERSONAL.SIDENAV_LINK.LABEL') });
  }

  close() {
    this.dialog.closeAll();
  }

  private getSelectionValidator(type: SelectorType) {
    switch (type) {
      case SelectorType.FOLDER:
        return this.folderSelectionValidator.bind(this);
      default:
        return this.fileSelectionValidator.bind(this);
    }
  }

  private folderSelectionValidator(entry: Node): boolean {
    return this.hasEntityCreatePermission(entry);
  }

  private fileSelectionValidator(entry: Node): boolean {
    return !this.isSite(entry) && !entry.isFolder;
  }

  private isSite(entry: any) {
    return !!entry['guid'] || entry.nodeType === 'st:site' || entry.nodeType === 'st:sites';
  }

  private hasEntityCreatePermission(entry: Node): boolean {
    return this.contentService.hasAllowableOperations(entry, 'create');
  }

  private customizeBreadcrumb(node: Node) {
    if (node?.path?.elements) {
      const elements = node.path.elements;

      if (elements.length > 1) {
        if (elements[1].name === 'User Homes') {
          elements.splice(0, 2);

          // make sure first item is 'Personal Files'
          if (elements[0]) {
            elements[0].name = this.translation.instant('APP.BROWSE.PERSONAL.TITLE');
            elements[0].id = '-my-';
          } else {
            node.name = this.translation.instant('APP.BROWSE.PERSONAL.TITLE');
          }
        } else if (elements[1].name === 'Sites') {
          this.normalizeSitePath(node);
        }
      } else if (elements.length === 1) {
        if (node.name === 'Sites') {
          node.name = this.translation.instant('APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.TITLE');
          elements.splice(0, 1);
        }
      }
    } else if (node === null) {
      node = {
        name: this.translation.instant('APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.TITLE'),
        path: { elements: [] }
      } as any;
    }

    return node;
  }

  private getRowFilter(type: SelectorType) {
    switch (type) {
      case SelectorType.FOLDER:
        return this.folderRowFilter;
      case SelectorType.REFERENCE_SOURCE:
        return this.referenceSourceRowFilter;
      default:
        return null;
    }
  }

  private folderRowFilter(row: ShareDataRow): boolean {
    const node: Node = row.node.entry;

    return !node.isFile && node.nodeType !== 'app:folderlink';
  }

  private referenceSourceRowFilter(row: ShareDataRow): boolean {
    const node = row.node.entry;

    if (node.isFile) {
      const fileName = node.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      return 'xlsx' === fileExtension;
    } else {
      return true;
    }
  }

  private getImageResolver(type: SelectorType) {
    switch (type) {
      case SelectorType.FOLDER:
        return this.folderImageResolver.bind(this);
      default:
        return null;
    }
  }

  private folderImageResolver(row: ShareDataRow): string | null {
    const entry: Node = row.node.entry;
    if (!this.hasEntityCreatePermission(entry)) {
      return this.thumbnailService.getMimeTypeIcon('disable/folder');
    }

    return null;
  }

  private normalizeSitePath(node: Node) {
    const elements = node.path.elements;

    // remove 'Company Home'
    elements.splice(0, 1);

    // replace first item with 'File Libraries'
    elements[0].name = this.translation.instant('APP.BROWSE.LIBRARIES.MENU.MY_LIBRARIES.TITLE');
    elements[0].id = '-mysites-';

    if (this.isSiteContainer(node)) {
      // rename 'documentLibrary' entry to the target site display name
      // clicking on the breadcrumb entry loads the site content
      node.name = elements[1].name;

      // remove the site entry
      elements.splice(1, 1);
    } else {
      // remove 'documentLibrary' in the middle of the path
      const docLib = elements.findIndex((el) => el.name === 'documentLibrary');
      if (docLib > -1) {
        elements.splice(docLib, 1);
      }
    }
  }

  private isSiteContainer(node: Node): boolean {
    if (node?.aspectNames?.length > 0) {
      return node.aspectNames.indexOf('st:siteContainer') >= 0;
    }
    return false;
  }
}
