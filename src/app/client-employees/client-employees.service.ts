import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class ClientEmployeesService {

    constructor(private http : HttpClient) { }

    getClientEmployees(page : number,count : number,id:number){
       let url=ApiUrl + "/api/Client/GetClientEmployees?page="+page+"&count="+count+"&client="+id;
       return this.http.get(url).map((data=>data=data.json()));
    }


}