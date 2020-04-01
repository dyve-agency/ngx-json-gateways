import {sync as glob} from 'glob';
import {FileInfo, ResolverOptions, dereference} from 'json-schema-ref-parser';
import {defaultOptions} from './defaults';
import {FileWithContent, readHyperSchema, readSchema, writeOutFile, writeOutFiles} from './file-io';
import {generateApiHostInjectionToken, generateApiModule} from './generators/additional';
import {generateGatewayClassSource} from './generators/gateway-classes';
import {generateTransferObjectClassSource} from './generators/transfer-objects';
import {GeneratedCode, GeneratedGatewayClass} from './generators/types';
import {combineSourceWithImports} from './generators/util';
import {GeneratorOptions} from './options';
import {buildGatewayClass} from './preprocessing';
import {GatewayClass} from './type-model';
import {HyperSchema4} from './types/hyper-schema';

export class LocalHttpResolver implements ResolverOptions {
  order = 1;

  constructor(private _filesByUrls: Record<string, string>) {
  }

  canRead = (file: FileInfo) => {
    return !!this._filesByUrls[file.url];
  };
  read = (file: FileInfo) => {
    const schema = this._filesByUrls[file.url];

    if(schema) return schema;

    throw new Error('Schema not found');
  };

  static async forFiles(files: string[]): Promise<LocalHttpResolver> {
    const promises = files.map(async(file) => {
      const schema = await readSchema(file);

      const id = schema.id && schema.id.endsWith('#') ? schema.id.slice(0, -1) : schema.id;
      return [id, JSON.stringify(schema)];
    });

    const fileContentsById = await Promise.all(promises);

    return new LocalHttpResolver(Object.fromEntries(fileContentsById));
  }
}

export async function generateResolvedSchema(
  schemaFile: string,
  outDir: string,
  outFile: string,
  localSources: string[],
): Promise<void> {
  const schema = await readHyperSchema(schemaFile);

  const resolved = await resolveRefs(schema, localSources);

  return await writeOutFile(outDir, {name: outFile, extension: 'json', path: [], content: JSON.stringify(resolved, null, 2)});
}

export async function resolveRefs(schema: HyperSchema4, localSources: string[]): Promise<HyperSchema4> {
  const files = localSources.flatMap((source) => glob(source));
  const resolver = await LocalHttpResolver.forFiles(files);

  // @ts-ignore
  return await dereference(schema, {resolve: {http: false, locale: resolver}});
}

export async function generateGatewayFiles(
  hyperSchemaFile: string,
  outDir: string,
  options: GeneratorOptions = defaultOptions,
): Promise<void> {
  const hyperSchema = await readHyperSchema(hyperSchemaFile);

  const combined = await resolveRefs(hyperSchema, options.localSources);

  const files = await generateGateways(combined, options);
  await writeOutFiles(outDir, files);

  console.log(`Generated Angular gateways and ${options.moduleName} in ${outDir}`);
}

export async function generateGateways(
  hyperSchema: HyperSchema4,
  options: GeneratorOptions = defaultOptions,
): Promise<FileWithContent[]> {
  const gatewayClasses: GatewayClass[] = Object.entries(options.preprocessSchema(hyperSchema).properties)
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
    generateApiModule(
      options.moduleName,
      apiHostToken,
      generatedClasses.filter((c) => c.type === 'gateway') as GeneratedGatewayClass[],
    ),
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
      extension: 'ts',
    };
  });
}
