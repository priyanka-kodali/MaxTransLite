import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class EmployeeService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = ApiUrl + "/api/MasterData/GetMasterDataForNewEmployee";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getManagers(department: number) {
    let url = ApiUrl + "/api/MasterData/GetManagers?departmentId=" + department
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) {
      throw e;
    }
  }

  getDoctorGroups() {
    let url = ApiUrl + "/api/MasterData/GetDoctorGroups";
    try {
      return this.http.get(url).map((data) => data.json());
    }
    catch (e) {
      throw e;
    }
  }

  postGeneral(data: any) {
    let url = ApiUrl + "/api/Employee/AddEmployee";
    try {
      return this.http.post(url, data).map((data) => data.json());
    }
    catch (e) {
      throw e;
    }
  }

  getEmployee(EmpId: number) {
    let url = ApiUrl + "/api/Employee/GetEmployee?EmpId=" + EmpId;
    try {
      return this.http.get(url).map((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }

  }

  editEmployee(data: any) {
    let url = ApiUrl + "/api/Employee/EditEmployee";
    try {
      return this.http.post(url, data).map((data) => data = data.json());
    }
    catch (e) {
      throw e;
    }
  }

}
