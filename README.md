# ONLYOFFICE extension for Alfresco Content App

Welcome to the official repository for the ONLYOFFICE extension for Alfresco Content App!

Edit, co-author, and manage office files right inside [Alfresco Content App](https://github.com/Alfresco/alfresco-content-app) using [ONLYOFFICE Docs](https://www.onlyoffice.com/docs). Open documents, spreadsheets, presentations, and PDFs stored in Alfresco — edit them in-place and keep your content in sync.

## Features ✨

- **Open & edit inside Alfresco:** Launch ONLYOFFICE editors directly from the file list or context menu.
- **Real-time co-editing:** Collaborate with colleagues using Fast and Strict modes, plus track changes, comments, and built-in chat.
- **Create new documents:** Create DOCX, XLSX, PPTX, and PDF files directly within Alfresco.
- **Convert documents:** Convert files to OOXML formats in one click.
- **Download As:** Export files to alternate formats without leaving Alfresco.
- **Wide format support:** View and edit popular office formats (determined by the installed backend version).
- **Secure connections:** JWT token protection is used for authenticated, safe access.

## Requirements

Before installing this extension, make sure the following are in place:

- **[Alfresco Content Services](https://www.alfresco.com/ecm-software/alfresco-content-services)** — the Alfresco repository backend.
- **[Alfresco Content App (ACA)](https://github.com/Alfresco/alfresco-content-app)** — the host Angular application.
- **[ONLYOFFICE module package for Alfresco](https://github.com/ONLYOFFICE/onlyoffice-alfresco) ≥ 8.3.0** — the backend Alfresco repository add-on that provides the webscripts this extension communicates with.
- **[ONLYOFFICE Docs](https://www.onlyoffice.com/docs)** (Document Server) — Community Edition, Enterprise Edition, or Cloud.

## Supported formats 📚

The exact list of supported formats is determined by the backend ([ONLYOFFICE integration for Alfresco](https://github.com/ONLYOFFICE/onlyoffice-alfresco)) and may vary depending on the version installed.

## Installing ONLYOFFICE Docs

To be able to edit documents in Alfresco Content App, you will need an instance of [ONLYOFFICE Docs](https://www.onlyoffice.com/docs) (Document Server). You can install free Community version or scalable Enterprise Edition.

To install **free Community version**, use [Docker](https://github.com/onlyoffice/Docker-DocumentServer) (recommended) or follow [these instructions](https://helpcenter.onlyoffice.com/docs/installation/docs-community-install-ubuntu.aspx) for Debian, Ubuntu, or derivatives.

To install **Enterprise Edition**, follow instructions [here](https://helpcenter.onlyoffice.com/docs/installation/enterprise).

Community Edition vs Enterprise Edition comparison can be found [here](#onlyoffice-docs-editions).

Alternatively, you can opt for **ONLYOFFICE Docs Cloud** which doesn't require downloading and installation. To get ONLYOFFICE Docs Cloud, get started [here](https://www.onlyoffice.com/docs-registration).

## Installing ONLYOFFICE extension for Alfresco Content App

### Option 1: Install from npm

1. Install the package:

```sh
npm install @onlyoffice/alfresco-extension
```

2. Edit the `project.json` configuration file of your ACA application and add the following asset rules:

```json
{
  "glob": "onlyoffice-alfresco-extension.json",
  "input": "node_modules/@onlyoffice/alfresco-extension/assets",
  "output": "./assets/plugins"
},
{
  "glob": "**/*",
  "input": "node_modules/@onlyoffice/alfresco-extension/assets",
  "output": "./assets/onlyoffice-alfresco-extension"
}
```

3. In the main application, edit the `src/app/extensions.module.ts` file and register the extension providers:

```typescript
import { provideOnlyofficeAlfrescoExtension } from '@onlyoffice/alfresco-extension';

export function provideApplicationExtensions(): (Provider | EnvironmentProviders)[] {
  return [
    ...provideOnlyofficeAlfrescoExtension(),
  ];
}

@NgModule({
  providers: [...provideApplicationExtensions()]
})
export class AppExtensionsModule {}
```

4. Run the application:

```sh
npm run start
```

### Option 2: Install from GitHub

1. Register the library in your ACA Nx workspace:

```sh
npx nx generate @nx/angular:library --name=@onlyoffice/alfresco-extension --buildable=true --directory=projects/onlyoffice-alfresco-extension --importPath=@onlyoffice/alfresco-extension --unitTestRunner=none --no-interactive
```

2. Replace the generated library directory with the cloned repository:

```sh
rm -rf projects/onlyoffice-alfresco-extension
git clone https://github.com/ONLYOFFICE/onlyoffice-alfresco-extension.git projects/onlyoffice-alfresco-extension
```

3. Install the `@onlyoffice/document-editor-angular` package using a version that matches your Angular framework version (see the [compatibility matrix](https://github.com/ONLYOFFICE/document-editor-angular-workspace/tree/master/projects/onlyoffice/document-editor-angular#versions)). For example, for Angular 19:

```sh
npm install @onlyoffice/document-editor-angular@6.5.1
```

4. Edit the `project.json` configuration file of your ACA application and add the following asset rules:

```json
{
  "glob": "onlyoffice-alfresco-extension.json",
  "input": "projects/onlyoffice-alfresco-extension/assets",
  "output": "./assets/plugins"
},
{
  "glob": "**/*",
  "input": "projects/onlyoffice-alfresco-extension/assets",
  "output": "./assets/onlyoffice-alfresco-extension"
}
```

5. In the main application, edit the `src/app/extensions.module.ts` file and register the extension providers:

```typescript
import { provideOnlyofficeAlfrescoExtension } from '@onlyoffice/alfresco-extension';

export function provideApplicationExtensions(): (Provider | EnvironmentProviders)[] {
  return [
    ...provideOnlyofficeAlfrescoExtension(),
  ];
}

@NgModule({
  providers: [...provideApplicationExtensions()]
})
export class AppExtensionsModule {}
```

6. Run the application:

```sh
npm run start
```

## App usage

Once installed, the extension adds the following actions to the Alfresco Content App UI:

- **Edit in ONLYOFFICE:** Right-click a supported file (or use the toolbar) and select **Edit in ONLYOFFICE** to open the document in the full ONLYOFFICE editor.
- **View in ONLYOFFICE:** For view-only formats, select **View in ONLYOFFICE** to open a read-only preview.
- **Create in ONLYOFFICE:** Use the **Create** toolbar menu and choose **Create in ONLYOFFICE** to create a new blank document, spreadsheet, or presentation.
- **Convert in ONLYOFFICE:** Select **Convert in ONLYOFFICE** to convert a file to its OOXML equivalent.
- **Download As:** Select **Download As** to export a file in an alternate format.

> **Note:** Actions are only shown for formats supported by the installed backend version of ONLYOFFICE integration for Alfresco.

## ONLYOFFICE Docs editions

ONLYOFFICE offers different versions of its online document editors that can be deployed on your own servers.

**ONLYOFFICE Docs** packaged as Document Server:

* Community Edition 🆓 (`onlyoffice-documentserver` package)
* Enterprise Edition 🏢 (`onlyoffice-documentserver-ee` package)

The table below will help you to make the right choice.

| Pricing and licensing | Community Edition | Enterprise Edition |
| ------------- | ------------- | ------------- |
| | [Get it now](https://www.onlyoffice.com/download-community?utm_source=github&utm_medium=cpc&utm_campaign=GitHubAlfrescoExtension#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download?utm_source=github&utm_medium=cpc&utm_campaign=GitHubAlfrescoExtension#docs-enterprise)  |
| Cost  | FREE  | [Go to the pricing page](https://www.onlyoffice.com/docs-enterprise-prices?utm_source=github&utm_medium=cpc&utm_campaign=GitHubAlfrescoExtension)  |
| Number of users | up to 20 recommended | As in chosen pricing plan |
| License | GNU AGPL v.3 | Proprietary |
| **Support** | **Community Edition** | **Enterprise Edition** |
| Documentation | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/community) | [Help Center](https://helpcenter.onlyoffice.com/docs/installation/enterprise) |
| Standard support | [GitHub](https://github.com/ONLYOFFICE/DocumentServer/issues) or [Community](https://community.onlyoffice.com/) | 1 or 3 years support included |
| Premium support | [Contact us](mailto:sales@onlyoffice.com) | [Contact us](mailto:sales@onlyoffice.com) |
| **Services** | **Community Edition** | **Enterprise Edition** |
| Conversion Service                | + | + |
| Live Viewer                       | + | + |
| Document Builder Service          | - | - |
| Automation API                    | - | - |
| **Interface** | **Community Edition** | **Enterprise Edition** |
| Tabbed interface                  | + | + |
| Dark theme                        | + | + |
| 125%, 150%, 175%, 200% scaling    | + | + |
| White Label                       | - | - |
| Integrated test example (node.js) | + | + |
| Admin Panel                       | - | + |
| Mobile web editors                | - | +* |
| **Plugins & Macros** | **Community Edition** | **Enterprise Edition** |
| Plugins                           | + | + |
| Macros                            | + | + |
| **Collaborative capabilities** | **Community Edition** | **Enterprise Edition** |
| Two co-editing modes              | + | + |
| Comments                          | + | + |
| Built-in chat                     | + | + |
| Review and tracking changes       | + | + |
| Display modes of tracking changes | + | + |
| Version history                   | + | + |
| **Document Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Adding Content control          | + | + |
| Editing Content control         | + | + |
| Layout tools                    | + | + |
| Table of contents               | + | + |
| Navigation panel                | + | + |
| Mail Merge                      | + | + |
| Comparing documents             | + | + |
| Multipage View                  | + | + |
| **Spreadsheet Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Functions, formulas, equations  | + | + |
| Table templates                 | + | + |
| Pivot tables                    | + | + |
| Data validation                 | + | + |
| Conditional formatting          | + | + |
| Sparklines                      | + | + |
| Sheet Views                     | + | + |
| Solver                          | + | + |
| **Presentation Editor features** | **Community Edition** | **Enterprise Edition** |
| Font and paragraph formatting   | + | + |
| Object insertion                | + | + |
| Transitions                     | + | + |
| Animations                      | + | + |
| Presenter mode                  | + | + |
| Notes                           | + | + |
| Slide Master                    | + | + |
| **Form creator features** | **Community Edition** | **Enterprise Edition** |
| Adding form fields              | + | + |
| Form preview                    | + | + |
| Saving as PDF                   | + | + |
| Role-matching colors for fields | + | + |
| **PDF Editor features**      | **Community Edition** | **Enterprise Edition** |
| Text editing and co-editing                                | + | + |
| Work with pages (adding, deleting, rotating)               | + | + |
| Inserting objects (shapes, images, hyperlinks, etc.)       | + | + |
| Text annotations (highlight, underline, cross out, stamps) | + | + |
| Redact                          | + | + |
| Comments                        | + | + |
| Freehand drawings               | + | + |
| Form filling                    | + | + |
| | [Get it now](https://www.onlyoffice.com/download-community?utm_source=github&utm_medium=cpc&utm_campaign=GitHubAlfrescoExtension#docs-community)  | [Start Free Trial](https://www.onlyoffice.com/download?utm_source=github&utm_medium=cpc&utm_campaign=GitHubAlfrescoExtension#docs-enterprise)  |

\* If supported by DMS.

## Need help? User Feedback and Support 💡

* **🐞 Found a bug?** Please report it by creating an [issue](https://github.com/ONLYOFFICE/onlyoffice-alfresco-extension/issues).
* **❓ Have a question?** Ask our community and developers on the [ONLYOFFICE Forum](https://community.onlyoffice.com).
* **👨‍💻 Need help for developers?** Check our [API documentation](https://api.onlyoffice.com).

---
<p align="center">
  Made with ❤️ by the <a href="https://www.onlyoffice.com/">ONLYOFFICE Team</a>
</p>