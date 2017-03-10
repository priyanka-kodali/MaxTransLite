import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ClientLicenseService {

    constructor(private http: HttpClient) { }


    addLicenseKey(data: any) {
        let url = ApiUrl + "/api/Client/AddLicenseKey";
        try {
            return this.http.post(url, data).toPromise().then((data => data = data.json()));
        }
        catch (ex) { throw ex; }
    }

    getClientLocations(ClientId: number) {
        let url = ApiUrl + "/api/Client/GetClientLocations?ClientId=" + ClientId;
        try {
            return this.http.get(url).toPromise().then((data => data = data.json()));
        }
        catch (ex) { throw ex; }
    }


}