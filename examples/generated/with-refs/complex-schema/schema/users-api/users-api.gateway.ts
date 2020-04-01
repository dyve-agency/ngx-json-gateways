/* tslint:disable */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
import { GetUsersByIdById2Response } from './get-users-by-id-by-id2.response';
import { GetGroupsByIdById2Response } from './get-groups-by-id-by-id2.response';
import { PostUsersResponse } from './post-users.response';
import { PostUsersRequest } from './post-users.request';
@Injectable()
export class UsersApiGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  getUsersByIdById2(
    id: number,
    id2: number,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<GetUsersByIdById2Response>> {
    return this._httpClient.request('get', this._apiHost + `/users_api/users/${id}/${id2}`, {
      ...options,
      observe: 'response',
    });
  }

  getGroupsByIdById2(
    id: number,
    id2: number,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<GetGroupsByIdById2Response>> {
    return this._httpClient.request('get', this._apiHost + `/users_api/groups/${id}/${id2}`, {
      ...options,
      observe: 'response',
    });
  }

  postUsers(
    body: PostUsersRequest,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<PostUsersResponse>> {
    return this._httpClient.request('post', this._apiHost + '/users_api/users', {
      ...options,
      observe: 'response',
      body,
    });
  }

  deleteUsersByIdById2(
    id: number,
    id2: number,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<void>> {
    return this._httpClient.request('delete', this._apiHost + `/users_api/users/${id}/${id2}`, {
      ...options,
      observe: 'response',
    });
  }
}
