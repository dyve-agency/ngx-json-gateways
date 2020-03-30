import {promises as fs} from 'fs';
import {each} from 'lodash-es';
import {HyperSchema4, HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';

const DEFAULT_ENCODING = 'utf8';

export class GatewayOperation {
  constructor(
    readonly resource: HyperSchemaResource4,
    readonly key: string,
    readonly hyperSchemaLink4: HyperSchemaLink4) {
  }
}

export async function generateGateway(hyperSchemaFile: string, outDir: string): Promise<void> {
  const hyperSchema = JSON.parse((await fs.readFile(hyperSchemaFile, DEFAULT_ENCODING))) as HyperSchema4;
  const operations: GatewayOperation[] = [];

  each(hyperSchema.properties, (resource, key) => {
    resource.links.forEach((link) => {
      const operation = new GatewayOperation(resource, key, link);
      operations.push(operation);
    });
  });

  await fs.writeFile(`${outDir}/gateway.ts`, '', 'utf8');
}
