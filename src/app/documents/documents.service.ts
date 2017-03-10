import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class DocumentsService {

    constructor(private http : HttpClient) { }

    getDocuments(EmpId : number){
       let url=ApiUrl + "/api/EmployeeDocuments/GetDocuments?EmpId=" + EmpId
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }
}