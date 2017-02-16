import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class EmployeesService {

    constructor(private http : HttpClient) { }

    getEmployees(page : number,count : number){
       let url=ApiUrl + "/api/Employee/GetEmployees?page="+page+"&count="+count;
       return this.http.get(url).map((data=>data=data.json()));
    }


}