import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PatientListsService } from './patient-list.service';
import { ApiUrl } from '../shared/config';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  providers: [PatientListsService]
})
export class PatientListComponent implements OnInit {


  PatientLists: Array<PatientList> = new Array<PatientList>();
  ChildrenPatientLists: Array<PatientList> = new Array<PatientList>();
  SelectedPatientList: PatientList = new PatientList();
  PatientListModal: boolean;
  error: string;
  clients: Array<string> = new Array<string>();
  clientIds: Array<number> = new Array<number>();
  doctors: Array<string> = new Array<string>();
  doctorIds: Array<number> = new Array<number>();
  IsClientDataAvailable: boolean;

  myUrl: string = ApiUrl + "/api/Doctor/AddPatientList";


  public uploader: FileUploader = new FileUploader({
    url: this.myUrl,
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });

  constructor(private patientListsService: PatientListsService, private masterService: MasterService) {
    this.masterService.postAlert("remove", "");
    this.error = "";
    this.PatientListModal = false;
    this.IsClientDataAvailable = false;
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    this.patientListsService.getPatientLists().then(
      (data) => {
        this.PatientLists = data;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Patient Lists";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  getClients() {
    if (!this.IsClientDataAvailable) {
      this.masterService.changeLoading(true);
      this.patientListsService.getClients().then(
        (data) => {
          data.forEach(client => {
            this.clients.push(client.Name);
            this.clientIds.push(client.Id);
          });
          this.IsClientDataAvailable = true;
          this.masterService.changeLoading(false);
        }
      )
    }
  }

  clientChanged() {
    this.masterService.changeLoading(true);
    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.findIndex((item)=>item.toLowerCase()==this.SelectedPatientList.Client.toLowerCase())];
    this.patientListsService.getDoctors(this.SelectedPatientList.Client_Id).then(
      (data) => {
        this.doctors = new Array<string>();
        this.doctorIds = new Array<number>();
        data.forEach(doctor => {
          this.doctors.push(doctor.Name);
          this.doctorIds.push(doctor.Id);
        });
        this.IsClientDataAvailable = true;
        this.masterService.changeLoading(false);
      }
    )
  }

  newPatientList() {
    this.getClients();
    this.PatientListModal = true;
    this.error = "";
    this.SelectedPatientList = new PatientList();
  }


  postPatientList() {

    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    this.uploader.onBuildItemForm = (item, form) => {
      form.append("FromDate", this.SelectedPatientList.FromDate);
      form.append("ToDate", this.SelectedPatientList.ToDate);
      form.append("Client_Id", this.SelectedPatientList.Client_Id);
      form.append("Doctor_Id", this.SelectedPatientList.Doctor_Id);
    }

    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials = false;

    
      this.uploader.uploadItem(file);

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);
      if (status != 200) {
        this.error = "Error adding patient list";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
      if (status == 200) {
        this.PatientLists.push(response);
        this.SelectedPatientList = new PatientList();
        this.PatientListModal = false;
        this.uploader.clearQueue();
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Patient list added successfully");
      }
    };

  }

  validate() {

    this.masterService.postAlert("remove", "");

    var toDate = new Date(this.SelectedPatientList.ToDate);
    var fromDate = new Date(this.SelectedPatientList.FromDate);
    if (toDate.getTime() < fromDate.getTime() || fromDate.getTime() < new Date().getTime()) {
      this.error = "Please select a valid To and From Dates";
      return false;
    }

    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.findIndex((item)=>item.toLowerCase()==this.SelectedPatientList.Client.toLowerCase())];
    this.SelectedPatientList.Doctor_Id = this.doctorIds[this.doctors.findIndex((item)=>item.toLowerCase()==this.SelectedPatientList.Doctor.toLowerCase())];

    if (!this.SelectedPatientList.Client_Id) {
      this.error = "Please select a valid client";
      return false;
    }

    if (this.SelectedPatientList.Doctor && !this.SelectedPatientList.Doctor_Id) {
      this.error = "Please select a valid client";
      return false;
    }
    return true;
  }

  downloadFile(url: string) {
    this.masterService.changeLoading(true);
    this.masterService.GetURLWithSAS(url).then((data) => {
      window.open(data);
      this.masterService.changeLoading(false);
    })
  }
}


class PatientList {
  Id: number;
  PatientListURL: string;
  FromDate: Date;
  ToDate: Date;
  Client: string;
  Client_Id: number;
  Doctor: string;
  Doctor_Id: number;
}