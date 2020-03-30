import {promises as fs} from 'fs';
import {generateGatewayFiles} from '../../src';
import {compare} from 'dir-compare';

test('simple-endpoint-without-refs', async() => {
  const input = 'examples/hyper-schema/simple-endpoint-without-refs.json';
  const expectedFiles = 'examples/generated/simple-endpoint-without-refs';
  const output = 'tmp/simple-endpoint-without-refs';
  await fs.rmdir(output, {recursive: true});

  await fs.mkdir(output, {recursive: true});

  await generateGatewayFiles(input, output);

  const result = await compare(expectedFiles, output, {compareContent: true});

  if(!result.same) {
    console.log(result.diffSet?.filter((diff) => diff.state !== 'equal'));
  }
  expect(result.same).toBeTruthy();
});
