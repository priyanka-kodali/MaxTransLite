import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ChangePasswordService {


  constructor(private http: HttpClient) { }

  changePassword(model : any) {

    let url = ApiUrl + "/api/Account/ChangePassword";
    try {
      return this.http.post(url,model);
    }
    catch (e) { throw e; }

  }
}
