import {compile, Options} from 'json-schema-to-typescript';
import {TransferObjectDescriptor} from '../type-model';
import {GeneratedTransferObject} from './types';

export async function generateTransferObjectClassSource(
  response: TransferObjectDescriptor,
  options: Partial<Options>,
): Promise<GeneratedTransferObject> {
  // Workaround, because json-schema-to-typescript ignores given name
  // if title is present.
  const patchedSchema = {
    ...response.schema,
    title: response.nameOfClass,
  };

  const responseTypeDef = await compile(
    patchedSchema,
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
