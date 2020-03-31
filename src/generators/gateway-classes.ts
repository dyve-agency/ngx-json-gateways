import {GeneratorOptions} from '../options';
import {GatewayClass} from '../type-model';
import {defaultDependencies} from './dependencies';
import {generateOperationMethodSource} from './operation-methods';
import {GeneratedAdditional, GeneratedGatewayClass} from './types';

export async function generateGatewayClassSource(
  gatewayClass: GatewayClass,
  apiHostToken: GeneratedAdditional,
  options: GeneratorOptions,
): Promise<GeneratedGatewayClass> {
  const methodSources = gatewayClass.operations.map((operation) => generateOperationMethodSource(operation));
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
