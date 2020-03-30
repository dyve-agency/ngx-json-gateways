import {promises as fs} from 'fs';
import {DEFAULT_OPTIONS} from 'json-schema-to-typescript';
import {format} from 'json-schema-to-typescript/dist/src/formatter';
import {defaultOptions} from './defaults';
import {
  Dependency,
  generateApiHostInjectionToken,
  GeneratedCode,
  GeneratedType,
  generateGatewayTypeSource,
  generateImports,
  generateResponseType,
  getImport,
} from './generators';
import {GeneratorOptions} from './options';
import {GatewayClass, GatewayOperation, ResponseTypeDescriptor} from './type-model';
import {HyperSchema4, HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';
import {assertDefined, inspect} from './util/misc';

const DEFAULT_ENCODING = 'utf8';

export function buildGatewayClass(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
): GatewayClass {
  return {
    nameOfClass: options.buildGatewayClassName(resource, key),
    resource,
    operations: resource.links.map((link) => buildGatewayOperation(options, resource, key, link)),
  };
}

export function buildResponseType(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): undefined | ResponseTypeDescriptor {
  if (!link.targetSchema) return;

  return {
    nameOfClass: options.buildResponseClassName(resource, key, link),
    schema: link.targetSchema,
    resource,
    link,
  };
}

export function buildGatewayOperation(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): GatewayOperation {
  const href = assertDefined(link.href, `href missing in ${inspect(link)}`);
  const httpVerb = assertDefined(link.method, `method missing in ${inspect(link)}`).toLowerCase();
  const nameOfMethod = options.buildOperationMethodName(resource, key, link);

  return {
    resource,
    link,
    key,
    href,
    nameOfMethod,
    httpVerb,
    response: buildResponseType(options, resource, key, link),
  };
}

export interface FileWithContent {
  name: string;
  path: string[];
  content: string;
}

export async function generateGatewayFiles(
  hyperSchemaFile: string,
  outDir: string,
  options: GeneratorOptions = defaultOptions,
): Promise<void> {
  const hyperSchema = JSON.parse((await fs.readFile(hyperSchemaFile, DEFAULT_ENCODING))) as HyperSchema4;

  const files = await generateGateways(hyperSchema, options);

  for (let file of files) {
    await writeOutFile(outDir, file);
  }
}

export async function writeOutFile(outDir: string, file: FileWithContent): Promise<void> {
  const path = [outDir, ...file.path].join('/');
  await fs.mkdir(path, {recursive: true});
  await fs.writeFile([path, file.name + '.ts'].join('/'), file.content, DEFAULT_ENCODING);
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
    const gatewayTypeDef = await generateGatewayTypeSource(gatewayClass, apiHostToken, options);
    generatedClasses.push(gatewayTypeDef);

    for (let operation of gatewayClass.operations) {
      if (operation.response) {
        const responseTypeDef = await generateResponseType(operation.response, options.json2ts);
        generatedClasses.push(responseTypeDef);
        gatewayTypeDef.dependencies.push(responseTypeDef);
      }
    }
  }

  return Array.from(buildFileSet(options, generatedClasses));
}

export function generateAllImports(
  options: GeneratorOptions,
  dependencies: Dependency[],
  targetPath: string[],
): string {
  return generateImports(
    dependencies.map((dep) => getImport(options, dep, targetPath)),
  );
}

export function formatCode(options: GeneratorOptions, code: string): string {
  return format(code, {...DEFAULT_OPTIONS, ...options.json2ts});
}

export function combine(options: GeneratorOptions, generated: GeneratedType, targetPath: string[]): string {
  return formatCode(
    options,
    generateAllImports(options, generated.dependencies, targetPath) + generated.generatedSource,
  );
}

export function* buildFileSet(
  options: GeneratorOptions,
  generatedClasses: GeneratedCode[],
): Generator<FileWithContent> {
  for (const gateway of generatedClasses) {
    const targetPath = options.getTargetPath(gateway);
    yield {
      path: targetPath,
      name: options.buildFileName(gateway.nameOfClass),
      content: combine(options, gateway, targetPath),
    };
  }
}
