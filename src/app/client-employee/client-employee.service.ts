import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class ClientEmployeeService{

  constructor(private http : HttpClient) { }

  getData(){    
    let url= ApiUrl+"/api/MasterData/GetMasterDataForClientEmployee";
    try{    return this.http.get(url).map(  (data)=>data.json()  );  }
    catch(e){throw e;}    
   }

   getClientEmployee(CliEmpId : number){
    let url= ApiUrl+"/api/Client/GetClientEmployee?clientEmployeeId="+CliEmpId;
    try{    return this.http.get(url).map(  (data)=>data.json()  );  }
    catch(e){throw e;}  
   }

   addClientEmployee(data : any){
    let url= ApiUrl+"/api/Client/AddClientEmployee";
    try{    return this.http.post(url,data).map(  (data)=>data.json()  );  }
    catch(e){throw e;}  
   }
   
   editClientEmployee(data : any){
    let url= ApiUrl+"/api/Client/EditClientEmployee";
    try{    return this.http.post(url,data).map(  (data)=>data.json()  );  }
    catch(e){throw e;}  
   }
}