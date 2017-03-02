import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PatientListsService } from './patient-list.service';
import { ApiUrl } from '../shared/config';
import { FileUploader } from '../../../node_modules/ng2-file-upload';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  providers: [PatientListsService]
})
export class PatientListComponent implements OnInit {


  // @ViewChild('uploadEl') uploadElRef: ElementRef;

  PatientLists: Array<PatientList> = new Array<PatientList>();
  ChildrenPatientLists: Array<PatientList> = new Array<PatientList>();
  SelectedPatientList: PatientList = new PatientList();
  PatientListModal: boolean;
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  ModalError: string;
  Error: string;
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

  constructor(private patientListsService: PatientListsService) {
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.UpdateSuccess = false;
    this.ModalError = "";
    this.Error = "";
    this.PatientListModal = false;
    this.IsClientDataAvailable = false;
  }

  ngOnInit() {
    this.patientListsService.getPatientLists().subscribe(
      (data) => this.PatientLists = data,
      (error) => this.Error = "Error fetching Patient Lists"
    )
  }

  getClients() {
    if (!this.IsClientDataAvailable) {
      this.patientListsService.getClients().subscribe(
        (data) => {
          data.forEach(client => {
            this.clients.push(client.Name);
            this.clientIds.push(client.Id);
          });
          this.IsClientDataAvailable = true;
        }
      )
    }
  }

  clientChanged() {
    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.indexOf(this.SelectedPatientList.Client)];
    this.patientListsService.getDoctors(this.SelectedPatientList.Client_Id).subscribe(
      (data) => {

        this.doctors = new Array<string>();
        this.doctorIds = new Array<number>();
        data.forEach(doctor => {
          this.doctors.push(doctor.Name);
          this.doctorIds.push(doctor.Id);
        });
        this.IsClientDataAvailable = true;
      }
    )
  }

  newPatientList() {
    this.getClients();
    this.PatientListModal = true;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.UpdateSuccess = false;
    this.ModalError = "";
    this.Error = "";
    this.SelectedPatientList = new PatientList();
  }

  postPatientList() {
    this.UpdateProgress = true;
    this.UpdateFailed = false;
    this.UpdateSuccess = false;
    this.ModalError = "";
    if (this.SelectedPatientList.ToDate < this.SelectedPatientList.FromDate || new Date(this.SelectedPatientList.FromDate) < new Date()) {
      this.ModalError = "Please select valid 'From' and 'To' dates";
      this.UpdateProgress = false;
      return;
    }
    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.indexOf(this.SelectedPatientList.Client)];
    this.SelectedPatientList.Doctor_Id = this.doctorIds[this.doctors.indexOf(this.SelectedPatientList.Doctor)];

    
    if (this.SelectedPatientList.Client_Id == undefined) {
      this.ModalError = "Please select valid client";
      this.UpdateProgress = false;
      return;
    }
    this.uploader.onBuildItemForm = (item, form) => {
      form.append("FromDate", this.SelectedPatientList.FromDate);
      form.append("ToDate", this.SelectedPatientList.ToDate);
      form.append("Client_Id", this.SelectedPatientList.Client_Id);
      form.append("Doctor_Id", this.SelectedPatientList.Doctor_Id);
    }

    this.uploader.uploadItem(this.uploader.queue[this.uploader.queue.length - 1]);

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.UpdateProgress = false;
      response = JSON.parse(response);
      if (status != 200) {
        this.UpdateFailed = true;
      }
      if (status == 200) {
        this.UpdateSuccess = true;
        this.PatientLists.push(response);
        this.SelectedPatientList = new PatientList();
        this.uploader.clearQueue();
      }
    };

  }

  addPatientList(myPatientList: PatientList) {
    this.getClients();
    this.PatientListModal = true;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.UpdateSuccess = false;
    this.ModalError = "";
    this.Error = "";
    this.SelectedPatientList = new PatientList();
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