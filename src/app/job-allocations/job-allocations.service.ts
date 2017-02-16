import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';
import {Job} from './job-allocations.component'


@Injectable()
export class JobAllocationsService {


  constructor(private http: HttpClient) { }
 
  getJobs() {

    let url = ApiUrl + "/api/Jobs/GetTeamJobs";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getEmployees(){
        let url = ApiUrl + "/api/Jobs/GetEmployeesForAllocation";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }
  }

  updateAllocation(job : Job){
       let url = ApiUrl + "/api/Jobs/UpdateAllocation";
    try {
      return this.http.post(url,job).map((data) => data.json());
    }
    catch (e) { throw e; }
  }

  splitAllocation(data : any){
      let url = ApiUrl + "/api/Jobs/SplitAllocation";    
      console.log(data);
        
    try {
      return this.http.post(url,data).map((data) => data.json());
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
