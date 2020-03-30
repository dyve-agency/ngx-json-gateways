import {getCommonPath, stripCommonPath} from '../../../src/util/paths';

describe('getCommonPath', () => {
  test('simple case', () => {
    const paths = [
      '/foo/bar',
      '/foo/baz',
    ];

    const common = getCommonPath(paths);

    expect(common).toEqual('/foo');
  });

  test('nothing in common', () => {
    const paths = [
      '/foo/bar',
      '/fob/baz',
    ];

    const common = getCommonPath(paths);

    expect(common).toEqual('');
  });

  test('complex', () => {
    const paths = [
      '/foo/blub/bar',
      '/foo/blub/bar/barum',
      '/foo/blub/buz/barum',
      '/foo/blub/bar/barum/bazinga',
      '/foo/blub/baz',
      '/foo/blub/baz/barum',
    ];

    const common = getCommonPath(paths);

    expect(common).toEqual('/foo/blub');
  });
});

describe('stripCommonPath', () => {
  test('simple case', () => {
    const stripped = stripCommonPath('/foo/bar/blub', '/foo/bar');

    expect(stripped).toEqual('/blub');
  });

});
