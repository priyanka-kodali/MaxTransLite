import { Injectable } from '@angular/core';
import { Http,Headers,RequestOptions } from '@angular/http';
import { ApiUrl } from '../shared/config';
import { User } from './login.component';


@Injectable()
export class LoginService {

    constructor(private http: Http) { }

    login(User: User) {
        try {            
            let Url = ApiUrl + "/Token"; 
            let body = "grant_type=password&username="+ User.username+"&password="+User.password; 
            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
            let options = new RequestOptions({ headers: headers });
            return this.http.post(Url, body, options).map(
                (data) => data = data.json()
            );
        }
        catch (e) { throw e; }

    }


}
