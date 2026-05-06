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

import { WebscriptApi } from '@alfresco/js-api';

export class OnlyofficeApi extends WebscriptApi {
  getEditorConfig(nodeId: string, preview = false) {
    return this.executeWebScript('GET', 'parashift/onlyoffice/prepare?nodeRef=workspace://SpacesStore/' + nodeId + '&preview=' + preview);
  }

  getShareEditorConfig(sharedId: string) {
    return this.executeWebScript('GET', 'parashift/onlyoffice/prepare-quick-share?sharedId=' + sharedId);
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
