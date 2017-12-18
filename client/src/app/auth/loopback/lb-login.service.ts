import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoopbackLoginService {

  // private instance variable to hold base url
  private loginUrl = '/api/auth/login';
  private logoutUrl = '/api/auth/logout';
  private findByIdUrl = '/api/auth';
  // key used for saving the token in session storage
  private TOKEN_KEY = 'wsl-api-token';
  private USER_ID_KEY = 'wsl-userid';

  // Resolve HTTP using the constructor
  constructor (private http: HttpClient, private router: Router) {}

  // Function that will indicate if a user is logged in or not.
  public isAuthenticated(): Observable<boolean> | boolean {
    let stored = this.get();
    if (stored && stored.token && stored.id) {
      let url = this.findByIdUrl + '/' + stored.id + '/accessTokens/' + stored.token + '?access_token=' + stored.token;
      return this.http.get(url)
        .map((res:any) => {
          // If we get a successful response here, we know the user is logged in.
          return true;
        })
        .catch((error:HttpErrorResponse) => {
          this.destroyToken();
          this.router.navigate(['/login'])
          return Observable.of(false);
        });
    } else {
      this.router.navigate(['/login'])
      return Observable.of(false);
    }
  }

  // Returns an Observable that will make the login request to the server and return the json containing the token
  public login(credentials: any): Observable<any> {
    return this.http.post(this.loginUrl, credentials) // ...using post request
       .map((res) => {
         this.save(res);
         this.router.navigate(['/']);
         return res;
       })
       .catch((error:HttpErrorResponse) => {
         return Observable.throw(error || 'Server error');
       })
  }

  // Returns an Observable that will make the logout request to the server with the token in session storage
  public logout() : Observable<string> {
    let stored = this.get();
    if (stored && stored.token) {
      let url = this.logoutUrl + '?access_token=' + stored.token;
      return this.http.post(url, {})
        .map((res) => {
          this.destroyToken();
          this.router.navigate(['login']);
          return true;
        })
        .catch((error: HttpErrorResponse) => Observable.throw(error));
    }
  }

  // Remove the token from session storage.
  public destroyToken(): boolean {
    let stored = this.get();
    if (stored) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_ID_KEY);
      return true;
    }
    return false;
  }

  // Function that will make an authenticated GET request to the server.  If an Unauthenicated is returned by
  // the server, then it will route to the login page.
  // You need a URL and an array of objects that contains a name and value for example [ { name: 'id', value: 1 }]
  public makeAuthenticatedHttpGet(url, queryParams?) : Observable<any> {
    let params = new HttpParams().set('access_token', this.get().token);
    if (queryParams && queryParams.length > 0) {
      for (let qp of queryParams) {
        params = params.append(qp.name, qp.value.toString())
      }
    }
    return this.http.get(url, { params: params })
       .catch((error:HttpErrorResponse) => {
         if (error.status === 401) {
           this.router.navigate(['login'])
         }
         return Observable.throw(error || 'Server error')
       });
  }

  // Function that will make an authenticated POST request to the server.  If an Unauthenicated is returned by
  // the server, then it will route to the login page.
  // You need a URL and an array of objects that contains a name and value for example [ { name: 'id', value: 1 }]
  public makeAuthenticatedHttpPost(url, formData) : Observable<any> {
    let params = new HttpParams().set('access_token', this.get().token);
    return this.http.post(url, formData, { params: params })
       .catch((error:HttpErrorResponse) => {
         if (error.status === 401) {
           this.router.navigate(['login'])
         }
         return Observable.throw(error || 'Server error')
       });
  }

  public makeAuthenticatedHttpJsonPost(url, data) : Observable<any> {
    let params = new HttpParams().set('access_token', this.get().token);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, data, { params: params })
       .catch((error:HttpErrorResponse) => {
         if (error.status === 401) {
           this.router.navigate(['login'])
         }
         return Observable.throw(error || 'Server error')
       });
  }

  public makeAuthenticatedHttpDelete(url, queryParams?) : Observable<any> {
    let params = new HttpParams().set('access_token', this.get().token);
    if (queryParams && queryParams.length > 0) {
      for (let qp of queryParams) {
        params = params.append(qp.name, qp.value.toString())
      }
    }
    return this.http.delete(url, { params: params })
       .catch((error:HttpErrorResponse) => {
         if (error.status === 401) {
           this.router.navigate(['login'])
         }
         return Observable.throw(error || 'Server error')
       });
  }

  // Retrieve the api token from the session storage and null if not found
  get() {
    return {
      token: sessionStorage.getItem(this.TOKEN_KEY),
      id: sessionStorage.getItem(this.USER_ID_KEY)
    }
  }

  // Save the token returned from the login response in session storage
  save(credentials: any) {
    if (credentials && credentials.id) {
      sessionStorage.setItem(this.TOKEN_KEY, credentials.id);
      sessionStorage.setItem(this.USER_ID_KEY, credentials.userId);
    }
  }

}
