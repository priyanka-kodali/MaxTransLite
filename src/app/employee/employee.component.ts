import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from './employee.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-employee',
  templateUrl: 'employee.component.html',
  styleUrls: ['employee.component.scss'],
  providers: [EmployeeService, MasterService]
})

export class EmployeeComponent implements OnInit {

  cities: Array<string> = new Array<string>();
  states: Array<string> = new Array<string>();
  countries: Array<string> = new Array<string>();
  designations: Array<string> = new Array<string>();
  departments: Array<string> = new Array<string>();
  specialties: Array<string> = new Array<string>();
  managers: Array<string> = new Array<string>();
  roles: Array<string> = new Array<string>();
  doctorGroups: Array<string> = new Array<string>();
  cityIds: Array<number> = new Array<number>();
  roleIds: Array<number> = new Array<number>();
  stateIds: Array<number> = new Array<number>();
  countryIds: Array<number> = new Array<number>();
  designationIds: Array<number> = new Array<number>();
  departmentIds: Array<number> = new Array<number>();
  managerIds: Array<number> = new Array<number>();
  doctorGroupSelector: string;
  specialtySelector: string;
  error: string;
  updateSuccess: boolean;
  private sub: any;
  EmpId: number;
  inputDisabled: boolean;
  isNewEmployee: boolean;
  isDataAvailable: boolean;
  NewEmployee: Employee;
  ImageSrc: string;
  hideFileButton: boolean;

  public uploader: FileUploader = new FileUploader({
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }],
    allowedMimeType: ["image/png", "image/jpg", "image/jpeg"]

  });



  constructor(private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private employeeService: EmployeeService) {
    this.NewEmployee = new Employee();
    this.NewEmployee.Specialties = new Array<string>();
    this.NewEmployee.DoctorGroups = new Array<string>();
    this.error = "";
    this.ImageSrc = "";
    this.hideFileButton = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);
    this.isDataAvailable = false;
  }

  ngOnInit() {

    if (this.isNewEmployee) {
      this.inputDisabled = false;
      this.updateSuccess = false;
      this.getMasterData();
    }

    if (!this.isNewEmployee) {
      this.inputDisabled = true;
      try {
        this.NewEmployee.Id = this.EmpId;
        this.employeeService.getEmployee(this.EmpId)
          .subscribe(
          (data) => {
            this.NewEmployee = data["employee"];
            this.NewEmployee.DOB = data["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = data["employee"]['DOJ'].split("T")[0];
            this.ImageSrc = this.NewEmployee.PhotoURL
            this.hideFileButton = true;
          },
          (error) => { this.error = "Error fetching employee data" }
          );
      }
      catch (e) { this.error = "Error processing employee data" }
    }

  }

  imagePreview(event: Event) {

    var reader = new FileReader();
    reader.addEventListener("load", (e) => {
      this.ImageSrc = e.target['result'];      // Get the event.target.result from the reader (base64 of the image)
    });
    // read the image file as a data URL.
    reader.readAsDataURL(event.target['files'][0]);
    this.hideFileButton = true;
  }

  removeImage() {
    if (this.inputDisabled) {
      return;
    }
    this.ImageSrc = "";
    this.hideFileButton = false;
    this.uploader.clearQueue();
  }


  getMasterData() {
    this.employeeService.getData().subscribe(
      (data) => {
        data['countries'].forEach(country => {
          this.countries.push(country.Name);
          this.countryIds.push(country.Id);
        });
        data['designations'].forEach(designation => {
          this.designations.push(designation.Name);
          this.designationIds.push(designation.Id);
        });
        data['departments'].forEach(department => {
          this.departments.push(department.Name);
          this.departmentIds.push(department.Id);
        });
        data['roles'].forEach(role => {
          this.roles.push(role.Name);
          this.roleIds.push(role.Id);
        });
        this.specialties = data['specialties'];
        this.doctorGroups = data['doctorGroups'];
        this.isDataAvailable = true;
        this.error = "";
      },
      (error) => { this.error = "Error fetching Master Data" }
    );
  }

  getManagers() {
    try {
      this.NewEmployee.Department_Id = this.departmentIds[this.departments.indexOf(this.NewEmployee.Department)];

      this.employeeService.getManagers(this.NewEmployee.Department_Id).subscribe(
        (data) => {
          data['managers'].forEach(manager => {
            this.managers.push(manager.Name);
            this.managerIds.push(manager.Id);
          });
        })
    }
    catch (e) { throw e; }
  }

  editData() {
    this.inputDisabled = !this.inputDisabled;

    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    this.masterService.getStates(this.NewEmployee.Country_Id).subscribe(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
      })
    )

    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    this.masterService.getCities(this.NewEmployee.State_Id).subscribe(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
      })
    )
    this.stateSelected();
    if (!this.isDataAvailable) {
      this.getMasterData(); this.getManagers();
    }
  }

  departmentChange() {
    this.getManagers();
  }

  specialtiesChange() {
    if (this.NewEmployee.Specialties.indexOf(this.specialtySelector) > -1) { }
    else {
      this.specialties = this.specialties.filter((item) => item != this.specialtySelector);
      this.NewEmployee.Specialties.push(this.specialtySelector);
      this.specialtySelector = null;
    }
  }

  removeSpecialty(specialty) {
    if (this.isNewEmployee || (!this.isNewEmployee && !this.inputDisabled)) {
      this.NewEmployee.Specialties = this.NewEmployee.Specialties.filter((item) => item != specialty);
      this.specialties.push(specialty);
      this.specialties.sort(function (a, b) {
        var x = a; var y = b;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

  }


  doctorGroupChange() {
    if (this.NewEmployee.DoctorGroups.indexOf(this.doctorGroupSelector) > -1) { }
    else {
      this.doctorGroups = this.doctorGroups.filter((item) => item != this.doctorGroupSelector);
      this.NewEmployee.DoctorGroups.push(this.doctorGroupSelector);
      this.doctorGroupSelector = null;

    }
  }


  removeDoctorGroup(doctorGroup) {
    if (this.isNewEmployee || (!this.isNewEmployee && !this.inputDisabled)) {
      this.NewEmployee.DoctorGroups = this.NewEmployee.DoctorGroups.filter((item) => item != doctorGroup);
      this.doctorGroups.push(doctorGroup);
      this.doctorGroups.sort(function (a, b) {
        var x = a; var y = b;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

  }

  routeToEmployeeList() {
    this.router.navigate(['employees']);
  }


  countrySelected() {
    this.NewEmployee.State = "";
    this.NewEmployee.City = "";
    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    var countryId = this.countryIds[this.countries.indexOf(this.NewEmployee.Country)];
    this.masterService.getStates(countryId).subscribe(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
      })
    )
  }

  stateSelected() {
    this.NewEmployee.City = "";
    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    var stateId = this.stateIds[this.states.indexOf(this.NewEmployee.State)];
    this.masterService.getCities(stateId).subscribe(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
      })
    )
  }

  saveChanges() {
    this.error = "";
    this.updateSuccess = false;
    this.NewEmployee.City_Id = this.cityIds[this.cities.indexOf(this.NewEmployee.City)];
    this.NewEmployee.State_Id = this.stateIds[this.states.indexOf(this.NewEmployee.State)];
    this.NewEmployee.Country_Id = this.countryIds[this.countries.indexOf(this.NewEmployee.Country)];
    this.NewEmployee.Designation_Id = this.designationIds[this.designations.indexOf(this.NewEmployee.Designation)];
    this.NewEmployee.Department_Id = this.departmentIds[this.departments.indexOf(this.NewEmployee.Department)];
    this.NewEmployee.Manager_Id = this.managerIds[this.managers.indexOf(this.NewEmployee.Manager)];
    this.NewEmployee.Role_Id = this.roleIds[this.roles.indexOf(this.NewEmployee.Role)];


    this.uploader.onBuildItemForm = (item, form) => {
      form.append("employeeData", JSON.stringify(this.NewEmployee));
    }

    try {

      if (this.uploader.queue.length != 1) {
        this.error = "Please select a valid photo for the employee";
      }

      if (this.isNewEmployee) {
        this.uploader.queue.forEach((elem) => {  //used to change url for new employee and edit employee
          elem.alias = "MyForm";
          elem.url = ApiUrl + "/api/Employee/AddEmployee";
        });
        this.uploader.uploadAll();
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          response = JSON.parse(response);
          if (status != 200) {
            this.updateSuccess = false; this.error = "Error updating employee details"
          }
          if (status == 200) {
            this.router.navigate(['new-employee', 'documents', response]);
          }
        }


      }

      else {
        this.uploader.queue.forEach((elem) => {
          elem.alias = "MyForm";
          elem.url = ApiUrl + "/api/Employee/EditEmployee";
        });
        this.uploader.uploadAll();

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          response = JSON.parse(response);
          if (status != 200) {
            this.updateSuccess = false; this.error = "Error updating employee details"
          }
          if (status == 200) {
            this.NewEmployee = response["employee"];
            this.NewEmployee.DOB = response["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = response["employee"]['DOJ'].split("T")[0];
            this.error = "";
            this.updateSuccess = true;
            this.inputDisabled = true;

          }
        }

      }
    }
    catch (e) { throw e; }
  }

}

class Employee {
  Id: number;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  EmployeeNumber: string;
  PrimaryPhone: string;
  SecondaryPhone: string;
  Email: string;
  DOB: Date;
  PhotoURL: string;
  BloodGroup: string;
  PAN: string;
  Aadhar: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  Country: string;
  ZIP: string;
  DOJ: Date;
  ProvisionalPeriod: number;
  EmploymentType: number;
  Designation: string;
  Department: string;
  Manager: string;
  Role: string;
  Specialties: Array<string>;
  City_Id: number;
  State_Id: number;
  Country_Id: number;
  Designation_Id: number;
  Department_Id: number;
  Manager_Id: number;
  DoctorGroups: Array<string>;
  DoctorGroup_Id: number;
  Role_Id: number;
  Active : boolean;
}

