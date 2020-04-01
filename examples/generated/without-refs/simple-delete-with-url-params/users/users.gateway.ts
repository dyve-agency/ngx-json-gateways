/* tslint:disable */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  deleteUsersByIdById2(
    id: number,
    id2: number,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<void>> {
    return this._httpClient.request('delete', this._apiHost + `/users/${id}/${id2}`, {
      ...options,
      observe: 'response',
    });
  }
}
