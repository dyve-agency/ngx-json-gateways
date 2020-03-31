import * as yargs from 'yargs';
import {promises as fs} from 'fs';
import {defaultOptions} from './defaults';
import {generateGatewayFiles} from './index';

interface Arguments {
  [x: string]: unknown;
  _: string[];
  module: string;
  schema: string;
  out: string;
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
    });
});

const argv = cliArgs.argv as unknown as Arguments;

const moduleName = argv.module + 'Module';
const schemaFile = argv.schema;
const outDir = argv.out;

async function run() {
  await generateGatewayFiles(schemaFile, outDir, {...defaultOptions, moduleName});
}

run();
