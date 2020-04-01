import {capitalCase, paramCase} from 'change-case';
import {JSONSchema4} from 'json-schema';
import {DEFAULT_OPTIONS} from 'json-schema-to-typescript';
import {GeneratedCode} from './generators/types';
import {GeneratorOptions} from './options';
import {HyperSchema4, HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';
import {getCommonHref} from './util/hyper-schema';
import {assertDefined, inspect} from './util/misc';
import {stripCommonPath, stripInterpolations} from './util/paths';
import {upperFirst} from './util/strings';
import {camelCase} from 'change-case'

export function pathToCapitalizedNameParts(path: string): string[] {
  return path
    .split('/')
    .filter((x) => !!x)
    .map((x) => capitalCase(x.replace(/[^\w-]/, '')).replace(/\s/g, ''));
}

export function httpVerbAndHrefBasedMethodName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
  href: string,
): string {
  const method = assertDefined(link.method, `method missing in ${inspect(link)}`);
  const commonHref = getCommonHref(resource.links);

  const prefix = method.toLocaleLowerCase();
  const localHref = stripCommonPath(href, commonHref);

  let strings = [prefix, ...pathToCapitalizedNameParts(localHref)];
  return strings.join('');
}

export function commonHrefBasedClassName(resource: HyperSchemaResource4, key: string): string {
  const commonHref = stripInterpolations(getCommonHref(resource.links));

  let typeName = pathToCapitalizedNameParts(commonHref).join('');
  if (typeName === '') {
    typeName = camelCase(key);
  }

  return typeName + 'Gateway';
}

export function methodNameBasedResponseTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
  simplifiedHref: string,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link, simplifiedHref);
  return upperFirst(methodName) + 'Response';
}

export function methodNameBasedRequestTypeName(
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
  simplifiedHref: string,
): string {
  const methodName = httpVerbAndHrefBasedMethodName(resource, key, link, simplifiedHref);
  return upperFirst(methodName) + 'Request';
}

export function kebapizedClassName(nameOfClass: string): string {
  return paramCase(nameOfClass).replace(/-(gateway|response|request)/, '.$1');
}

export function allInRoot(generated: GeneratedCode): string[] {
  return [];
}

export function scopeByResource(generated: GeneratedCode): string[] {
  switch (generated.type) {
    case 'code':
      return [];
    case 'transfer-object':
      return [kebapizedClassName(commonHrefBasedClassName(generated.source.resource, generated.source.resourceKey)).replace('.gateway', '')];
    case 'gateway':
      return [kebapizedClassName(commonHrefBasedClassName(generated.source.resource, generated.source.key)).replace('.gateway', '')];
  }
}

function collectLinks(schema: JSONSchema4 & {properties: {[p: string]: HyperSchemaResource4}}): HyperSchemaLink4[] {
  return schema.properties
    ? Object.entries(schema.properties).flatMap(([, res]) => res.links)
    : [];
}

export function noGrouping(schema: HyperSchema4): HyperSchema4 {
  return schema;
}

export function groupIntoOneResource(schema: HyperSchema4): HyperSchema4 {
  const links = collectLinks(schema);
  const commonHref = getCommonHref(links);
  return {
    ...schema,
    properties: {
      [commonHref]: {
        links,
      },
    },
  };
}

export const defaultOptions: GeneratorOptions = {
  moduleName: 'ApiModule',
  localSources: [],
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
  buildRequestClassName: methodNameBasedRequestTypeName,
  buildFileName: kebapizedClassName,
  getTargetPath: scopeByResource,
  preprocessSchema: groupIntoOneResource,
};
