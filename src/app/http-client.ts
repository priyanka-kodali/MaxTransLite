import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';

@Injectable()
export class HttpClient {

  token: string;
  constructor(private http: Http, private router: Router) {
    this.http = http;
  }


  LogIn() {
    this.token = sessionStorage.getItem('access_token');
    if (this.token == null) {
      this.router.navigate(["login"]);
      return false;
    }
    return true;
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' + this.token);
  }

  get(url) {
    if (this.LogIn()) {
      let headers = new Headers();
      this.createAuthorizationHeader(headers);
      return this.http.get(url, {
        headers: headers
      });
    }

  }

  post(url, data) {
    if (this.LogIn()) {
      let headers = new Headers();
      this.createAuthorizationHeader(headers);
      return this.http.post(url, data, {
        headers: headers
      });
    }
  }
}