import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class DoctorDashboardService {


  constructor(private http: HttpClient) { }
 
  getJobs() {
    let url = ApiUrl + "/api/Doctor/GetMyJobs";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }
  }

  searchJobs(data : any){
      let url = ApiUrl + "/api/Doctor/SearchJobs";
      
    try {
      return this.http.post(url,data).map((data) => data.json());
    }
    catch (e) { throw e; }
  }


}
