import {defaultOptions} from './defaults';
import {FileWithContent, readHyperSchema, writeOutFiles} from './file-io';
import {generateApiHostInjectionToken, generateApiModule} from './generators/additional';
import {generateGatewayClassSource} from './generators/gateway-classes';
import {generateTransferObjectClassSource} from './generators/transfer-objects';
import {GeneratedCode, GeneratedGatewayClass} from './generators/types';
import {combineSourceWithImports} from './generators/util';
import {GeneratorOptions} from './options';
import {buildGatewayClass} from './preprocessing';
import {GatewayClass} from './type-model';
import {HyperSchema4} from './types/hyper-schema';

export async function generateGatewayFiles(
  hyperSchemaFile: string,
  outDir: string,
  options: GeneratorOptions = defaultOptions,
): Promise<void> {
  const hyperSchema = await readHyperSchema(hyperSchemaFile);

  const files = await generateGateways(hyperSchema, options);
  await writeOutFiles(outDir, files);
}

export async function generateGateways(
  hyperSchema: HyperSchema4,
  options: GeneratorOptions = defaultOptions,
): Promise<FileWithContent[]> {
  const gatewayClasses: GatewayClass[] = Object.entries(hyperSchema.properties)
    .map(([key, resource]) => buildGatewayClass(options, resource, key));

  const apiHostToken = generateApiHostInjectionToken();
  const generatedClasses: GeneratedCode[] = [apiHostToken];

  for (let gatewayClass of gatewayClasses) {
    const gatewayTypeDef = await generateGatewayClassSource(gatewayClass, apiHostToken, options);
    generatedClasses.push(gatewayTypeDef);

    for (let operation of gatewayClass.operations) {
      if (operation.response) {
        const responseTypeDef = await generateTransferObjectClassSource(operation.response, options.json2ts);
        generatedClasses.push(responseTypeDef);
        gatewayTypeDef.dependencies.push(responseTypeDef);
      }

      if (operation.request) {
        const requestTypeDef = await generateTransferObjectClassSource(operation.request, options.json2ts);
        generatedClasses.push(requestTypeDef);
        gatewayTypeDef.dependencies.push(requestTypeDef);
      }
    }
  }

  generatedClasses.push(
    generateApiModule(options.moduleName, apiHostToken, generatedClasses.filter((c) => c.type === 'gateway') as GeneratedGatewayClass[])
  );

  return buildFileSet(options, generatedClasses);
}

export function buildFileSet(
  options: GeneratorOptions,
  generatedClasses: GeneratedCode[],
): FileWithContent[] {
  return generatedClasses.map((gateway) => {
    const targetPath = options.getTargetPath(gateway);

    return {
      path: targetPath,
      name: options.buildFileName(gateway.nameOfClass),
      content: combineSourceWithImports(options, gateway, targetPath),
    };
  });
}
