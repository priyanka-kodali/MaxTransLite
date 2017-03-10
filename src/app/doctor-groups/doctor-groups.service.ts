import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class DoctorGroupsService {


    constructor(private http: HttpClient) { }

    getDoctorGroups() {

        let url = ApiUrl + "/api/Doctor/GetDoctorGroups";
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }

        getDoctorGroup(id: number) {
        let url = ApiUrl + "/api/Doctor/GetDoctorGroup?id=" + id;
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }

    
        addDoctorGroup(name: string) {
        let url = ApiUrl + "/api/Doctor/AddDoctorGroup?name=" + name;
        try {
            return this.http.post(url,null).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }


}
