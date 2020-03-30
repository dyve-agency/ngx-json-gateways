import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from './api-host';
import { GetResponse } from './users/get-response';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  get(options?: Parameters<HttpClient['request']>[2]): Observable<HttpResponse<GetResponse>> {
    return this._httpClient.request('get', '/users', options);
  }
}
