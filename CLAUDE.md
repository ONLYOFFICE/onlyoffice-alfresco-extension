# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@onlyoffice/alfresco-extension` is an Angular library that integrates ONLYOFFICE Docs into Alfresco Content App (ACA). It is distributed as an npm package and must be consumed by a host ACA application — it is not a standalone app.

The library lives at the root of this repo (not in a `projects/` subdirectory). Source is in `src/`, built output goes to `../../dist/projects/onlyoffice-alfresco-extension` (relative to the workspace root).

## Build & Lint Commands

This project is part of an Nx monorepo workspace. All commands must be run from the **workspace root** (parent of this directory), not from this directory.

```bash
# Build
nx build @onlyoffice/alfresco-extension
nx build @onlyoffice/alfresco-extension --configuration=production  # default

# Lint
nx lint @onlyoffice/alfresco-extension

# Publish (after build)
nx nx-release-publish @onlyoffice/alfresco-extension
```

There are no unit tests configured for this library.

## Architecture

### Entry Point & Bootstrap

`src/lib/onlyoffice-alfresco-extension.module.ts` is the primary entry point. It exports `provideOnlyofficeAlfrescoExtension()`, an Angular provider function (not an NgModule) that registers:
- Extension config manifest (`onlyoffice-alfresco-extension.json`)
- Components (`EditorComponent`, `ViewerComponent`) and rule evaluators via `provideExtensions()`
- NgRx effects (`OnlyofficeAlfrescoExtensionEffects`)
- i18n translations
- An app initializer that fetches server settings on startup

The legacy `OnlyofficeAlfrescoExtensionModule` wraps these providers and is deprecated.

### Server Settings & Format Support

`src/lib/configuration/onlyoffice-alfrsco-extension.config.ts` (note the typo: `alfrsco`) fetches settings from the Alfresco webscript `alfresco/service/parashift/onlyoffice/onlyoffice-settings` on init and caches them in a module-level variable `settings`. This object drives all format decisions:

- `supportedFormats: Format[]` — which file extensions can be viewed/edited/converted
- `editableFormats: Record<string, boolean>` — per-extension edit override flags
- `convertOriginal: boolean` — whether convert replaces the original file or creates a new one
- `previewEnabled: boolean` — whether the viewer integration is active

All rule evaluators in `src/lib/rules/` read from this cached settings object.

### NgRx Actions & Effects

Actions (`src/lib/actions/onlyoffice-alfresco-extension.actions.ts`) use the class-based pattern (not `createAction`):
- `OpenRoute`, `OpenCreateFileDialog`, `OpenConvertFileDialog`, `OpenDownloadAsDialog`, `OpenSaveAsDialog` — UI triggers
- `CreateFile`, `ConvertFile` — async operations handled in effects

Effects (`src/lib/effects/onlyoffice-alfresco-extension.effects.ts`) handle dialog opening, API calls, and routing.

### API Layer

`src/lib/api/onlyoffice.api.ts` — `OnlyofficeApi extends WebscriptApi` — communicates with Alfresco via webscripts under the `parashift/onlyoffice/` path. Key methods:
- `getEditorConfig(nodeId, preview?)` — fetch config for editing/viewing a node
- `getShareEditorConfig(sharedId)` — for shared (public) links
- `createNode(parentId, mimeType)` — create a new blank document
- `convertNode(nodeId)` — convert to OOXML via Alfresco action queue
- `downloadAs(items)` — download nodes in alternate formats
- `saveAs(data)` — save a copy from editor

### Extension Rules

`src/lib/rules/onlyoffice-alfresco-extension.rules.ts` — evaluators registered in the ADF extension system:

| Evaluator | Condition |
|---|---|
| `displayViewAction` | File has a viewable extension AND edit is not applicable AND not in trash |
| `displayEditAction` | File has an editable extension + user has `update` permission + not a working copy + not locked (unless editing in ONLYOFFICE) + not in trash |
| `displayConvertAction` | File can convert to OOXML + appropriate permissions + not working copy/locked/trash |
| `displayDownloadAsAction` | At least one selected file has convertible output types + not in trash |
| `disabledViewer` | `previewEnabled` is false |

Two custom Alfresco aspects are used: `cm:workingcopy` and `od:editingInOnlyofficeDocs`.

### Extension Manifest

`assets/onlyoffice-alfresco-extension.json` — the ADF extension manifest that wires up toolbar buttons, context menu items, viewer integration, and routes. This is copied to the consuming app's `assets/plugins/` folder.

## Code Conventions

### License Header

Every `.ts` source file must begin with the GPL-3.0 header comment. This is enforced by ESLint (`license-header/header` rule). The header template is in `.config/source-license-header.js`.

### Selectors & Naming

- Component selector prefix: `onlyoffice-alfresco-extension-` (kebab-case)
- Directive selector prefix: `lib` (camelCase)
- File naming: `*.component.ts`, `*.dialog.ts`, `*.service.ts`, `*.effects.ts`, `*.actions.ts`, `*.rules.ts`

### Import Order (ESLint-enforced)

Imports must be ordered and separated by blank lines:
1. `@angular/**` (before other externals)
2. Other external packages
3. Internal/relative imports

Alphabetical order within each group.

### TypeScript

Strict mode is enabled (`noImplicitAny`, `strictNullChecks`, `strictTemplates`). Target is `es2022`.
