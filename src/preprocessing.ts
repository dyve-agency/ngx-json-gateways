import {GeneratorOptions} from './options';
import {GatewayClass, GatewayOperation, InterpolatedHref, TransferObjectDescriptor} from './type-model';
import {HyperSchemaLink4, HyperSchemaResource4} from './types/hyper-schema';
import {assertDefined, inspect} from './util/misc';

export function buildGatewayClass(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
): GatewayClass {
  return {
    nameOfClass: options.buildGatewayClassName(resource, key),
    resource,
    operations: resource.links.map((link) => buildGatewayOperation(options, resource, key, link)),
  };
}

export function buildRequestType(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
  simplifiedHref: string,
): TransferObjectDescriptor | undefined {
  if (!link.schema) return;

  return {
    nameOfClass: options.buildRequestClassName(resource, key, link, simplifiedHref),
    schema: link.schema,
    resource,
    link,
  };
}

export function buildResponseType(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
  simplifiedHref: string,
): TransferObjectDescriptor | undefined {
  if (!link.targetSchema) return;

  return {
    nameOfClass: options.buildResponseClassName(resource, key, link, simplifiedHref),
    schema: link.targetSchema,
    resource,
    link,
  };
}

export function buildInterpolatedHref(href: string): InterpolatedHref {
  if (!href.includes('{')) return {
    href,
    simplifiedHref: href,
    typescriptHref: JSON.stringify(href),
  };

  const simplifiedHref = href.replace(/{(\w+)}/, 'by-$1');
  const typescriptHref = '`' + href.replace(/({\w+})/, '$$$1') + '`';

  return {
    href,
    simplifiedHref,
    typescriptHref,
  };
}

export function buildGatewayOperation(
  options: GeneratorOptions,
  resource: HyperSchemaResource4,
  key: string,
  link: HyperSchemaLink4,
): GatewayOperation {
  const href = buildInterpolatedHref(assertDefined(link.href, `href missing in ${inspect(link)}`));
  const httpVerb = assertDefined(link.method, `method missing in ${inspect(link)}`).toLowerCase();
  const nameOfMethod = options.buildOperationMethodName(resource, key, link, href.simplifiedHref);

  return {
    resource,
    link,
    key,
    href,
    nameOfMethod,
    httpVerb,
    response: buildResponseType(options, resource, key, link, href.simplifiedHref),
    request: buildRequestType(options, resource, key, link, href.simplifiedHref),
  };
}
