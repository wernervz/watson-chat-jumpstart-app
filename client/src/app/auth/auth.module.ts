import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoopbackLoginComponent } from './loopback/lb-login.component';
import { LoopbackLoginService } from './loopback/lb-login.service';

import { AuthGuard } from './auth.guard';

@NgModule({
  imports:      [ CommonModule, HttpClientModule, FormsModule ],
  declarations: [ LoopbackLoginComponent ],
  providers:    [ LoopbackLoginService, AuthGuard],
  exports:      [ LoopbackLoginComponent ]
})
export class AuthModule {
  constructor() { }
}
