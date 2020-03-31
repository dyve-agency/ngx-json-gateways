import {GatewayClass, TransferObjectDescriptor} from '../type-model';

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
  source: TransferObjectDescriptor;
}

export interface GeneratedGatewayClass extends GeneratedType {
  type: 'gateway';
  source: GatewayClass;
}

export type GeneratedCode = GeneratedAdditional | GeneratedTransferObject | GeneratedGatewayClass;
export type Dependency = ExternalDependency | GeneratedCode;

export interface GeneratedType {
  readonly dependencies: Dependency[];
  readonly nameOfClass: string;
  readonly generatedSource: string;
}
