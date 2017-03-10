import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class LeavesService {

    constructor(private http: HttpClient) { }

    getLeavesCount() {
        let url = ApiUrl + "/api/Leave/GetLeavesCount";
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }

    getAppliedLeaves(){
        let url = ApiUrl + "/api/Leave/GetAppliedLeaves";
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }


    applyLeave(data: any) {
        let url = ApiUrl + "/api/Leave/Applyleave";
        try {
            return this.http.post(url,data).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }


}
