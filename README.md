# Some name

some description.




## Installation

1. Install @onlyoffice/alfresco-extension it using the standard command: 

```sh
npm install @onlyoffice/alfresco-extension
```

2. Edit the `project.json` configuration file and add the following rule:

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

3. In the main application, edit the `src/app/extensions.module.ts` file and append the module declaration as in the next example:

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
