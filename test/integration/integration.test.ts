import {exec} from 'child_process';
import {compare} from 'dir-compare';
import {promises as fs} from 'fs';
import {generateGatewayFiles} from '../../src';

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

const integrationTests = [
  ['without-refs', 'simple-get-without-params'],
  ['without-refs', 'simple-post-without-params'],
  ['without-refs', 'simple-get-with-query-params'],
  ['without-refs', 'simple-get-with-url-params'],
  ['without-refs', 'simple-put-with-url-params'],
  ['without-refs', 'simple-get-with-url-and-query-params'],
  ['without-refs', 'simple-delete-with-url-params'],
];

describe('Integration', () => {
  test.each(integrationTests)('%s/%s', async(dir, name) => {
    const input = `examples/hyper-schema/${dir}/${name}.json`;
    const expectedFiles = `examples/generated/${dir}/${name}`;
    const output = `tmp/${dir}/${name}`;

    await fs.rmdir(output, {recursive: true});
    await fs.mkdir(output, {recursive: true});

    await generateGatewayFiles(input, output);

    const result = await compare(expectedFiles, output, {compareContent: true});

    if (!result.same) {
      const stdout = await diffAsync(expectedFiles, output);
      console.log(stdout);
    }
    expect(result.same).toBeTruthy();
  });
});
