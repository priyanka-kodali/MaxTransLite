import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class ManagerDashboardService {


  constructor(private http: HttpClient) { }
 
  getJobs() {

    let url = ApiUrl + "/api/Dashboard/GetDailyWorkDetails";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }

  }

 
  getStats() {

    let url = ApiUrl + "/api/Dashboard/GetDailyWorkStats";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }

  }

  searchJobs(data : any){
      let url = ApiUrl + "/api/Jobs/SearchJobs";
      
    try {
      return this.http.post(url,data).map((data) => data.json());
    }
    catch (e) { throw e; }
  }


}
