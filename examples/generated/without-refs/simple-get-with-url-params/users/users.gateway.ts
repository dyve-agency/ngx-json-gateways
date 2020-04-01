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
