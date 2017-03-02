import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { DefaultAllocationService } from './default-allocation.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  moduleId: module.id,
  selector: 'app-default-allocation',
  templateUrl: 'default-allocation.component.html',
  styleUrls: ['default-allocation.component.scss'],
  providers: [DefaultAllocationService]

})
export class DefaultAllocationComponent implements OnInit,AfterViewInit {

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


  constructor(private renderer : Renderer, private defaultAllocationService: DefaultAllocationService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.DAId = 0;
    this.error = "";
    this.editSuccess = false;
    this.editProgress = false;
    this.jobLevels=['MT','QA','AQA'];
    this.sub = this.activatedRoute.params.subscribe(
      params => this.DAId = +params['DAId']
    );
    this.isNewDefaultAllocation = isNaN(this.DAId);
    this.isDataAvailable = false;
  }

  ngAfterViewInit(){}

  ngOnInit() {

    if (this.isNewDefaultAllocation) {
      this.getMasterData();
      this.inputDisabled = false
    }
    else {
      this.defaultAllocationService.getDefaultAllocation(this.DAId).subscribe(
        (data) => this.defaultAllocation = data,
        (error) => { this.error = "Error fetching Default Allocation" }
      )
      this.inputDisabled = true;
    }
  }

  getMasterData() {
    try {
      this.defaultAllocationService.getData().subscribe(
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
          this.error = "";
        },
        (error) => { this.error = "Error fetching Master Data" }
      )
    }
    catch (e) {
      this.error = "Error processing Default Allocation"
    }
  }

  validateMinutes() {
    var temp = this.defaultAllocation.Minutes.split(':');
    this.Minutes = parseInt(temp[0]);
    if (isNaN(this.Minutes) || this.Minutes < 0) this.defaultAllocation.Minutes = "";

    this.Minutes = parseInt(temp[1]);
    if (isNaN(this.Minutes) || this.Minutes > 59 || this.Minutes < 0) this.defaultAllocation.Minutes = "";

  }

  saveChanges() {
    if (!this.validate()) return;

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;


    if (this.defaultAllocation.Client_Id == undefined) {
      this.error = "Please select valid client";
      this.editProgress = false;
      return;
    }
    if (this.defaultAllocation.Doctor_Id == undefined) {
      this.error = "Please select valid doctor";
      this.editProgress = false;
      return;
    }
    if (this.defaultAllocation.Employee_Id == undefined) {
      this.error = "Please select valid employee";
      this.editProgress = false;
      return;
    }

    if (this.isNewDefaultAllocation) {
      this.defaultAllocationService.addDefaultAllocation(this.defaultAllocation).subscribe(
        (data) => this.router.navigate(['default-allocation', data]),
        (error) => { this.error = error['_body']; this.editProgress = false; }
      )
    }

    else {
      this.defaultAllocationService.editDefaultAllocation(this.defaultAllocation).subscribe(
        (data) => {
          this.defaultAllocation = data,
            this.inputDisabled = true;
          this.editSuccess = true;
          this.editProgress = false;
        },
        (error) => { this.error = error['_body']; this.editProgress = false; }
      )
    }

  }


  validate(){
    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;

    this.defaultAllocation.Doctor_Id = this.doctorIds[this.doctors.indexOf(this.defaultAllocation.Doctor)];
    this.defaultAllocation.Client_Id = this.clientIds[this.clients.indexOf(this.defaultAllocation.Client)];
    this.defaultAllocation.Employee_Id = this.employeeIds[this.employees.indexOf(this.defaultAllocation.Employee)];




    if (!this.defaultAllocation.Client_Id) {
      this.error = "Please select valid client";
      this.renderer.invokeElementMethod(this.client, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!this.defaultAllocation.Doctor_Id) {
      this.error = "Please select valid doctor";
      this.renderer.invokeElementMethod(this.doctor, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!this.defaultAllocation.Employee_Id) {
      this.error = "Please select valid employee";
      this.renderer.invokeElementMethod(this.employee, 'focus');
      this.editProgress = false;
      return false;
    }
    
    if (this.jobLevels.indexOf(this.defaultAllocation.JobLevel) == -1) {
      this.error = "Please select a valid Job Level"
      this.renderer.invokeElementMethod(this.jobLevel, 'focus');
      this.editProgress = false;
      return false;
    }

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
