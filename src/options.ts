import {Options} from 'json-schema-to-typescript';
import {GeneratedCode} from './generators/types';
import {HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';

export interface GeneratorOptions {
  json2ts: Partial<Options>;

  buildOperationMethodName(resource: HyperSchemaResource4, key: string, link: HyperSchemaLink4, simplifiedHref: string): string;
  buildGatewayClassName(resource: HyperSchemaResource4, key: string): string;
  buildResponseClassName(resource: HyperSchemaResource4, key: string, link: HyperSchemaLink4, simplifiedHref: string): string;
  buildRequestClassName(resource: HyperSchemaResource4, key: string, link: HyperSchemaLink4, simplifiedHref: string): string;
  buildFileName(nameOfClass: string): string;
  getTargetPath(generated: GeneratedCode): string[];
}
