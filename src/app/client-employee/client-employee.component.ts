import { Component, OnInit } from '@angular/core';
import { ClientEmployeeService } from './client-employee.service';
import { TypeaheadDirective } from 'ng2-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-client-employee',
  templateUrl: 'client-employee.component.html',
  styleUrls: ['client-employee.component.scss'],
  providers: [ClientEmployeeService]
})
export class ClientEmployeeComponent implements OnInit {

  NewClientEmployee: ClientEmployee = new ClientEmployee();
  error: string;
  inputDisabled: boolean;
  editSuccess: boolean;
  editProgress: boolean;
  private sub: any;
  CliEmpId: number;
  clients: Array<string> = new Array<string>();
  clientIds: Array<number> = new Array<number>();
  isNewClientEmployee: boolean;
  isDataAvailable: boolean;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private clientEmployeeService: ClientEmployeeService) {
    this.error = "";
    this.editSuccess = false; //hide success message by default
    this.editProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.CliEmpId = +params['CliEmpId'] //get client employee id (if exists) from url
    );
    this.isNewClientEmployee = isNaN(this.CliEmpId) || this.CliEmpId == 0;
    this.isDataAvailable = false;
  }

  ngOnInit() {

    if (this.isNewClientEmployee)//new client employee
    {
      this.inputDisabled = false;  //enable all input fields
      this.getMasterData();
      this.NewClientEmployee.Active = true;
    }

    else {  //edit or view screen
      try {
        this.clientEmployeeService.getClientEmployee(this.CliEmpId).subscribe(
          (data) => this.NewClientEmployee = data['clientEmployees'],
          (error) => { this.error = "Error fetching client employee details" }
        )
      }
      catch (e) {
        this.error = "Error processing client employee details";
      }
      this.inputDisabled = true; //disable all input fields 
    }
  }

  getMasterData() {
    this.clientEmployeeService.getData().subscribe(
      (data) => {
        data['clients'].forEach(client => {
          this.clients.push(client.Name); //push client names to typeahead source
          this.clientIds.push(client.Id);  //push id for mapping names=>id when form is submitted
          this.isDataAvailable = true;
        });
        this.error = "";
      },
      (error) => { this.error = "Error fetching Master Data" }
    )
  }

  editData() {
    this.inputDisabled = !this.inputDisabled; //toggle disable/enable for input fields
    if (!this.isDataAvailable) this.getMasterData();

  }


  saveChanges() {
    this.NewClientEmployee.Client_Id = this.clientIds[this.clients.indexOf(this.NewClientEmployee.Client)] //map client names to their Id
    this.editProgress = true;
    if (this.isNewClientEmployee) {
      this.clientEmployeeService.addClientEmployee(this.NewClientEmployee).subscribe(
        (data) => this.router.navigate(['client-employee', data]), //route to view screen
        (error) => { this.error = error['_body']; this.editProgress = false; } //display error if any
      )
    }

    else {
      this.clientEmployeeService.editClientEmployee(this.NewClientEmployee).subscribe(
        (data) => {
          this.NewClientEmployee = data['clientEmployees'], //bind updated values to input fields
            this.inputDisabled = true; //disable input fields
          this.editSuccess = true; //display succes message
          this.editProgress = false;
        },
        (error) => { this.editSuccess = false; this.error = error['_body']; this.editProgress = false; } //display errors if any
      )
    }
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
