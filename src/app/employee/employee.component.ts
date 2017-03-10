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
  providers: [EmployeeService]
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
  private sub: any;
  EmpId: number;
  inputDisabled: boolean;
  isNewEmployee: boolean;
  isDataAvailable: boolean;
  NewEmployee: Employee;
  ImageSrc: string;
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
  @ViewChild("dor") dor: ElementRef;
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
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);
    this.isDataAvailable = false;
  }

  ngAfterViewInit() { }

  ngOnInit() {

    this.masterService.postAlert("remove", "");
    this.masterService.changeLoading(true);
    if (this.isNewEmployee) {
      this.inputDisabled = false;
      this.getMasterData();
      this.ImageSrc = "../images/dummy-profile-pic.png";
    }

    if (!this.isNewEmployee) {
      this.inputDisabled = true;
      try {
        this.NewEmployee.Id = this.EmpId;
        this.employeeService.getEmployee(this.EmpId)
          .then(
          (data) => {
            this.NewEmployee = data["employee"];
            this.NewEmployee.DOB = data["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = data["employee"]['DOJ'].split("T")[0];
            this.NewEmployee.DOR = data["employee"]['DOR'] ? data["employee"]['DOR'].split("T")[0] : null;
            this.ImageSrc = this.NewEmployee.PhotoURL;
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.error = "Error fetching employee data";
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
          );
      }
      catch (e) {
        this.error = "Error processing employee data";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    }

  }

  imagePreview(event: Event) {

    var reader = new FileReader();
    reader.addEventListener("load", (e) => {
      this.ImageSrc = e.target['result'];      // Get the event.target.result from the reader (base64 of the image)
    });
    // read the image file as a data URL.
    reader.readAsDataURL(event.target['files'][0]);
  }

  removeImage() {
    if (this.inputDisabled) {
      return;
    }
    this.ImageSrc = "";
    this.uploader.clearQueue();
    this.renderer.setElementProperty(this.photo, "value", "");
  }

  getMasterData() {
    this.employeeService.getData().then(
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
        if (this.NewEmployee.Department) {
          this.getManagers();
        }
        this.specialties = data['specialties'];
        this.doctorGroups = data['doctorGroups'];
        this.isDataAvailable = true;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Master Data";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }

  getManagers() {
    try {
      this.masterService.changeLoading(true);
      this.managers = new Array<string>();
      this.managerIds = new Array<number>();
      this.masterService.changeLoading(true);
      this.NewEmployee.Department_Id = this.departmentIds[this.departments.findIndex((item) => item.toLowerCase() == this.NewEmployee.Department.toLowerCase())];
      if (!this.NewEmployee.Department_Id) {
        this.masterService.changeLoading(false);
        return;
      }
      this.employeeService.getManagers(this.NewEmployee.Department_Id).then(
        (data) => {
          data['managers'].forEach(manager => {
            this.managers.push(manager.Name);
            this.managerIds.push(manager.Id);
          });
        })
      this.masterService.changeLoading(false);
    }
    catch (e) { throw e; }
  }

  editData() {

    this.inputDisabled = !this.inputDisabled;
    if (!this.isDataAvailable) {
      this.masterService.changeLoading(true);

      this.states = new Array<string>();
      this.stateIds = new Array<number>();

      this.cities = new Array<string>();
      this.cityIds = new Array<number>();

      Promise.all([
        this.masterService.getStates(this.NewEmployee.Country_Id).then(
          (data) => data['states'].forEach(state => {
            this.states.push(state.Name);
            this.stateIds.push(state.Id);
          })
        ),

        this.masterService.getCities(this.NewEmployee.State_Id).then(
          (data) => {
            data['cities'].forEach(city => {
              this.cities.push(city.Name);
              this.cityIds.push(city.Id);
            })
          }
        )
      ]).then(() => this.masterService.changeLoading(false));


      this.masterService.changeLoading(true);
      this.getMasterData()
    }
  }

  departmentChange() {
    if (this.NewEmployee.Department != "MT") {
      this.NewEmployee.Specialties = new Array<string>();
      this.NewEmployee.DoctorGroups = new Array<string>();
    }
    this.getManagers();
  }

  specialtiesChange() {
    if (this.NewEmployee.Specialties.findIndex((item) => item.toLowerCase() == this.specialtySelector.toLowerCase()) > -1) { }
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
    if (this.NewEmployee.DoctorGroups.findIndex((item) => item.toLowerCase() == this.doctorGroupSelector.toLowerCase()) > -1) { }
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
    this.masterService.changeLoading(true);
    this.NewEmployee.State = "";
    this.NewEmployee.City = "";
    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    var countryId = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == this.NewEmployee.Country.toLowerCase())];
    if (!countryId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getStates(countryId).then(
      (data) => {
        data['states'].forEach(state => {
          this.states.push(state.Name);
          this.stateIds.push(state.Id);
        });
        this.masterService.changeLoading(false);
      }
    )
  }

  stateSelected() {
    this.masterService.changeLoading(true);
    this.NewEmployee.City = "";
    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    var stateId = this.stateIds[this.states.findIndex((item) => item.toLowerCase() == this.NewEmployee.State.toLowerCase())];
    if (!stateId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getCities(stateId).then(
      (data) => {
        data['cities'].forEach(city => {
          this.cities.push(city.Name);
          this.cityIds.push(city.Id);
        });
        this.masterService.changeLoading(false);
      }
    )

  }

  saveChanges() {

    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    this.uploader.onBuildItemForm = (item, form) => {
      form.append("employeeData", JSON.stringify(this.NewEmployee));
    }

    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials = false;

    try {
      if (this.isNewEmployee) {
        this.uploader.queue.forEach((elem) => {  //used to change url for new employee and edit employee
          elem.alias = "MyForm";
          elem.url = ApiUrl + "/api/Employee/AddEmployee";
        });
        this.uploader.uploadItem(file);
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          response = JSON.parse(response);
          if (status != 200) {
            this.error = response;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
          if (status == 200) {
            this.NewEmployee = response["employee"];
            this.NewEmployee.DOB = response["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = response["employee"]['DOJ'].split("T")[0];
            this.NewEmployee.DOR = response["employee"]['DOR'] ? response["employee"]['DOR'].split("T")[0] : null;
            this.inputDisabled = true;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("success", "Employee added successfully");
          }
        }
      }

      else {
        this.uploader.queue.forEach((elem) => {
          elem.alias = "MyForm";
          elem.url = ApiUrl + "/api/Employee/EditEmployee";
        });
        this.uploader.uploadItem(file);

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          response = JSON.parse(response);
          if (status != 200) {
            this.error = response;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
          if (status == 200) {
            this.NewEmployee = response["employee"];
            this.NewEmployee.DOB = response["employee"]['DOB'].split("T")[0];
            this.NewEmployee.DOJ = response["employee"]['DOJ'].split("T")[0];
            this.NewEmployee.DOR = response["employee"]['DOR'] ? response["employee"]['DOR'].split("T")[0] : null;
            this.inputDisabled = true;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("success", "Employee details updated successfully");
          }
        }
      }
    }
    catch (e) {
      this.error = "Error updating employee details";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      throw e;
    }
  }

  validate() {

    this.masterService.postAlert("remove", "");

    var namesRegex = /^[a-zA-Z ]*$/;
    var employeeNumberRegex = /^[A-Za-z]{3}[0-9]{4}/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    var panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}/;
    var aadharRegex = /^[0-9]{12}/;




    this.NewEmployee.City_Id = this.cityIds[this.cities.findIndex((item) => item.toLowerCase() == this.NewEmployee.City.toLowerCase())];
    this.NewEmployee.State_Id = this.stateIds[this.states.findIndex((item) => item.toLowerCase() == this.NewEmployee.State.toLowerCase())];
    this.NewEmployee.Country_Id = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == this.NewEmployee.Country.toLowerCase())];
    this.NewEmployee.Designation_Id = this.designationIds[this.designations.findIndex((item) => item.toLowerCase() == this.NewEmployee.Designation.toLowerCase())];
    this.NewEmployee.Department_Id = this.departmentIds[this.departments.findIndex((item) => item.toLowerCase() == this.NewEmployee.Department.toLowerCase())];
    this.NewEmployee.Manager_Id = this.managerIds[this.managers.findIndex((item) => item.toLowerCase() == this.NewEmployee.Manager.toLowerCase())];
    this.NewEmployee.Role_Id = this.roleIds[this.roles.findIndex((item) => item.toLowerCase() == this.NewEmployee.Role.toLowerCase())];



    if (!namesRegex.test(this.NewEmployee.FirstName)) {
      this.error = "First Name should not contain special characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      return false;
    }
    if (this.NewEmployee.FirstName.trim().length > 35) {
      this.error = "First Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewEmployee.MiddleName)) {
      this.error = "Middle Name should not contain special characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      return false;
    }
    if (this.NewEmployee.MiddleName && this.NewEmployee.MiddleName.trim().length > 20) {
      this.error = "Middle Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewEmployee.LastName)) {
      this.error = "Last Name should not contain special characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      return false;
    }
    if (this.NewEmployee.LastName.trim().length > 35) {
      this.error = "Last Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      return false;
    }
    if (this.NewEmployee.EmployeeNumber && !employeeNumberRegex.test(this.NewEmployee.EmployeeNumber)) {
      this.error = "Please enter a valid Employee Number (eg : MX0001)"
      this.renderer.invokeElementMethod(this.employeeNumber, 'focus');
      return false;
    }
    if (this.NewEmployee.EmployeeNumber && this.NewEmployee.EmployeeNumber.trim().length > 7) {
      this.error = "Employee Number should not exceed 7 characters"
      this.renderer.invokeElementMethod(this.employeeNumber, 'focus');
      return false;
    }
    if (!phoneRegex.test(this.NewEmployee.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone, 'focus');
      return false;
    }
    if (this.NewEmployee.SecondaryPhone && !phoneRegex.test(this.NewEmployee.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone, 'focus');
      return false;
    }

    if (!emailRegex.test(this.NewEmployee.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email, 'focus');
      return false;
    }

    var dob = new Date(this.NewEmployee.DOB);
    var doj = new Date(this.NewEmployee.DOJ);
    var dor = this.NewEmployee.DOR ? new Date(this.NewEmployee.DOR) : null;

    if (dob.getTime() >= new Date().getTime()) {
      this.error = "Please select a valid DOB";
      this.renderer.invokeElementMethod(this.dob, 'focus');
      return false;
    }

    if (this.bloodGroups.findIndex((item) => item.toLowerCase() == this.NewEmployee.BloodGroup.toLowerCase()) == -1) {
      this.error = "Please select a valid Blood Group"
      this.renderer.invokeElementMethod(this.bloodGroup, 'focus');
      return false;
    }

    if (this.NewEmployee.PAN && !panRegex.test(this.NewEmployee.PAN)) {
      this.error = "Please enter a valid PAN";
      this.renderer.invokeElementMethod(this.pan, 'focus');
      return false;
    }

    if (this.NewEmployee.Aadhar && !aadharRegex.test(this.NewEmployee.Aadhar)) {
      this.error = "Please enter a valid aadhar (12 digits)";
      this.renderer.invokeElementMethod(this.aadhar, 'focus');
      return false;
    }

    if (this.uploader.queue.length < 1) {
      this.error = "Please select a valid photo for the employee";
      this.renderer.invokeElementMethod(this.photo.nativeElement, 'focus');
      return false;
    }

    if (this.NewEmployee.AddressLine1.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine1, 'focus');
      return false;
    }

    if (this.NewEmployee.AddressLine2 && this.NewEmployee.AddressLine2.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine2, 'focus');
      return false;
    }

    if (!this.NewEmployee.Country_Id) {
      this.error = "Please select valid country";
      this.renderer.invokeElementMethod(this.country, 'focus');
      return false;
    }
    if (!this.NewEmployee.State_Id) {
      this.error = "Please select valid state";
      this.renderer.invokeElementMethod(this.state, 'focus');
      return false;
    }

    if (!this.NewEmployee.City_Id) {
      this.error = "Please select valid city";
      this.renderer.invokeElementMethod(this.city, 'focus');
      return false;
    }

    if (this.NewEmployee.ZIP.trim().length > 10) {
      this.error = "ZIP should not exceed 10 characters"
      this.renderer.invokeElementMethod(this.zip, 'focus');
      return false;
    }

    if (doj.getTime() <= dob.getTime() || doj.getTime() >= new Date().getTime()) {
      this.error = "Please select a valid DOJ"
      this.renderer.invokeElementMethod(this.doj, 'focus');
      return false;
    }


    if (this.NewEmployee.DOR && (dor.getTime() <= dob.getTime() || dor.getTime() <= doj.getTime())) {
      this.error = "Please select a valid DOR"
      this.renderer.invokeElementMethod(this.dor, 'focus');
      return false;
    }

    if (this.employmentTypes.findIndex((item) => item.toLowerCase() == this.NewEmployee.EmploymentType.toLowerCase()) == -1) {
      this.error = "Please select a valid Employment Type"
      this.renderer.invokeElementMethod(this.employmentType, 'focus');
      return false;
    }

    if (!this.NewEmployee.Designation_Id) {
      this.error = "Please select valid designation";
      this.renderer.invokeElementMethod(this.designation, 'focus');
      return false;
    }

    if (!this.NewEmployee.Department_Id) {
      this.error = "Please select valid department";
      this.renderer.invokeElementMethod(this.department, 'focus');
      return false;
    }

    if (!this.NewEmployee.Manager_Id && this.NewEmployee.Manager) {
      this.error = "Please select valid manager";
      this.renderer.invokeElementMethod(this.manager, 'focus');
      return false;
    }

    if (!this.NewEmployee.Role_Id) {
      this.error = "Please select valid role";
      this.renderer.invokeElementMethod(this.role, 'focus');
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
  DOR: Date;
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

