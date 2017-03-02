import { Component, AfterViewInit, ViewChild, Renderer, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
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

export class EmployeeComponent implements OnInit, AfterViewInit {

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
  editSuccess: boolean;
  editProgress: boolean;
  private sub: any;
  EmpId: number;
  inputDisabled: boolean;
  isNewEmployee: boolean;
  isDataAvailable: boolean;
  NewEmployee: Employee;
  ImageSrc: string;
  hideFileButton: boolean;
  bloodGroups: Array<string>;
  employmentTypes: Array<string>;

  @ViewChild("firstName") firstName: ElementRef;
  @ViewChild("middleName") middleName: ElementRef;
  @ViewChild("lastName") lastName: ElementRef;
  @ViewChild("employeeNumber") employeeNumber: ElementRef;
  @ViewChild("primaryPhone") primaryPhone: ElementRef;
  @ViewChild("secondaryPhone") secondaryPhone: ElementRef;
  @ViewChild("email") email: ElementRef;
  @ViewChild("dob") dob: ElementRef;
  @ViewChild("bloodGroup") bloodGroup: ElementRef;
  @ViewChild("pan") pan: ElementRef;
  @ViewChild("aadhar") aadhar: ElementRef;
  @ViewChild("photo") photo: ElementRef;
  @ViewChild("addressLine1") addressLine1: ElementRef;
  @ViewChild("addressLine2") addressLine2: ElementRef;
  @ViewChild("country") country: ElementRef;
  @ViewChild("state") state: ElementRef;
  @ViewChild("city") city: ElementRef;
  @ViewChild("zip") zip: ElementRef;
  @ViewChild("doj") doj: ElementRef;
  @ViewChild("provisionalPeriod") provisionalPeriod: ElementRef;
  @ViewChild("employmentType") employmentType: ElementRef;
  @ViewChild("designation") designation: ElementRef;
  @ViewChild("department") department: ElementRef;
  @ViewChild("manager") manager: ElementRef;
  @ViewChild("role") role: ElementRef;


  public uploader: FileUploader = new FileUploader({
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }],
    allowedMimeType: ["image/png", "image/jpg", "image/jpeg"]

  });

  constructor(private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private employeeService: EmployeeService, private renderer: Renderer) {
    this.NewEmployee = new Employee();
    this.NewEmployee.Specialties = new Array<string>();
    this.NewEmployee.DoctorGroups = new Array<string>();
    this.bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    this.employmentTypes = ['Consultant', 'Permanent'];
    this.error = "";
    this.ImageSrc = "";
    this.hideFileButton = false;
    this.editProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);
    this.isDataAvailable = false;
  }

  ngAfterViewInit() { }

  ngOnInit() {

    if (this.isNewEmployee) {
      this.inputDisabled = false;
      this.editSuccess = false;
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
            this.ImageSrc = this.NewEmployee.PhotoURL;
            if (this.ImageSrc != null) {
              this.hideFileButton = true;
            }
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
    // this.renderer.setElementAttribute(this.photo,"value","");
    this.renderer.setElementProperty(this.photo, "value", "");
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
    if (!this.validate()) return;

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;

    this.uploader.onBuildItemForm = (item, form) => {
      form.append("employeeData", JSON.stringify(this.NewEmployee));
    }

    try {
      if (this.isNewEmployee) {
        this.uploader.queue.forEach((elem) => {  //used to change url for new employee and edit employee
          elem.alias = "MyForm";
          elem.url = ApiUrl + "/api/Employee/AddEmployee";
        });
        this.uploader.uploadAll();
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          response = JSON.parse(response);
          if (status != 200) {
            this.editProgress = false;
            this.editSuccess = false;
            this.error = "Error updating employee details"
          }
          if (status == 200) {
            this.NewEmployee = response["employee"];
            this.NewEmployee.DOB = response["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = response["employee"]['DOJ'].split("T")[0];
            this.error = "";
            this.editSuccess = true;
            this.inputDisabled = true;
            this.editProgress = true;
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
            this.editSuccess = false; this.error = "Error updating employee details"
          }
          if (status == 200) {
            this.NewEmployee = response["employee"];
            this.NewEmployee.DOB = response["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = response["employee"]['DOJ'].split("T")[0];
            this.error = "";
            this.editSuccess = true;
            this.inputDisabled = true;
            this.editProgress = true;
          }
        }

      }
    }
    catch (e) { throw e; }
  }

  validate() {

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;
    var namesRegex = /^[a-zA-Z ]*$/;
    var employeeNumberRegex = /^[A-Za-z]{2}[0-9]{4}/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    var panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}/;
    var aadharRegex = /^[0-9]{12}/;


    this.NewEmployee.City_Id = this.cityIds[this.cities.indexOf(this.NewEmployee.City)];
    this.NewEmployee.State_Id = this.stateIds[this.states.indexOf(this.NewEmployee.State)];
    this.NewEmployee.Country_Id = this.countryIds[this.countries.indexOf(this.NewEmployee.Country)];
    this.NewEmployee.Designation_Id = this.designationIds[this.designations.indexOf(this.NewEmployee.Designation)];
    this.NewEmployee.Department_Id = this.departmentIds[this.departments.indexOf(this.NewEmployee.Department)];
    this.NewEmployee.Manager_Id = this.managerIds[this.managers.indexOf(this.NewEmployee.Manager)];
    this.NewEmployee.Role_Id = this.roleIds[this.roles.indexOf(this.NewEmployee.Role)];



    if (!namesRegex.test(this.NewEmployee.FirstName)) {
      this.error = "First Name should not contain special characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewEmployee.FirstName.trim().length > 35) {
      this.error = "First Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!namesRegex.test(this.NewEmployee.MiddleName)) {
      this.error = "Middle Name should not contain special characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewEmployee.MiddleName && this.NewEmployee.MiddleName.trim().length > 20) {
      this.error = "Middle Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!namesRegex.test(this.NewEmployee.LastName)) {
      this.error = "Last Name should not contain special characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewEmployee.LastName.trim().length > 35) {
      this.error = "Last Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!employeeNumberRegex.test(this.NewEmployee.EmployeeNumber)) {
      this.error = "Please enter a valid Employee Number (eg : MX0001)"
      this.renderer.invokeElementMethod(this.employeeNumber, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewEmployee.EmployeeNumber.trim().length > 6) {
      this.error = "Employee Number should not exceed 6 characters"
      this.renderer.invokeElementMethod(this.employeeNumber, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!phoneRegex.test(this.NewEmployee.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewEmployee.SecondaryPhone && !phoneRegex.test(this.NewEmployee.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!emailRegex.test(this.NewEmployee.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email, 'focus');
      this.editProgress = false;
      return false;
    }

    var dob = new Date(this.NewEmployee.DOB);
    var doj = new Date(this.NewEmployee.DOJ);

    if (dob.getTime() >= new Date().getTime()) {
      this.error = "Please select a valid DOB";
      this.renderer.invokeElementMethod(this.dob, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.bloodGroups.indexOf(this.NewEmployee.BloodGroup) == -1) {
      this.error = "Please select a valid Blood Group"
      this.renderer.invokeElementMethod(this.bloodGroup, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewEmployee.PAN && !panRegex.test(this.NewEmployee.PAN)) {
      this.error = "Please enter a valid PAN";
      this.renderer.invokeElementMethod(this.pan, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewEmployee.Aadhar && !aadharRegex.test(this.NewEmployee.Aadhar)) {
      this.error = "Please enter a valid aadhar (12 digits)";
      this.renderer.invokeElementMethod(this.aadhar, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.uploader.queue.length != 1) {
      this.error = "Please select a valid photo for the employee";
      this.renderer.invokeElementMethod(this.photo.nativeElement, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewEmployee.AddressLine1.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine1, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewEmployee.AddressLine2 && this.NewEmployee.AddressLine2.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine2, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.Country_Id) {
      this.error = "Please select valid country";
      this.renderer.invokeElementMethod(this.country, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!this.NewEmployee.State_Id) {
      this.error = "Please select valid state";
      this.renderer.invokeElementMethod(this.state, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.City_Id) {
      this.error = "Please select valid city";
      this.renderer.invokeElementMethod(this.city, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewEmployee.ZIP.trim().length > 10) {
      this.error = "ZIP should not exceed 10 characters"
      this.renderer.invokeElementMethod(this.zip, 'focus');
      this.editProgress = false;
      return false;
    }

    if (doj.getTime() <= dob.getTime() || doj.getTime() >= new Date().getTime()) {
      this.error = "Please select a valid DOJ"
      this.renderer.invokeElementMethod(this.doj, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.employmentTypes.indexOf(this.NewEmployee.EmploymentType) == -1) {
      this.error = "Please select a valid Employment Type"
      this.renderer.invokeElementMethod(this.employmentType, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.Designation_Id) {
      this.error = "Please select valid designation";
      this.renderer.invokeElementMethod(this.designation, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.Department_Id) {
      this.error = "Please select valid department";
      this.renderer.invokeElementMethod(this.department, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.Manager_Id && this.NewEmployee.Manager) {
      this.error = "Please select valid manager";
      this.renderer.invokeElementMethod(this.manager, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewEmployee.Role_Id) {
      this.error = "Please select valid role";
      this.renderer.invokeElementMethod(this.role, 'focus');
      this.editProgress = false;
      return false;
    }

    return true;
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
  EmploymentType: string;
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
  Active: boolean;
}

