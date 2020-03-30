import {promises as fs} from 'fs';
import {generateGatewayFiles} from '../../src';

test('simple-endpoint-without-refs', async() => {
  const input = 'examples/hyper-schema/simple-endpoint-without-refs.json';
  const expectedFiles = 'examples/generated/simple-endpoint-without-refs';
  const output = 'tmp/simple-endpoint-without-refs';

  await fs.mkdir(output, {recursive: true});

  await generateGatewayFiles(input, output);

  const dir = await fs.opendir(expectedFiles);
  for await (const entry of dir) {
    if (entry.isFile()) {
      const generated = fs.readFile(`${output}/${entry.name}`, 'utf8');
      const expected = fs.readFile(`${expectedFiles}/${entry.name}`, 'utf8');

      expect((await generated)).toEqual(await expected);
    }
  }
});
