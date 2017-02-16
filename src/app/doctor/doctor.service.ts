import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class DoctorService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = ApiUrl + "/api/MasterData/GetMasterDataForNewDoctor";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }
  }


  postDoctor(data: any) {
    let url = ApiUrl + "/api/Doctor/AddDoctor";
    try {
      return this.http.post(url, data).map((data) => data.json());
    }
    catch (e) {
      throw e;
    }
  }

  getDoctor(doctorId: number) {
    let url = ApiUrl + "/api/Doctor/GetDoctor?doctorId=" + doctorId;
    try {
      return this.http.get(url).map((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }

  }

  editDoctor(data: any) {
    let url = ApiUrl + "/api/Doctor/EditDoctor";
    try {
      return this.http.post(url, data).map((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }
  }

}
