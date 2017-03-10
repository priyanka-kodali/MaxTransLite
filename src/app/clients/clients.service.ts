import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config'

@Injectable()
export class ClientsService {

    constructor(private http : HttpClient) { }

    getClients(page : number,count : number){
       let url=ApiUrl + "/api/Client/GetClients?page="+page+"&count="+count;
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }


}