import {JSONSchema4} from 'json-schema';
import {HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';

export interface ResponseTypeDescriptor {
  nameOfClass: string;
  schema: JSONSchema4;
}

export interface GatewayOperation {
  readonly nameOfMethod: string;
  readonly href: string;
  readonly resource: HyperSchemaResource4;
  readonly key: string;
  readonly link: HyperSchemaLink4;
  readonly response?: ResponseTypeDescriptor;
}

export interface GatewayClass {
  nameOfClass: string;
  readonly resource: HyperSchemaResource4;
  readonly operations: GatewayOperation[];
}
