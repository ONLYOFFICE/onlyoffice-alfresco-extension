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

import { AcaRuleContext, canCreateFolder, hasFileSelected, hasLockedFiles, isTrashcan } from '@alfresco/aca-shared/rules';
import { RuleContext } from '@alfresco/adf-extensions';
import { Node } from '@alfresco/js-api';

import { getOnlyofficeAlfrescoExtensionSettings } from '../configuration/onlyoffice-alfrsco-extension.config';

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
