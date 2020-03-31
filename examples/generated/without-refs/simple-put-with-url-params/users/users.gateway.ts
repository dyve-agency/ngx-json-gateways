import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
import { PutUsersByIdById2Response } from './put-users-by-id-by-id2.response';
import { PutUsersByIdById2Request } from './put-users-by-id-by-id2.request';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  putUsersByIdById2(
    id: number,
    id2: number,
    body: PutUsersByIdById2Request,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<PutUsersByIdById2Response>> {
    return this._httpClient.request('put', this._apiHost + `/users/${id}/${id2}`, {
      ...options,
      body,
    });
  }
}
