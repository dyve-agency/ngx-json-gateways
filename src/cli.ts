import {paramCase} from 'change-case';
import * as yargs from 'yargs';
import {defaultOptions} from './defaults';
import {generateGatewayFiles} from './index';
import {GeneratorOptions} from './options';

interface Arguments {
  [x: string]: unknown;

  _: string[];
  schema: string;
  out: string;
  config?: string;
}

const cliArgs = yargs
  .usage('Usage: $0 generate -c json-gateways.config.js -o backend')
  .demandCommand(1)
  .command('generate', 'generate api client modules', (generate) => {
    generate
      .option('out', {
        alias: 'o',
        type: 'string',
        description: 'Output directory',
      })
      .option('config', {
        alias: 'c',
        type: 'string',
        description: 'Config file',
      });
  });

const argv = cliArgs.argv as unknown as Arguments;

const outDir = argv.out;

async function run() {
  let configs = (argv.config ? require(process.cwd() + '/' + argv.config) as [] : [defaultOptions]) as GeneratorOptions [];

  for (let config of configs) {
    let options = {
      ...defaultOptions,
      ...config,
    };
    const dir = outDir + '/' + paramCase(options.moduleName);

    if (!config.schemaFile) {
      throw 'Missing schema file';
    }
    await generateGatewayFiles(config.schemaFile, dir, options);
  }
}

run();
