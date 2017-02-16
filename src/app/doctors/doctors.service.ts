import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class DoctorsService {

    constructor(private http : HttpClient) { }

    getDoctors(page : number,count : number,clientId : number){
       let url=ApiUrl + "/api/Doctor/GetDoctors?page="+page+"&count="+count+"&clientId="+clientId;
       return this.http.get(url).map((data=>data=data.json()));
    }
 
    getTemplates(id : number){
       let url=ApiUrl + "/api/DoctorOld/GetTemplates?DoctorId="+id;
       return this.http.get(url).map((data=>data=data.json()));
    }
}