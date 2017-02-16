import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ForgotPasswordService {

    constructor(private http: Http) { }

    resetPassword(email: string) {
        try {
            let Url = ApiUrl + "/api/Account/ForgotPassword?email="+email;
            let body="";
            return this.http.post(Url, body);
        }
        catch (e) { throw e; }

    }


}
