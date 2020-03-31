import {JSONSchema4} from 'json-schema';
import {GatewayOperation} from '../type-model';
import {inspect} from '../util/misc';

const BODYLESS_VERBS = [
  'get',
  'delete',
];

function requiredFirst(a: MethodDefinition['args'][0], b: MethodDefinition['args'][0]): number {
  return a.required ? 1 : b.required ? -1 : 0;
}

function generateMethodSource(definition: MethodDefinition): string {
  const args = definition.args.sort(requiredFirst).map(({type, name, required}) => {
    return `${name}${required ? '' : '?'}: ${type},`;
  });
  const options = definition.options.map(({key, value}) => {
    return key === value ? key + ',' : `${key}: ${value},`;
  });

  return `
    ${definition.name}(
      ${args.join('\n')}
      options?: Parameters<HttpClient['request']>[2],
    ): ${definition.returnType}
    {
      return this._httpClient.request(
        ${definition.httpVerb},
        ${definition.href},
        {
          ...options,
          ${options.join('\n')}
        },
      );
    }
  `;
}

export interface MethodDefinition {
  name: string;
  args: {name: string, type: string, required: boolean}[];
  returnType: string;
  httpVerb: string;
  href: string;
  options: {key: string, value: string}[];
}

function createInterpolationParamType(def: JSONSchema4): string {
  if (!def.type) {
    throw `Invalid definition: ${inspect(def)}`;
  }

  const types = Array.isArray(def.type) ? def.type : [def.type];

  const tsTypes = types.map((type) => {
    switch (type) {
      case 'string':
      case 'number':
      case 'null':
      case 'boolean':
        return type;
      case 'integer':
        return 'number';
      case 'object':
      case 'array':
      case 'any':
        throw `Invalid type ${type} in ${inspect(def)}`;
    }
  });

  return tsTypes.join(' | ');
}

export function generateOperationMethodSource(operation: GatewayOperation): string {
  const returnType = `Observable<HttpResponse<${operation.response?.nameOfClass || 'void'}>>`;
  const httpVerb = JSON.stringify(operation.httpVerb);
  const href = 'this._apiHost + ' + operation.href.typescriptHref;

  const methodDefinition: MethodDefinition = {
    name: operation.nameOfMethod,
    href,
    httpVerb,
    returnType,
    options: [],
    args: [],
  };

  if (operation.href.schema && operation.href.schema.properties) {
    Object.entries(operation.href.schema.properties).forEach(([name, def]) => {
      const type = createInterpolationParamType(def);

      methodDefinition.args.push({name, type, required: true});
    });
  }

  if (operation.request) {
    if (BODYLESS_VERBS.includes(operation.httpVerb)) {
      methodDefinition.args.push({name: 'queryParams', type: operation.request.nameOfClass, required: true});
      methodDefinition.options.push({key: 'params', value: 'queryParams as unknown as { [param: string]: string | string[]; }'});
    } else {
      methodDefinition.args.push({name: 'body', type: operation.request.nameOfClass, required: true});
      methodDefinition.options.push({key: 'body', value: 'body'});
    }
  }

  return generateMethodSource(methodDefinition);
}
