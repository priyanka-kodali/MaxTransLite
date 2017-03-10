import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class EmployeeDashboardService{

  constructor(private http : HttpClient) { }

  getMyWorkDetails(){    
    let url= ApiUrl+"/api/Dashboard/GetMyJobDetails";
    try{
      return this.http.get(url).toPromise().then(  (data)=>data.json()  );
    }
    catch(e){throw e;}
    
   }

   
  getTeamWorkDetails(){    
    let url= ApiUrl+"/api/Dashboard/GetTeamJobDetails";
    try{
      return this.http.get(url).toPromise().then(  (data)=>data.json()  );
    }
    catch(e){throw e;}
    
   }

 getMonthlyWorkDetails(){    
    let url= ApiUrl+"/api/Dashboard/GetMonthlyWorkDetails";
    try{
      return this.http.get(url).toPromise().then(  (data)=>data.json()  );
    }
    catch(e){throw e;}
    
   }

   getLeavesCount() {

        let url = ApiUrl + "/api/Leave/GetLeavesCount";
        try {
            return this.http.get(url).toPromise().then((data) => data.json());
        }
        catch (e) { throw e; }

    }

}
