import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { DefaultAllocationService } from './default-allocation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MasterService } from '../app.service';


@Component({
  moduleId: module.id,
  selector: 'app-default-allocation',
  templateUrl: 'default-allocation.component.html',
  styleUrls: ['default-allocation.component.scss'],
  providers: [DefaultAllocationService]

})
export class DefaultAllocationComponent implements OnInit, AfterViewInit {

  private sub: any;
  DAId: number;
  defaultAllocation: DefaultAllocation = new DefaultAllocation();;
  Minutes: number;
  error: string;
  doctors: Array<string> = new Array<string>();
  doctorIds: Array<number> = new Array<number>();
  clients: Array<string> = new Array<string>();
  clientIds: Array<number> = new Array<number>();
  employees: Array<string> = new Array<string>();
  employeeIds: Array<number> = new Array<number>();
  jobLevels: Array<string> = new Array<string>();
  inputDisabled: boolean;
  editSuccess: boolean;
  editProgress: boolean;
  isNewDefaultAllocation: boolean;
  isDataAvailable: boolean;


  @ViewChild("client") client: ElementRef;
  @ViewChild("doctor") doctor: ElementRef;
  @ViewChild("jobLevel") jobLevel: ElementRef;
  @ViewChild("employee") employee: ElementRef;


  constructor(private renderer: Renderer, private masterService: MasterService, private defaultAllocationService: DefaultAllocationService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.masterService.postAlert("remove", "");
    this.DAId = 0;
    this.error = "";
    this.editSuccess = false;
    this.editProgress = false;
    this.jobLevels = ['MT', 'QA', 'AQA'];
    this.sub = this.activatedRoute.params.subscribe(
      params => this.DAId = +params['DAId']
    );
    this.isNewDefaultAllocation = isNaN(this.DAId);
    this.isDataAvailable = false;
  }

  ngAfterViewInit() { }

  ngOnInit() {

    this.masterService.changeLoading(true);

    if (this.isNewDefaultAllocation) {
      this.getMasterData();
      this.inputDisabled = false
    }
    else {
      this.defaultAllocationService.getDefaultAllocation(this.DAId).then(
        (data) => {
          this.defaultAllocation = data;
          this.masterService.changeLoading(false);
        },
        (error) => {
          this.error = "Error fetching Default Allocation";
          this.masterService.postAlert("error", this.error);
          this.masterService.changeLoading(false);
        }
      )
      this.inputDisabled = true;
    }
  }

  getMasterData() {
    try {
      this.defaultAllocationService.getData().then(
        (data) => {
          data['doctors'].forEach(doctor => {
            this.doctors.push(doctor.Name);
            this.doctorIds.push(doctor.Id);
          });
          data['clients'].forEach(client => {
            this.clients.push(client.Name);
            this.clientIds.push(client.Id);
          });
          data['employees'].forEach(employee => {
            this.employees.push(employee.Name);
            this.employeeIds.push(employee.Id);
          });
          this.isDataAvailable = true;
          this.masterService.changeLoading(false);
        },
        (error) => {
          this.error = "Error fetching Master Data";
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }
    catch (e) {
      this.error = "Error processing Default Allocation";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
    }
  }

  getDoctors() {
    if (!this.defaultAllocation.Client) {
      return;
    }
    this.masterService.changeLoading(true);
    var ClientId = this.clientIds[this.clients.findIndex((item) => item.toLowerCase() == this.defaultAllocation.Client.toLowerCase())];
    this.doctors = new Array<string>();
    this.doctorIds = new Array<number>();

    if (!ClientId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.defaultAllocationService.getDoctors(ClientId).then(
      (data) => {
        data['doctors'].forEach(doctor => {
          this.doctors.push(doctor.Name);
          this.doctorIds.push(doctor.Id);
        });
        this.masterService.changeLoading(false);
      }
    )
  }

  validateMinutes() {
    var temp = this.defaultAllocation.Minutes.split(':');
    this.Minutes = parseInt(temp[0]);
    if (isNaN(this.Minutes) || this.Minutes < 0) this.defaultAllocation.Minutes = "";

    this.Minutes = parseInt(temp[1]);
    if (isNaN(this.Minutes) || this.Minutes > 59 || this.Minutes < 0) this.defaultAllocation.Minutes = "";

  }

  saveChanges() {

    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");


    if (this.isNewDefaultAllocation) {
      this.defaultAllocationService.addDefaultAllocation(this.defaultAllocation).then(
        (data) => {
          this.defaultAllocation = data;
          this.inputDisabled = true;
          this.isNewDefaultAllocation = false;
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Default Allocation Added successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }

    else {
      this.defaultAllocationService.editDefaultAllocation(this.defaultAllocation).then(
        (data) => {
          this.defaultAllocation = data;
          this.inputDisabled = true;
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Default Allocation Updated successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }

  }

  validate() {

    this.masterService.postAlert("remove", "");

    if (!this.isNewDefaultAllocation) {
      return true;
    }

    this.defaultAllocation.Doctor_Id = this.doctorIds[this.doctors.findIndex((item) => item.toLowerCase() == this.defaultAllocation.Doctor.toLowerCase())];
    this.defaultAllocation.Client_Id = this.clientIds[this.clients.findIndex((item) => item.toLowerCase() == this.defaultAllocation.Client.toLowerCase())];
    this.defaultAllocation.Employee_Id = this.employeeIds[this.employees.findIndex((item) => item.toLowerCase() == this.defaultAllocation.Employee.toLowerCase())];

    if (!this.defaultAllocation.Client_Id) {
      this.error = "Please select valid client";
      this.renderer.invokeElementMethod(this.client.nativeElement, 'focus');
      return false;
    }
    if (!this.defaultAllocation.Doctor_Id) {
      this.error = "Please select valid doctor";
      this.renderer.invokeElementMethod(this.doctor.nativeElement, 'focus');
      return false;
    }
    if (!this.defaultAllocation.Employee_Id) {
      this.error = "Please select valid employee";
      this.renderer.invokeElementMethod(this.employee.nativeElement, 'focus');
      return false;
    }

    if (this.jobLevels.findIndex((item) => item.toLowerCase() == this.defaultAllocation.JobLevel.toLowerCase()) == -1) {
      this.error = "Please select a valid Job Level"
      this.renderer.invokeElementMethod(this.jobLevel.nativeElement, 'focus');
      return false;
    }

    return true;

  }

  routeToDefaultAllocationList() {
    this.router.navigate(['default-allocations']);
  }

  editData() {
    this.inputDisabled = !this.inputDisabled;
  }
}

class DefaultAllocation {
  Id: number;
  Client: string;
  Client_Id: number;
  Doctor: string;
  Doctor_Id: number;
  JobLevel: string;
  Employee: string;
  Employee_Id: number;
  Accuracy: number;
  Minutes: string;
  Inactive: boolean;
}
