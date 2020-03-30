import {DEFAULT_OPTIONS} from 'json-schema-to-typescript';
import {GeneratedCode} from './generators';
import {GeneratorOptions} from './options';
import {HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';
import {getCommonHref} from './util/hyper-schema';
import {assertDefined, inspect} from './util/misc';
import {stripCommonPath} from './util/paths';
import {capitalize, upperFirst} from './util/strings';
import { paramCase } from "change-case";


export function pathToCapitalizedNameParts(path: string): string[] {
  return path
    .split('/')
    .filter((x) => !!x)
    .map((x) => capitalize(x.replace(/\W/, '')));
}

export function httpVerbAndHrefBasedMethodName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): string {
  const href = assertDefined(link.href, `href missing in ${inspect(link)}`);
  const method = assertDefined(link.method, `method missing in ${inspect(link)}`);
  const commonHref = getCommonHref(resource);

  const prefix = method.toLocaleLowerCase();
  const localHref = stripCommonPath(href, commonHref);

  return [prefix, ...pathToCapitalizedNameParts(localHref)].join();
}

export function commonHrefBasedClassName(resource: HyperSchemaResource4): string {
  const commonHref = getCommonHref(resource);
  const typeName = pathToCapitalizedNameParts(commonHref).join();
  if (typeName === '') {
    throw `can't build type-name for href ${commonHref}`;
  }

  return typeName + 'Gateway';
}

export function methodNameBasedResponseTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link);
  return upperFirst(methodName) + 'Response';
}

export function methodNameBasedRequestTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link);
  return upperFirst(methodName) + 'Request';
}

export function methodNameBasedParamsTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link);
  return upperFirst(methodName) + 'Params';
}

export function methodNameBasedQueryParamsTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link);
  return upperFirst(methodName) + 'QueryParams';
}

export function kebapizedClassName(nameOfClass: string): string {
  return paramCase(nameOfClass);
}

export function allInRoot(generated: GeneratedCode): string[] {
  return [];
}

export function scopeByResource(generated: GeneratedCode): string[] {
  switch (generated.type) {
    case 'code':
      return [];
    case 'transfer-object':
    case 'gateway':
      return [kebapizedClassName(commonHrefBasedClassName(generated.source.resource)).replace('-gateway', '')];
  }
}

export const defaultOptions: GeneratorOptions = {
  json2ts: {
    ...DEFAULT_OPTIONS,
    bannerComment: '',
    style: {
      ...DEFAULT_OPTIONS.style,
      arrowParens: 'always',
      endOfLine: 'lf',
      bracketSpacing: true,
      singleQuote: true,
      trailingComma: 'all',
      useTabs: false,
      tabWidth: 2,
      parser: 'typescript',
    },
  },
  buildOperationMethodName: httpVerbAndHrefBasedMethodName,
  buildGatewayClassName: commonHrefBasedClassName,
  buildResponseClassName: methodNameBasedResponseTypeName,
  buildFileName: kebapizedClassName,
  getTargetPath: scopeByResource,
};
