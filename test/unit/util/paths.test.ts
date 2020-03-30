import {getCommonPath, relativePath, stripCommonPath} from '../../../src/util/paths';

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

    expect(stripped).toEqual('blub');
  });
});

describe('relativePath', () => {
    test('root', () => {
      const result = relativePath(
        'faa',
        'bum'
      );

      expect(result).toEqual('../bum')
    });
    test('unrelated', () => {
      const result = relativePath(
        'faa',
        'foo/baz/bum'
      );

      expect(result).toEqual('../foo/baz/bum')
    });
    test('nephew', () => {
      const result = relativePath(
        'foo',
        'foo/baz/bum'
      );

      expect(result).toEqual('./baz/bum')
    });
    test('siblings', () => {
      const result = relativePath(
        'foo',
        'foo/baz'
      );

      expect(result).toEqual('./baz')
    });
});
