import {GeneratedAdditional} from './types';

export function generateApiHostInjectionToken(): GeneratedAdditional {
  return {
    dependencies: [{type: 'external', source: '@angular/core', name: 'InjectionToken'}],
    generatedSource: 'export const API_HOST = new InjectionToken("API HOST");',
    nameOfClass: 'API_HOST',
    type: 'code',
  };
}
