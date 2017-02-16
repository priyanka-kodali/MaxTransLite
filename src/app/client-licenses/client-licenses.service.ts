import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ClientLicensesService {

    constructor(private http: HttpClient) { }


    getLicenseKeys(ClientId: number) {

        let url = ApiUrl + "/api/Client/GetLicenseKeys?ClientId="+ClientId;
        try {
            return this.http.get(url).map((data => data = data.json()));
        }
        catch (ex) { throw ex; }
    }

    resetLicense(LicenseId : number){
        
        let url = ApiUrl + "/api/Client/ResetLicenseKey?LicenseId="+LicenseId;
        try {
            return this.http.get(url).map((data => data = data.json()));
        }
        catch (ex) { throw ex; }
    }

}