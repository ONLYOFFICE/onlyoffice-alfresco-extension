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

import { AcaRuleContext, canCreateFolder, hasFileSelected, hasLockedFiles, isTrashcan } from '@alfresco/aca-shared/rules';
import { RuleContext } from '@alfresco/adf-extensions';
import { Node } from '@alfresco/js-api';

import { getConvertExtensions, getOnlyofficeAlfrescoExtensionSettings } from '../configuration/onlyoffice-alfrsco-extension.config';

const ASPECT_WORKING_COPY = 'cm:workingcopy';
const ASPECT_EDITING_IN_ONLYOFFICE_DOCS = 'od:editingInOnlyofficeDocs';

export const displayViewAction = (context: RuleContext): boolean => {
  const node = context.selection.first?.entry;

  if (!node) {
    return false;
  }

  return hasFileSelected(context) && _isViewable(node) && !displayEditAction(context) && !isTrashcan(context);
};

export const displayEditAction = (context: RuleContext): boolean => {
  const node = context.selection.first?.entry;

  if (!node) {
    return false;
  }

  return (
    hasFileSelected(context) &&
    _isEditable(node) &&
    _hasPermissions(context, node, ['update']) &&
    !_hasAspect(node, ASPECT_WORKING_COPY) &&
    (!hasLockedFiles(context) || _hasAspect(node, ASPECT_EDITING_IN_ONLYOFFICE_DOCS)) &&
    !isTrashcan(context)
  );
};

export const displayConvertAction = (context: RuleContext): boolean => {
  const node = context.selection.first?.entry;

  if (!node) {
    return false;
  }

  return (
    hasFileSelected(context) &&
    _isConvertible(node) &&
    _hasConvertPermission(context, node) &&
    !_hasAspect(node, ASPECT_WORKING_COPY) &&
    !hasLockedFiles(context) &&
    !isTrashcan(context)
  );
};

export const displayDownloadAsAction = (context: RuleContext) => {
  if (isTrashcan(context)) {
    return false;
  }

  let hasSupportedFiles = false;

  context.selection.nodes.forEach((nodeEntry) => {
    const isFile = nodeEntry.entry.isFile;

    if (isFile) {
      const name = nodeEntry.entry.name;
      const extension = name.split('.').pop()?.toLowerCase();
      const outputTypes = getConvertExtensions(extension || '');

      if (outputTypes.length > 0) {
        hasSupportedFiles = true;
        return;
      }
    }
  });

  return hasSupportedFiles;
};

export const disabledViewer = (): boolean => {
  const settings = getOnlyofficeAlfrescoExtensionSettings();

  if (!settings?.previewEnabled) {
    return true;
  }

  return false;
};

const _isViewable = (node: Node): boolean => {
  const fileName = node.name;
  const settings = getOnlyofficeAlfrescoExtensionSettings();

  if (fileName != null && settings?.supportedFormats) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    return settings.supportedFormats.some((format) => {
      return format.name === fileExtension && format.actions.includes('view');
    });
  }

  return false;
};

const _isEditable = (node: Node): boolean => {
  const fileName = node.name;
  const settings = getOnlyofficeAlfrescoExtensionSettings();

  if (fileName != null && settings?.supportedFormats) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    return _getEditableFormats().includes(fileExtension || '');
  }

  return false;
};

const _isConvertible = (node: Node): boolean => {
  const fileName = node.name;
  const settings = getOnlyofficeAlfrescoExtensionSettings();

  if (fileName != null && settings?.supportedFormats) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    return settings.supportedFormats.some((format) => {
      if (format.name === fileExtension && format.type != null) {
        switch (format.type) {
          case 'WORD':
            return format.convert.includes('docx');
          case 'CELL':
            return format.convert.includes('xlsx');
          case 'SLIDE':
            return format.convert.includes('pptx');
          default:
            return false;
        }
      }

      return false;
    });
  }

  return false;
};

const _hasConvertPermission = (context: RuleContext, node: Node) => {
  const settings = getOnlyofficeAlfrescoExtensionSettings();

  if (settings?.convertOriginal) {
    return _hasPermissions(context, node, ['update']);
  } else {
    return canCreateFolder(context as AcaRuleContext);
  }
};

const _hasAspect = (node: Node, aspect: string): boolean => {
  const nodeAspects = node.aspectNames ?? [];

  return nodeAspects.includes(aspect);
};

const _hasPermissions = (context: RuleContext, node: Node, permissions: string[]) => {
  return context.permissions.check(node, permissions);
};

const _getEditableFormats = (): string[] => {
  const settings = getOnlyofficeAlfrescoExtensionSettings();
  const editableFormats: string[] = [];

  if (settings?.supportedFormats) {
    Object.entries(settings.editableFormats).forEach(([key, value]) => {
      if (value) {
        editableFormats.push(key);
      }
    });

    Object.values(settings.supportedFormats).forEach((value) => {
      if (value.actions.includes('edit')) {
        editableFormats.push(value.name);
      }
    });
  }

  return editableFormats;
};
