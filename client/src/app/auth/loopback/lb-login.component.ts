import { Component, OnInit } from '@angular/core';

import { LoopbackLoginService } from './lb-login.service';

import { Router } from '@angular/router';

@Component({
  selector: 'wsl-lb-login',
  templateUrl: './lb-login.component.html',
  styleUrls: [
    './lb-login.component.scss'
  ]
})
export class LoopbackLoginComponent implements OnInit {

  public submitted: boolean; // keep track on whether form is submitted
  public isError: boolean;
  public errorMsg: string;

  credentials: any = {
    username: '',
    password: ''
  }

  constructor(private loginService: LoopbackLoginService, private router: Router) {}

  ngOnInit() {
    // Logout previous token in session storage and remove token from session storage
    let stored = this.loginService.get();
    if (stored && stored.token) {
      this.loginService.logout().subscribe(
        success => {
          if (success) {
            console.log('Successfully logged out...')
            this.loginService.destroyToken();
          } else {
            console.log('No Token found in session storage...');
          }
        }
      )
    }
  }

  submitLogin() {
    // Reset the error
    this.isError = false;
    // Use an observable to call the server and get an async response back
    this.loginService.login(this.credentials).subscribe(res => {
      console.log('Successfully logged in...')
        this.router.navigate([''])
      },
      err => {
        console.log('Login Error...');
        this.isError = true;
        this.errorMsg = err.message;
      }
    )
  }

}
