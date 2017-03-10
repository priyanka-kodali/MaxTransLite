import { Component, OnInit, AfterViewInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { ClientEmployeeService } from './client-employee.service';
import { TypeaheadDirective } from 'ng2-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-client-employee',
  templateUrl: 'client-employee.component.html',
  styleUrls: ['client-employee.component.scss'],
  providers: [ClientEmployeeService]
})
export class ClientEmployeeComponent implements OnInit, AfterViewInit {


  @ViewChild("client") client: ElementRef;
  @ViewChild("firstName") firstName: ElementRef;
  @ViewChild("middleName") middleName: ElementRef;
  @ViewChild("lastName") lastName: ElementRef;
  @ViewChild("primaryPhone") primaryPhone: ElementRef;
  @ViewChild("secondaryPhone") secondaryPhone: ElementRef;
  @ViewChild("fax") fax: ElementRef;
  @ViewChild("email") email: ElementRef;
  @ViewChild("department") department: ElementRef;

  NewClientEmployee: ClientEmployee = new ClientEmployee();
  error: string;
  inputDisabled: boolean;
  private sub: any;
  CliEmpId: number;
  clients: Array<string> = new Array<string>();
  clientIds: Array<number> = new Array<number>();
  isNewClientEmployee: boolean;
  isDataAvailable: boolean;
  errorFields: Array<string> = new Array<string>();


  constructor(private renderer: Renderer, private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private clientEmployeeService: ClientEmployeeService) {
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.CliEmpId = +params['CliEmpId'] //get client employee id (if exists) from url
    );
    this.isNewClientEmployee = isNaN(this.CliEmpId) || this.CliEmpId == 0;
    this.isDataAvailable = false;
  }

  ngOnInit() {

    this.masterService.changeLoading(true);
    if (this.isNewClientEmployee)//new client employee
    {
      this.inputDisabled = false;  //enable all input fields
      this.getMasterData();
      this.NewClientEmployee.Active = true;
    }

    else {  //edit or view screen
      try {
        this.clientEmployeeService.getClientEmployee(this.CliEmpId).then(
          (data) => {
            this.NewClientEmployee = data['clientEmployees'];
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.error = "Error fetching client employee details";
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
        )
      }
      catch (e) {
        this.error = "Error processing client employee details";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
      this.inputDisabled = true; //disable all input fields 
    }
  }

  ngAfterViewInit() {
  }

  getMasterData() {
    this.clientEmployeeService.getData().then(
      (data) => {
        data['clients'].forEach(client => {
          this.clients.push(client.Name); //push client names to typeahead source
          this.clientIds.push(client.Id);  //push id for mapping names=>id when form is submitted
          this.isDataAvailable = true;
        });
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Master Data";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  editData() {
    this.inputDisabled = !this.inputDisabled; //toggle disable/enable for input fields
    if (!this.isDataAvailable) {
      this.masterService.changeLoading(true);
      this.getMasterData();
    }
  }

  saveChanges() {
    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }
    this.masterService.postAlert("remove", "");

    if (this.isNewClientEmployee) {
      this.clientEmployeeService.addClientEmployee(this.NewClientEmployee).then(
        (data) => {
          this.NewClientEmployee = data['clientEmployees']; //bind updated values to input fields
          this.inputDisabled = true; //disable input fields
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Client Employee added successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.postAlert("error", this.error);
          this.masterService.changeLoading(false);
        } //display errors if any
      )
    }

    else {
      this.clientEmployeeService.editClientEmployee(this.NewClientEmployee).then(
        (data) => {
          this.NewClientEmployee = data['clientEmployees']; //bind updated values to input fields
          this.inputDisabled = true; //disable input fields
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Client details updated successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.postAlert("error", this.error);
          this.masterService.changeLoading(false);
        } //display errors if any
      )
    }
  }

  validate() {

    this.masterService.postAlert("remove", "");
    var namesRegex = /^[a-zA-Z ]*$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

    this.NewClientEmployee.Client_Id = this.clientIds[this.clients.findIndex((item)=>item.toLowerCase()==this.NewClientEmployee.Client.toLowerCase())] //map client names to their Id

    if (!this.NewClientEmployee.Client_Id) {
      this.error = "Please select valid client";
      this.renderer.invokeElementMethod(this.client, 'focus');
      return false;
    }


    if (this.NewClientEmployee.FirstName.trim().length > 35) {
      this.error = "First Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      return false;
    }

    if (!namesRegex.test(this.NewClientEmployee.FirstName)) {
      this.error = "First Name should not contain special characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewClientEmployee.MiddleName)) {
      this.error = "Middle Name should not contain special characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      return false;
    }
    if (this.NewClientEmployee.MiddleName && this.NewClientEmployee.MiddleName.trim().length > 20) {
      this.error = "Middle Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      return false;
    }

    if (this.NewClientEmployee.LastName.trim().length > 35) {
      this.error = "Last Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewClientEmployee.LastName)) {
      this.error = "Last Name should not contain special characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      return false;
    }

    if (!phoneRegex.test(this.NewClientEmployee.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone, 'focus');
      return false;
    }
    if (this.NewClientEmployee.SecondaryPhone && !phoneRegex.test(this.NewClientEmployee.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone, 'focus');
      return false;
    }
    if (this.NewClientEmployee.Fax && !phoneRegex.test(this.NewClientEmployee.Fax)) {
      this.error = "Please enter a valid Fax Number "
      this.renderer.invokeElementMethod(this.fax, 'focus');
      return false;
    }

    if (!emailRegex.test(this.NewClientEmployee.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email, 'focus');
      return false;
    }

    return true;

  }

  routeToClientEmployeeList() {
    this.router.navigate(['client-employees']); //route to client employees list
  }
}

class ClientEmployee {
  Id: number;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  PrimaryPhone: string;
  SecondaryPhone: string;
  Email: string;
  Fax: string;
  Client_Id: number;
  Department: string;
  Client: string;
  Active: boolean;
}
