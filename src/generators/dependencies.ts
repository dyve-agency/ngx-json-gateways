import {GeneratorOptions} from '../options';
import {relativePath} from '../util/paths';
import {Dependency, ExternalDependency} from './types';

export function getImport(options: GeneratorOptions, dependency: Dependency, targetPath: string[]): [string, string] {
  switch (dependency.type) {
    case 'external':
      return [dependency.name, dependency.source];
    case 'code':
    case 'transfer-object':
      const localPath = targetPath.join('/');
      const fileName = options.buildFileName(dependency.nameOfClass);
      const dependencyPath = [...options.getTargetPath(dependency), fileName].join('/');
      let fullPath = relativePath(localPath, dependencyPath);

      return [dependency.nameOfClass, fullPath];
  }
}

export function generateImports(imports: [string, string][]): string {
  return imports
    .map(([type, source]) => `import {${type}} from '${source}';`)
    .join('\n');
}

export const defaultDependencies: ExternalDependency[] = [
  {type: 'external', name: 'Observable', source: 'rxjs'},
  {type: 'external', name: 'HttpClient', source: '@angular/common/http'},
  {type: 'external', name: 'HttpResponse', source: '@angular/common/http'},
  {type: 'external', name: 'Inject', source: '@angular/core'},
  {type: 'external', name: 'Injectable', source: '@angular/core'},
];

export function generateAllImports(
  options: GeneratorOptions,
  dependencies: Dependency[],
  targetPath: string[],
): string {
  return generateImports(
    dependencies.map((dep) => getImport(options, dep, targetPath)),
  );
}
