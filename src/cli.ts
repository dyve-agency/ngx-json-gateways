import * as yargs from 'yargs';
import {defaultOptions} from './defaults';
import {generateGatewayFiles} from './index';

interface Arguments {
  [x: string]: unknown;

  _: string[];
  module: string;
  schema: string;
  out: string;
  source: string[];
}

const cliArgs = yargs
  .usage('Usage: $0 generate hyperschema.json -o frontend/backend-api -m BackendApi')
  .demandCommand(1)
  .command('generate [schema]', 'generate api client module for given schema', (generate) => {
    generate
      .option('module', {
        alias: 'm',
        type: 'string',
        description: 'Name of angular module to generate',
        demandOption: true,
      })
      .option('out', {
        alias: 'o',
        type: 'string',
        description: 'Output directory',
        demandOption: true,
      })
      .option('source', {
        alias: 's',
        type: 'array',
        description: 'Directories with referenced schema files',
      });
  });

const argv = cliArgs.argv as unknown as Arguments;

const moduleName = argv.module + 'Module';
const schemaFile = argv.schema;
const outDir = argv.out;

async function run() {
  await generateGatewayFiles(schemaFile, outDir, {...defaultOptions, moduleName, localSources: argv.source});
}

run();
