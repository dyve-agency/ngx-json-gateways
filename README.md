ngx-json-gateways
=================

Generate Angular gateways (api client classes) from [JSON Hyper-Schemas](https://json-schema.org/draft/2019-09/json-schema-hypermedia.html)

* Generate fully and strictly typed typescript classes for your schemas.
* Conventions based but fully customizable

What does that mean?
--------------------

Simple example

##### Input Hyper-Schema

```json
{
  "$schema": "http://json-schema.org/draft-04/hyper-schema",
  "id": "simple-get-with-url-params",
  "properties": {
    "get_users": {
      "links": [{
        "href": "/users/{id}/{id2}",
        "method": "GET",
        "rel": "instances",
        "hrefSchema": {
          "properties": {
            "id": {
              "type": "integer"
            },
            "id2": {
              "type": "integer"
            }
          }
        },
        "targetSchema": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name"],
            "additionalProperties": false,
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      }]
    }
  }
}
```

##### Output class(es)

Gateway:
```typescript
/* tslint:disable */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
import { GetUsersByIdById2Response } from './get-users-by-id-by-id2.response';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  getUsersByIdById2(
    id: number,
    id2: number,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<GetUsersByIdById2Response>> {
    return this._httpClient.request('get', this._apiHost + `/users/${id}/${id2}`, {
      ...options,
      observe: 'response',
    });
  }
}

```

Response object:
```typescript
/* tslint:disable */
export type GetUsersByIdById2Response = {
  id?: number;
  name: string;
}[];
```

Angular module and `API_HOST` injection token:
```typescript
/* tslint:disable */
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { API_HOST } from './api-host';
import { UsersGateway } from './users/users.gateway';
@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [UsersGateway],
})
export class ApiModule {
  static forRoot(apiHost: string): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [{ provide: API_HOST, useValue: apiHost }],
    };
  }
}
```

```typescript
/* tslint:disable */
import { InjectionToken } from '@angular/core';
export const API_HOST = new InjectionToken('API HOST');
```

See the `examples/` folder for more examples.

Get Started
-----------

#### Install
```shell script
npm install -D @zeit-dev/ngx-json-gateways
```

or
```shell script
yarn install -D @zeit-dev/ngx-json-gateways
```

#### Config

Add a file named `json-gateways.config.js` to your project's root folder:
```javascript
const defaultOptions = require('@zeit-dev/ngx-json-gateways/dist/defaults').defaultOptions;

module.exports = [
  {
    ...defaultOptions,
  
    schemaFile: 'schema/users_api/schema.json',
    moduleName: 'UsersApi',
    localSources: [
      // Load `$ref`erenced definitions from these locations. Use standard glob patterns.
      'schema/definitions/**/*.json'
    ],
    // Make the gateway return naked payloads. Change to `response` to return
    // `HttpResonse<GetUserResponse>`
    returnType: 'body',
    json2ts: {
      // Additional options for json-schema-to-typescript
      ...defaultOptions.json2ts,
      unreachableDefinitions: true,
      style: {
        // Configure prettier to your needs
        ...defaultOptions.json2ts.style,
        bracketSpacing: false,
      }
    }
  },
  // ... add more configs if needed
];

```

#### Include in your build process

Add to your project's package.json sth like
```json
{
  "scripts": {
    "generate:gateways": "ngx-json-gateways -c json-gateways.config.js -o src/app/backend",
    "prebuild": "yarn run generate:gateways"
  } 
}
```

And add `src/app/backend` to your `.gitignore`!

#### Initialize module

app.module.ts
```typescript
@NgModule({
  imports: [
    // ...
    UsersApiModule.forRoot('https://myapi.example.org/something')
  
    // ...
  ]
})
// ...
```

FAQ
---

### Why shouldn't I commit the generated classes to my vcs (git)?

The generated classes are artefacts of the schemas, and should therefore not be included
in the repository. 
We recommend adding the generation step to your build process and CI. This has the advantage,
that the gateways will never be out-of-date if your schemas change. And more important:
If your schemas (api) introduces breaking changes, your build will just fail, and you can
fix it.

### Aren't Hyper-Schemas the wrong tool for the job?

Yes, but we find them useful.

### I need a dynamic `API_HOST`

Just import `MyApiModule` (remove `forRoot`), and provide the `API_HOST` yourself, e.g.
```typescript
    { provide: API_HOST, useFactory: getApiHost }
```

### Does it support `$ref`s?

Yes, all `$ref`s are resolved using [json-schema-ref-parser](https://www.npmjs.com/package/json-schema-ref-parser).
At the moment only one method of resolving is supported:  
Supply a list of referencable schema files (or globbing patterns) with `id`s, and these are
resolved by their `id`.

If you need more, contact us or open a PR.

### How can I change the conventions?

All conventions are set using pure functions defined in the `GeneratorOptions` interface. 
In order to change these, you have to overwrite these functions in your configuration, e.g.

```javascript
const defaultOptions = require('@zeit-dev/ngx-json-gateways/dist/defaults').defaultOptions;

module.exports = [
  {
    ...defaultOptions,
  
    // ... all the other options
    
    getTargetPath: ({nameOfClass}) => [nameOfClass]
  },
  // ... add more configs if needed
];
```

Just look at `src/defaults.ts` for the current implementations and how to customize.

TODOs
-----

* Better test coverage
* Inline code documentation
* Usage documentation
* Customization documentation
* Common secondary types (e.g. a `User` definition that is referenced by different requests/responses),
  at the moment duplicates are generated.
