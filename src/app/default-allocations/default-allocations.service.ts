import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class DefaultAllocationsService {

    constructor(private http: HttpClient) { }

    getAllocations(page: number, count: number) {
        let url = ApiUrl + "/api/Doctor/GetDefaultAllocations?page=" + page + "&count=" + count;
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }

    searchAllocations(SearchTerm: string) {
        let url = ApiUrl + "/api/Doctor/SearchDefaultAllocation?SearchTerm=" + SearchTerm;
          try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }
    }

}