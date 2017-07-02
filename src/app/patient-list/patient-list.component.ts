import { Component, AfterViewInit, ViewChild, Renderer, ElementRef, OnInit } from '@angular/core';
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
  SelectedPatientListFromDate: string;
  SelectedPatientListToDate: string;
  PatientListModal: boolean;
  error: string;
  clients: Array<string> = new Array<string>();
  clientIds: Array<number> = new Array<number>();
  doctors: Array<string> = new Array<string>();
  doctorIds: Array<number> = new Array<number>();
  IsClientDataAvailable: boolean;

  myUrl: string = ApiUrl + "/api/Doctor/AddPatientList";


  @ViewChild("client") client: ElementRef;
  @ViewChild("doctor") doctor: ElementRef;
  @ViewChild("fromDate") fromDate: ElementRef;
  @ViewChild("toDate") toDate: ElementRef;
  @ViewChild("fileUpload") fileUpload: ElementRef;


  public uploader: FileUploader = new FileUploader({
    url: this.myUrl,
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });

  constructor(private patientListsService: PatientListsService, private masterService: MasterService, private renderer: Renderer) {
    this.masterService.postAlert("remove", "");
    this.error = "";
    this.PatientListModal = false;
    this.IsClientDataAvailable = false;
  }

  ngOnInit() {
    this.getPatientLists();
  }

  getPatientLists() {
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
    if (!this.SelectedPatientList.Client) {
      return;
    }
    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.findIndex((item) => item.toLowerCase() == this.SelectedPatientList.Client.toLowerCase())];
    if (!this.SelectedPatientList.Client_Id) {
      return;
    }
    this.masterService.changeLoading(true);
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
      },
      (error) => this.masterService.changeLoading(false)
    )
  }

  newPatientList() {
    this.getClients();
    this.PatientListModal = true;
    this.error = "";
    this.SelectedPatientList = new PatientList();
    this.SelectedPatientListFromDate = new Date().toISOString().split("T")[0];
    this.SelectedPatientListToDate = new Date().toISOString().split("T")[0];
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
      form.append("FromDate", this.SelectedPatientList.FromDate.toDateString());
      form.append("ToDate", this.SelectedPatientList.ToDate.toDateString());
      form.append("Client_Id", this.SelectedPatientList.Client_Id);
      form.append("Doctor_Id", this.SelectedPatientList.Doctor_Id);
    }



    this.uploader.queue.forEach(element => {
      element.withCredentials = false;

    });

    let success = true;

    try {
      this.uploader.uploadAll();

      this.uploader.onCompleteAll = () => {
        this.SelectedPatientList = new PatientList();
        this.getPatientLists();
        this.PatientListModal = false;
        this.uploader.clearQueue();
        this.masterService.changeLoading(false);
        if (success)
          this.masterService.postAlert("success", "All Patient list added successfully");
      };

      this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
        this.error = "Error adding " + item.file.name;
        this.masterService.postAlert("error", this.error);
        success = false;
      }

      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        if (status == 200) {
          this.masterService.postAlert("success", item.file.name + " added successfully");
        }
      };
    }
    catch (e) {
      this.error = "Error adding patient list";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
    }

  }

  validate() {

    this.masterService.postAlert("remove", "");

    this.SelectedPatientList.Client_Id = this.clientIds[this.clients.findIndex((item) => item.toLowerCase() == this.SelectedPatientList.Client.toLowerCase())];
    if (this.SelectedPatientList.Doctor) this.SelectedPatientList.Doctor_Id = this.doctorIds[this.doctors.findIndex((item) => item.toLowerCase() == this.SelectedPatientList.Doctor.toLowerCase())];

    this.SelectedPatientList.FromDate = new Date(this.SelectedPatientListFromDate);
    this.SelectedPatientList.ToDate = new Date(this.SelectedPatientListToDate);

    if (!this.SelectedPatientList.Client_Id) {
      this.error = "Please select a valid client";
      this.renderer.invokeElementMethod(this.client.nativeElement, 'focus');
      return false;
    }

    if (this.SelectedPatientList.Doctor && !this.SelectedPatientList.Doctor_Id) {
      this.error = "Please select a valid Doctor";
      this.renderer.invokeElementMethod(this.doctor.nativeElement, 'focus');
      return false;
    }

    var toDate = new Date(this.SelectedPatientList.ToDate);
    var fromDate = new Date(this.SelectedPatientList.FromDate);
    var now = new Date().setHours(0, 0, 0, 0);

    if (fromDate.getTime() < now) {
      this.error = "Please select a valid From Date";
      this.renderer.invokeElementMethod(this.toDate.nativeElement, 'focus');
      return false;
    }

    if (toDate.getTime() < fromDate.getTime()) {
      this.error = "Please select a valid To and From Dates";
      this.renderer.invokeElementMethod(this.fromDate.nativeElement, 'focus');
      return false;
    }
    return true;
  }

  downloadFile(url: string) {
    this.masterService.DownloadFile(url);
    // this.masterService.changeLoading(true);
    // this.masterService.GetURLWithSAS(url).then((data) => {
    //   var newWin = window.open(data, "_self");
    //   this.masterService.changeLoading(false);
    //   setTimeout(function () {
    //     if (!newWin || newWin.outerHeight === 0) {
    //       alert("Popup Blocker is enabled! Please add this site to your exception list.");
    //     }
    //   }, 25);
    // })
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