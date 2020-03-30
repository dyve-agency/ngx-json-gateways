import {compile, Options} from 'json-schema-to-typescript';
import {GeneratorOptions} from '../options';
import {GatewayClass, GatewayOperation, ResponseTypeDescriptor} from '../type-model';
import {relativePath} from '../util/paths';

export interface GeneratedType {
  readonly dependencies: Dependency[];
  readonly nameOfClass: string;
  readonly generatedSource: string;
}

export interface ExternalDependency {
  type: 'external';
  readonly name: string;
  readonly source: string;
}

export interface GeneratedAdditional extends GeneratedType {
  type: 'code';
}

export interface GeneratedTransferObject extends GeneratedType {
  type: 'transfer-object';
  source: ResponseTypeDescriptor;
}

export interface GeneratedGatewayClass extends GeneratedType {
  type: 'gateway';
  source: GatewayClass;
}

export type Dependency = ExternalDependency | GeneratedTransferObject | GeneratedAdditional;
export type GeneratedCode = GeneratedAdditional | GeneratedTransferObject | GeneratedGatewayClass;

export async function generateResponseType(
  response: ResponseTypeDescriptor,
  options: Partial<Options>,
): Promise<GeneratedTransferObject> {
  const responseTypeDef = await compile(
    response.schema,
    response.nameOfClass,
    options,
  );

  return {
    type: 'transfer-object',
    source: response,
    nameOfClass: response.nameOfClass,
    dependencies: [],
    generatedSource: responseTypeDef,
  };
}

export function generateApiHostInjectionToken(): GeneratedAdditional {
  return {
    dependencies: [{type: 'external', source: '@angular/core', name: 'InjectionToken'}],
    generatedSource: 'export const API_HOST = new InjectionToken("API HOST");',
    nameOfClass: 'API_HOST',
    type: 'code',
  };
}

export function getImport(options: GeneratorOptions, dependency: Dependency, targetPath: string[]): [string, string] {
  switch (dependency.type) {
    case 'external':
      return [dependency.name, dependency.source];
    case 'code':
    case 'transfer-object':
      const localPath = targetPath.join('/');
      const fileName = options.buildFileName(dependency.nameOfClass);
      const dependencyPath = [...options.getTargetPath(dependency), fileName].join('/');
      let fullPath = relativePath(localPath, dependencyPath);

      return [dependency.nameOfClass, fullPath];
  }
}

export function generateImports(imports: [string, string][]): string {
  return imports
    .map(([type, source]) => `import {${type}} from '${source}';`)
    .join('\n');
}

function generateMethodSource(operation: GatewayOperation): string {
  const returnType = `HttpResponse<${operation.response?.nameOfClass || '{}'}>`;
  return `
    ${operation.nameOfMethod}(
      options?: Parameters<HttpClient['request']>[2],
    ): Observable<${returnType}> 
    {
      return this._httpClient.request(
        ${JSON.stringify(operation.httpVerb)},
        ${JSON.stringify(operation.href)},
        options,
      );
    }
  `;
}

const defaultDependencies: ExternalDependency[] = [
  {type: 'external', name: 'Observable', source: 'rxjs'},
  {type: 'external', name: 'HttpClient', source: '@angular/common/http'},
  {type: 'external', name: 'HttpResponse', source: '@angular/common/http'},
  {type: 'external', name: 'Inject', source: '@angular/core'},
  {type: 'external', name: 'Injectable', source: '@angular/core'},
];

export async function generateGatewayTypeSource(
  gatewayClass: GatewayClass,
  apiHostToken: GeneratedAdditional,
  options: GeneratorOptions,
): Promise<GeneratedGatewayClass> {
  const methodSources = gatewayClass.operations.map((operation) => generateMethodSource(operation));
  const gatewaySource = `
    @Injectable()
    export class ${gatewayClass.nameOfClass} {
      constructor(
        private readonly _httpClient: HttpClient,
        @Inject(${apiHostToken.nameOfClass}) private readonly _apiHost: string,
      ) { }
        
      ${methodSources.join('\n')}
    }
  `;

  return Promise.resolve({
    type: 'gateway',
    dependencies: [
      ...defaultDependencies,
      apiHostToken,
    ],
    generatedSource: gatewaySource,
    nameOfClass: gatewayClass.nameOfClass,
    source: gatewayClass,
  });
}
