import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class DefaultAllocationService {

    constructor(private http : HttpClient) { }

    getData(){
         let url=ApiUrl + "/api/MasterData/GetMasterDataForNewDefaultAllocation"
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

    getDoctors(ClientId : number){
         let url=ApiUrl + "/api/MasterData/GetDoctorsForNewDefaultAllocation?ClientId="+ClientId;
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

    getDefaultAllocation(DAId : number){
       let url=ApiUrl + "/api/Doctor/GetDefaultAllocation?DAId=" + DAId
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

    addDefaultAllocation(data : any){
        let url=ApiUrl + "/api/Doctor/AddDefaultAllocation"
        return this.http.post(url,data).toPromise().then((data=>data=data.json()));
    }

    
    editDefaultAllocation(data : any){
        let url=ApiUrl + "/api/Doctor/EditDefaultAllocation"
        return this.http.post(url,data).toPromise().then((data=>data=data.json()));
    }

}