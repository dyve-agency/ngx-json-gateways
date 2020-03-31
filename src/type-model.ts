import {JSONSchema4} from 'json-schema';
import {HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';

export interface TransferObjectDescriptor {
  nameOfClass: string;
  schema: JSONSchema4;
  resource: HyperSchemaResource4;
  link: HyperSchemaLink4;
}

export interface InterpolatedHref {
  href: string;
  simplifiedHref: string;
  typescriptHref: string;
}

export interface GatewayOperation {
  readonly nameOfMethod: string;
  readonly href: InterpolatedHref;
  readonly httpVerb: string;
  readonly resource: HyperSchemaResource4;
  readonly key: string;
  readonly link: HyperSchemaLink4;
  readonly response?: TransferObjectDescriptor;
  readonly request?: TransferObjectDescriptor;
}

export interface GatewayClass {
  nameOfClass: string;
  readonly resource: HyperSchemaResource4;
  readonly operations: GatewayOperation[];
}
