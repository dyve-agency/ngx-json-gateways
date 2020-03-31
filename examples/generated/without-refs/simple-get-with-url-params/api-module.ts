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
