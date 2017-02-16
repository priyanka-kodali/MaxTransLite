import { Injectable } from '@angular/core';
import { HttpClient } from './http-client';
import { ApiUrl } from './shared/config';


@Injectable()
export class MasterService {

  constructor(private http: HttpClient) { }
  
  getStates(countryId: number) {
    let url = ApiUrl + "/api/MasterData/GetStates?countryId=" + countryId;
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getCities(stateId: number) {
    let url = ApiUrl + "/api/MasterData/GetCities?stateId=" + stateId;
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }
  }

}