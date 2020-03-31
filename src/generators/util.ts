import {DEFAULT_OPTIONS} from 'json-schema-to-typescript';
import {format} from 'json-schema-to-typescript/dist/src/formatter';
import {GeneratorOptions} from '../options';
import {generateAllImports} from './dependencies';
import {GeneratedType} from './types';

export function formatCode(options: GeneratorOptions, code: string): string {
  return format(code, {...DEFAULT_OPTIONS, ...options.json2ts});
}

export function combineSourceWithImports(
  options: GeneratorOptions,
  generated: GeneratedType,
  targetPath: string[],
): string {
  return formatCode(
    options,
    generateAllImports(options, generated.dependencies, targetPath) + generated.generatedSource,
  );
}
