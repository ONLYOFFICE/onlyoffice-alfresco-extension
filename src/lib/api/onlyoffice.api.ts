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

import { WebscriptApi } from '@alfresco/js-api';

export class OnlyofficeApi extends WebscriptApi {
  getEditorConfig(nodeId: string) {
    return this.executeWebScript('GET', 'parashift/onlyoffice/prepare?nodeRef=workspace://SpacesStore/' + nodeId);
  }

  getHistory(nodeId: string) {
    return this.executeWebScript('GET', 'parashift/onlyoffice/history/info?nodeRef=workspace://SpacesStore/' + nodeId);
  }

  getHistoryData(nodeId: string, version: string) {
    return this.executeWebScript('GET', 'parashift/onlyoffice/history/data?nodeRef=workspace://SpacesStore/' + nodeId + '&version=' + version);
  }

  getInsertData(command: string | null, nodes: string[]) {
    return this.executeWebScript('POST', 'parashift/onlyoffice/editor-api/insert', {}, 'alfresco', 'service', {
      command: command,
      nodes: nodes
    });
  }

  getReferenceData = (data: any) => {
    return this.executeWebScript('POST', 'parashift/onlyoffice/editor-api/reference-data', {}, 'alfresco', 'service', data);
  };

  getSettings() {
    return this.executeWebScript('GET', 'parashift/onlyoffice/onlyoffice-settings');
  }

  createNode(parentId: string, mimeType: string): Promise<{ nodeRef: string }> {
    return this.executeWebScript('GET', `parashift/onlyoffice/prepare?parentNodeRef=workspace://SpacesStore/${parentId}&new=${mimeType}`);
  }

  convertNode(nodeId: string) {
    return this.executeWebScript(
      'POST',
      'api/actionQueue',
      {
        async: false
      },
      'alfresco',
      'service',
      {
        actionDefinitionName: 'onlyoffice-convert',
        actionedUponNode: 'workspace://SpacesStore/' + nodeId,
        parameterValues: {}
      }
    );
  }

  downloadAs(items: { nodeRef: string; outputType: string }[]) {
    return this.executeWebScript('POST', 'parashift/onlyoffice/download-as', {}, 'alfresco', 'service', items);
  }

  saveAs(data: { title: string; ext: string; url: string; saveNode: string }) {
    return this.executeWebScript('POST', 'parashift/onlyoffice/editor-api/save-as', {}, 'alfresco', 'service', data);
  }
}
