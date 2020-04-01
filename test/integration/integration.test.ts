import {exec} from 'child_process';
import {compare} from 'dir-compare';
import {promises as fs} from 'fs';
import {generateGatewayFiles, generateResolvedSchema} from '../../src';
import {defaultOptions} from '../../src/defaults';

async function diffAsync(dir1: string, dir2: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`diff ${dir1} ${dir2}`, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

const generationTests = [
  ['without-refs', 'simple-get-without-params'],
  ['without-refs', 'simple-post-without-params'],
  ['without-refs', 'simple-get-with-query-params'],
  ['without-refs', 'simple-get-with-url-params'],
  ['without-refs', 'simple-put-with-url-params'],
  ['without-refs', 'simple-get-with-url-and-query-params'],
  ['without-refs', 'simple-delete-with-url-params'],
  ['with-refs/complex-schema', 'schema'],
];

describe('Generation', () => {
  test.each(generationTests)('%s/%s', async(dir, name) => {
    const localSource = `examples/hyper-schema/${dir}/**/*.json`;
    const input = `examples/hyper-schema/${dir}/${name}.json`;
    const expectedFiles = `examples/generated/${dir}/${name}`;
    const output = `tmp/${dir}/${name}`;

    await fs.rmdir(output, {recursive: true});
    await fs.mkdir(output, {recursive: true});
    await fs.mkdir(expectedFiles, {recursive: true});

    await generateGatewayFiles(input, output, {...defaultOptions, localSources: [localSource]});

    const result = await compare(expectedFiles, output, {compareContent: true});

    if (!result.same) {
      const stdout = await diffAsync(expectedFiles, output);
      console.log(stdout);
    }
    expect(result.same).toBeTruthy();
  });
});

const resolvingTests = [
  ['with-refs', 'complex-schema'],
];

describe('Resolving', () => {
  test.each(resolvingTests)('%s/%s', async(dir, name) => {
    const input = `examples/hyper-schema/${dir}/${name}/schema.json`;
    const expectedFile = `examples/generated/${dir}/${name}.json`;
    const output = `tmp/${dir}/${name}.json`;

    await generateResolvedSchema(input, `tmp/${dir}`, name, [`examples/hyper-schema/${dir}/${name}/**/*.json`]);

  });
});
