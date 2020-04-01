/* tslint:disable */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { API_HOST } from '../api-host';
import { PostUsersResponse } from './post-users.response';
import { PostUsersRequest } from './post-users.request';
@Injectable()
export class UsersGateway {
  constructor(private readonly _httpClient: HttpClient, @Inject(API_HOST) private readonly _apiHost: string) {}

  postUsers(
    body: PostUsersRequest,
    options?: Parameters<HttpClient['request']>[2],
  ): Observable<HttpResponse<PostUsersResponse>> {
    return this._httpClient.request('post', this._apiHost + '/users', {
      ...options,
      observe: 'response',
      body,
    });
  }
}
