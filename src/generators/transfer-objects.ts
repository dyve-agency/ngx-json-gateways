import {compile, Options} from 'json-schema-to-typescript';
import {TransferObjectDescriptor} from '../type-model';
import {GeneratedTransferObject} from './types';

export async function generateTransferObjectClassSource(
  response: TransferObjectDescriptor,
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
