import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class ClientService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = ApiUrl + "/api/MasterData/GetMasterDataForNewClient";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  postClient(data: any) {
    let url = ApiUrl + "/api/Client/AddClient";
    try {
      return this.http.post(url, data).toPromise().then((data) => data.json());
    }
    catch (e) {
      throw e;
    }
  }

  getClient(ClientId: number) {
    let url = ApiUrl + "/api/Client/GetClient?ClientId=" + ClientId;
    try {
      return this.http.get(url).toPromise().then((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }

  }

  editClient(data: any) {
    let url = ApiUrl + "/api/Client/EditClient";
    try {
      return this.http.post(url, data).toPromise().then((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }
  }

}
