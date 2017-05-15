import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from './http-client';
import { ApiUrl } from './shared/config';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class MasterService {

  constructor(private http: HttpClient) { }

  getStates(countryId: number) {
    let url = ApiUrl + "/api/MasterData/GetStates?countryId=" + countryId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getCities(stateId: number) {
    let url = ApiUrl + "/api/MasterData/GetCities?stateId=" + stateId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getAllStates() {
    let url = ApiUrl + "/api/MasterData/GetStates?countryId=0";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getAllCities() {
    let url = ApiUrl + "/api/MasterData/GetCities?stateId=0";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  GetURLWithSAS(blobURL: string) {
    let url = ApiUrl + "/api/MasterData/GetURLWithSAS?url=" + blobURL;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }


  getNotificationCount() {
    let url = ApiUrl + "/api/Dashboard/GetNotificationsCount";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  //pass data to the main controller for showing loader and setting error success messages

  loading = new Subject<boolean>();

  loadingEmitter$ = this.loading.asObservable();

  changeLoading(value: boolean) {
    this.loading.next(value);
  }

  alert = new Subject<Alert>();

  alertEmitter$ = this.alert.asObservable();

  postAlert(type: string, message: string) {
    var myAlert = new Alert();
    myAlert.type = type;
    myAlert.message = message;
    this.alert.next(myAlert);
  }



  isLoggedIn = new Subject<boolean>();

  logoutEmitter$ = this.isLoggedIn.asObservable();

  logOut(value: boolean) {
    this.isLoggedIn.next(value);
  }
}


export class Alert {
  type: string;  //success,error,info,alert,remove
  message: string;
}