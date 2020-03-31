import {GatewayOperation} from '../type-model';

const BODYLESS_VERBS = [
  'get',
  'delete',
];

function generateQueryParamsRequestAndResponse(
  operation: GatewayOperation,
  requestType: string,
  returnType: string,
  httpVerb: string,
  href: string,
) {
  return `
    ${operation.nameOfMethod}(
      queryParams: ${requestType},
      options?: Parameters<HttpClient['request']>[2],
    ): ${returnType}
    {
      return this._httpClient.request(
        ${httpVerb},
        ${href},
        {
          ...options,
          params: queryParams,
        },
      );
    }
  `;
}

function generateBodyRequestAndResponse(
  operation: GatewayOperation,
  requestType: string,
  returnType: string,
  httpVerb: string,
  href: string,
) {
  return `
    ${operation.nameOfMethod}(
      body: ${requestType},
      options?: Parameters<HttpClient['request']>[2],
    ): ${returnType}
    {
      return this._httpClient.request(
        ${httpVerb},
        ${href},
        {
          ...options,
          body,
        },
      );
    }
  `;
}

function generateRequestAndResponse(
  operation: GatewayOperation,
  requestType: string,
  returnType: string,
  httpVerb: string,
  href: string,
  bodyless: boolean,
) {
  if (bodyless) {
    return generateQueryParamsRequestAndResponse(operation, requestType, returnType, httpVerb, href);
  }
  return generateBodyRequestAndResponse(operation, requestType, returnType, httpVerb, href);
}

function generateResponseOnly(operation: GatewayOperation, returnType: string, httpVerb: string, href: string) {
  return `
    ${operation.nameOfMethod}(
      options?: Parameters<HttpClient['request']>[2],
    ): ${returnType}
    {
      return this._httpClient.request(
        ${httpVerb},
        ${href},
        options,
      );
    }
  `;
}

function f() {

}

export interface MethodDefinition {
  name: string;
  args: {name: string, type: string, required: boolean}[],
  returnType: string,
}

export function generateOperationMethodSource(operation: GatewayOperation): string {
  const returnType = `Observable<HttpResponse<${operation.response?.nameOfClass || '{}'}>>`;
  const httpVerb = JSON.stringify(operation.httpVerb);
  const href = 'this._apiHost + ' + operation.href.typescriptHref;

  if (operation.request) {
    const requestType = operation.request.nameOfClass;
    return generateRequestAndResponse(operation, requestType, returnType, httpVerb, href, BODYLESS_VERBS.includes(operation.httpVerb));
  }

  return generateResponseOnly(operation, returnType, httpVerb, href);
}
