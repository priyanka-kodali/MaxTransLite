import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class LeavesReviewService {

    constructor(private http: HttpClient) { }

    getReviewers() {

        let url = ApiUrl + "/api/Leave/GetReviewers";
        try {
            return this.http.get(url).map((data) => data.json());
        }
        catch (e) { throw e; }

    }

    getLeavesToReview(){

        let url = ApiUrl + "/api/Leave/LeavesToReview";
        try {
            return this.http.get(url).map((data) => data.json());
        }
        catch (e) { throw e; }

    }


    authorizeLeave(data: any) {
        let url = ApiUrl + "/api/Leave/AuthorizeLeave";
        try {
            return this.http.post(url,data).map((data) => data.json());
        }
        catch (e) { throw e; }
    }


}
