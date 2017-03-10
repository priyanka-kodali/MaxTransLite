import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ResetPasswordService {

    constructor(private http: Http) { }

    resetPassword(model : any) {
        try {
            let Url = ApiUrl + "/api/Account/ResetPassword";
            let body=model;
            return this.http.post(Url, body);
        }
        catch (e) { throw e; }
    }

}
