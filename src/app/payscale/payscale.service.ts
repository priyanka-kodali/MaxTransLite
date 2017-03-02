import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class PayscaleService {

    constructor(private http: HttpClient) { }

    getPayscale(EmpId: number) {
        let url = ApiUrl + "/api/EmployeePayments/GetPayscale?EmpId=" + EmpId+"&payscaleID=0"
        return this.http.get(url).map((data => data = data.json()), (error) => { throw error; }
        );
    }

    postPayscale(data: any) {
        let url = ApiUrl + "/api/EmployeePayments/AddPayscale"
        return this.http.post(url, data).map((data => data = data.json()));
    }

    editPayscale(data: any) {
        let url = ApiUrl + "/api/EmployeePayments/EditPayscale"
        return this.http.post(url, data).map((data => data = data.json()));
    }
}