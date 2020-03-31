import {GeneratedAdditional, GeneratedGatewayClass} from './types';

export function generateApiHostInjectionToken(): GeneratedAdditional {
  return {
    dependencies: [{type: 'external', source: '@angular/core', name: 'InjectionToken'}],
    generatedSource: 'export const API_HOST = new InjectionToken("API HOST");',
    nameOfClass: 'API_HOST',
    type: 'code',
  };
}

export function generateApiModule(moduleName: string, apiHost: GeneratedAdditional, gateways: GeneratedGatewayClass[]): GeneratedAdditional {
  const generatedSource = `
    @NgModule({
      imports: [
        CommonModule,
        HttpClientModule,
      ],
      providers: [
        ${gateways.map((g) => g.nameOfClass + ',').join('\n')}
      ],
    })
    export class ${moduleName} {
      static forRoot(apiHost: string): ModuleWithProviders<${moduleName}> {
        return {
          ngModule: ${moduleName},
          providers: [
            {provide: ${apiHost.nameOfClass}, useValue: apiHost},
          ],
        };
      }
    }
  `;

  return {
    dependencies: [
      {type: 'external', source: '@angular/core', name: 'NgModule'},
      {type: 'external', source: '@angular/core', name: 'ModuleWithProviders'},
      {type: 'external', source: '@angular/common', name: 'CommonModule'},
      {type: 'external', source: '@angular/common/http', name: 'HttpClientModule'},
      apiHost,
      ...gateways,
    ],
    nameOfClass: moduleName,
    type: 'code',
    generatedSource,
  };
}
