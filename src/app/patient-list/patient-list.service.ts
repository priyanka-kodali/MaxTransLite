import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';

@Injectable()
export class PatientListsService {

    constructor(private http : HttpClient) { }

    getPatientLists(){
       let url=ApiUrl + "/api/Doctor/GetPatientLists";
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

    getClients(){        
       let url=ApiUrl + "/api/Doctor/GetClientsForNewPatientList";
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

    getDoctors(ClientId : number){        
       let url=ApiUrl + "/api/Doctor/GetDoctorsForNewPatientList?ClientId="+ClientId;
       return this.http.get(url).toPromise().then((data=>data=data.json()));
    }

}