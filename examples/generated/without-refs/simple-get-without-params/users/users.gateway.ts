/* tslint:disable */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
import { GetUsersResponse } from './get-users.response';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  getUsers(options?: Parameters<HttpClient['request']>[2]): Observable<HttpResponse<GetUsersResponse>> {
    return this._httpClient.request('get', this._apiHost + '/users', {
      ...options,
      observe: 'response',
    });
  }
}
