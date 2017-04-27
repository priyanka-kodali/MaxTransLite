import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/Rx';
import { DoctorService } from './doctor.service';
import { MasterService } from '../app.service';


@Component({
  moduleId: module.id,
  selector: 'app-doctor',
  templateUrl: 'doctor.component.html',
  styleUrls: ['doctor.component.scss'],
  providers: [DoctorService]
})
export class DoctorComponent implements OnInit, AfterViewInit {

  NewDoctor: Doctor;
  error: string;
  private sub: any;
  DocId: number;
  CliId: number;
  inputDisabled: boolean;
  cities: Array<string> = new Array<string>();
  states: Array<string> = new Array<string>();
  countries: Array<string> = new Array<string>();
  specialties: Array<string> = new Array<string>();
  doctorGroups: Array<string> = new Array<string>();
  specialtySelector: string;
  clients: Array<string> = new Array<string>();
  cityIds: Array<number> = new Array<number>();
  stateIds: Array<number> = new Array<number>();
  countryIds: Array<number> = new Array<number>();
  clientIds: Array<number> = new Array<number>();
  doctorGroupIds: Array<number> = new Array<number>();
  isNewDoctor: boolean;
  isDataAvailable: boolean;
  dictationModes: Array<string> = new Array<string>();
  jobLevels: Array<string> = new Array<string>();
  voiceGrades: Array<string> = new Array<string>();

  @ViewChild("salutation") salutation: ElementRef;
  @ViewChild("firstName") firstName: ElementRef;
  @ViewChild("middleName") middleName: ElementRef;
  @ViewChild("lastName") lastName: ElementRef;
  @ViewChild("primaryPhone") primaryPhone: ElementRef;
  @ViewChild("secondaryPhone") secondaryPhone: ElementRef;
  @ViewChild("email") email: ElementRef;
  @ViewChild("client") client: ElementRef;
  @ViewChild("addressLine1") addressLine1: ElementRef;
  @ViewChild("addressLine2") addressLine2: ElementRef;
  @ViewChild("country") country: ElementRef;
  @ViewChild("state") state: ElementRef;
  @ViewChild("city") city: ElementRef;
  @ViewChild("zip") zip: ElementRef;
  @ViewChild("dictationMode") dictationMode: ElementRef;
  @ViewChild("idigitalId") idigitalId: ElementRef;
  @ViewChild("idigitalAuthorId") idigitalAuthorId: ElementRef;
  @ViewChild("jobLevel") jobLevel: ElementRef;
  @ViewChild("voiceGrade") voiceGrade: ElementRef;
  @ViewChild("doctorGroup") doctorGroup: ElementRef;

  constructor(private renderer: Renderer, private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private doctorService: DoctorService) {
    this.masterService.postAlert("remove", "");
    this.NewDoctor = new Doctor();
    this.NewDoctor.Specialties = new Array<string>();
    this.dictationModes = ['Dictaphone', 'Toll Free', 'Dictaphone & Toll Free' , 'Email'];
    this.jobLevels = ['L1', 'L1-L3', 'L1-L2-L3'];
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.DocId = +params['DocId']
    );
    this.isNewDoctor = isNaN(this.DocId) || this.DocId == 0;
    this.isDataAvailable = false;
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.salutation.nativeElement, 'focus');
  }

  ngOnInit() {

    this.masterService.changeLoading(true);

    if (this.isNewDoctor) {
      this.inputDisabled = false;
      this.NewDoctor.Active = true;
      this.getData();
    }

    else {
      this.inputDisabled = true;
      document.body.scrollTop = 0;
      try {
        this.NewDoctor.Id = this.DocId;
        this.doctorService.getDoctor(this.DocId).then(
          (data) => {
            this.NewDoctor = data['doctor'];
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.error = "Error fetching Doctor Information";
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
        );
      }
      catch (e) {
        this.error = "Error processing Doctor Information";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    }

  }

  editData() {
    this.masterService.changeLoading(true);
    this.inputDisabled = !this.inputDisabled;
    if (!this.isDataAvailable) {

      this.states = new Array<string>();
      this.stateIds = new Array<number>();
      this.masterService.getStates(this.NewDoctor.Country_Id).then(
        (data) => data['states'].forEach(state => {
          this.states.push(state.Name);
          this.stateIds.push(state.Id);
        })
      )

      this.cities = new Array<string>();
      this.cityIds = new Array<number>();
      this.masterService.getCities(this.NewDoctor.State_Id).then(
        (data) => data['cities'].forEach(city => {
          this.cities.push(city.Name);
          this.cityIds.push(city.Id);
        })
      )
      this.getData();
    }

    this.masterService.changeLoading(false);

  }

  getData() {
    this.masterService.changeLoading(true);
    this.doctorService.getData().then(
      (data) => {
        data['countries'].forEach(country => {
          this.countries.push(country.Name);
          this.countryIds.push(country.Id);
        });
        data['clients'].forEach(client => {
          this.clients.push(client.Name);
          this.clientIds.push(client.Id);
        });
        data['doctorGroups'].forEach(group => {
          this.doctorGroups.push(group.Name);
          this.doctorGroupIds.push(group.Id);
        });
        this.voiceGrades=data["voiceGrades"];
        this.specialties = data['specialties'];

        //TO REMOVE EXISTING SPECIALITIES FROM LOCAL MASTER DATA
        this.NewDoctor.Specialties.forEach(element => {
          this.specialties = this.specialties.filter((item) => item != element);
        });

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

  countrySelected() {
    if (this.NewDoctor.Country) {
      this.NewDoctor.State = "";
      this.NewDoctor.City = "";
      this.getStates();
    }
  }

  stateSelected() {
    if (this.NewDoctor.State) {
      this.NewDoctor.City = "";
      this.getCities();
    }
  }

  getStates() {
    this.masterService.changeLoading(true);
    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    var countryId = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == this.NewDoctor.Country.toLowerCase())];
    if (!countryId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getStates(countryId).then(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
        this.masterService.changeLoading(false);
      })
    )
  }

  getCities() {
    this.masterService.changeLoading(true);
    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    var stateId = this.stateIds[this.states.findIndex((item) => item.toLowerCase() == this.NewDoctor.State.toLowerCase())];
    if (!stateId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getCities(stateId).then(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
        this.masterService.changeLoading(false);
      })
    )
  }

  specialtiesChange() {
    this.specialtySelector = this.specialtySelector ? this.specialtySelector.trim() : this.specialtySelector;
    if (this.NewDoctor.Specialties.findIndex((item) => item.toLowerCase() == this.specialtySelector.toLowerCase()) > -1) {
      return;
    }
    else {
      if (this.specialties.findIndex((item) => item.toLowerCase() == this.specialtySelector.toLowerCase()) == -1) {
        return;
      }
      this.specialties = this.specialties.filter((item) => item != this.specialtySelector);
      this.NewDoctor.Specialties.push(this.specialtySelector);
      this.specialtySelector = null;
    }
  }

  removeSpecialty(specialty) {
    if (this.isNewDoctor || (!this.isNewDoctor && !this.inputDisabled)) {
      this.NewDoctor.Specialties = this.NewDoctor.Specialties.filter((item) => item != specialty);
      this.specialties.push(specialty);
      this.specialties.sort(function (a, b) {
        var x = a; var y = b;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

  }

  goToList() {
    this.router.navigate(['doctors']);
  }

  saveChanges() {
    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.NewDoctor.Salutation = this.NewDoctor.Salutation.trim();
    this.NewDoctor.FirstName = this.NewDoctor.FirstName.trim();
    this.NewDoctor.MiddleName = this.NewDoctor.MiddleName ? this.NewDoctor.MiddleName.trim() : this.NewDoctor.MiddleName;
    this.NewDoctor.LastName = this.NewDoctor.LastName.trim();
    this.NewDoctor.PrimaryPhone = this.NewDoctor.PrimaryPhone.trim();
    this.NewDoctor.SecondaryPhone = this.NewDoctor.SecondaryPhone ? this.NewDoctor.SecondaryPhone.trim() : this.NewDoctor.SecondaryPhone;
    this.NewDoctor.Email = this.NewDoctor.Email.trim();
    this.NewDoctor.Client = this.NewDoctor.Client.trim();
    this.NewDoctor.AddressLine1 = this.NewDoctor.AddressLine1.trim();
    this.NewDoctor.AddressLine2 = this.NewDoctor.AddressLine2 ? this.NewDoctor.AddressLine2.trim() : this.NewDoctor.AddressLine2;
    this.NewDoctor.ZIP = this.NewDoctor.ZIP.trim();
    this.NewDoctor.IdigitalId = this.NewDoctor.IdigitalId ? this.NewDoctor.IdigitalId.trim() : this.NewDoctor.IdigitalId;
    this.NewDoctor.IdigitalAuthorId = this.NewDoctor.IdigitalAuthorId ? this.NewDoctor.IdigitalAuthorId.trim() : this.NewDoctor.IdigitalAuthorId;


    this.masterService.postAlert("remove", "");

    try {
      if (this.isNewDoctor) {
        this.doctorService.postDoctor(this.NewDoctor).then((data) => {
          document.body.scrollTop = 0;
          this.NewDoctor = data['doctor'];
          this.inputDisabled = true;
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Doctor added successfully");
         this.specialtySelector="";
          this.isNewDoctor = false;
        },
          (error) => {
            this.error = error['_body'];
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
            throw error;
          }
        );
      }
      else {
        this.doctorService.editDoctor(this.NewDoctor)
          .then((data) => {
            document.body.scrollTop = 0;
            this.NewDoctor = data['doctor'];
            this.inputDisabled = true;
            this.masterService.postAlert("success", "Doctor details updated successfully");
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.error = error['_body'];
            this.masterService.postAlert("error", this.error);
            this.masterService.changeLoading(false);
            throw error;
          }
          );
      }
    }
    catch (e) { throw e; }
  }

  validate() {

    this.masterService.postAlert("remove", "");
    var namesRegex = /^[a-zA-Z0-9 ]*$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;


    this.NewDoctor.City_Id = this.cityIds[this.cities.findIndex((item) => item.toLowerCase() == this.NewDoctor.City.toLowerCase())];
    this.NewDoctor.State_Id = this.stateIds[this.states.findIndex((item) => item.toLowerCase() == this.NewDoctor.State.toLowerCase())];
    this.NewDoctor.Country_Id = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == this.NewDoctor.Country.toLowerCase())];
    this.NewDoctor.Client_Id = this.clientIds[this.clients.findIndex((item) => item.toLowerCase() == this.NewDoctor.Client.toLowerCase())];

    if (!this.NewDoctor.DoctorGroup) {
      this.NewDoctor.DoctorGroup_Id = this.doctorGroupIds[this.doctorGroups.findIndex((item) => item.toLowerCase() == "default group")];
    }
    else {
      this.NewDoctor.DoctorGroup_Id = this.doctorGroupIds[this.doctorGroups.findIndex((item) => item.toLowerCase() == this.NewDoctor.DoctorGroup.toLowerCase())];
    }


    if (this.NewDoctor.Salutation.trim().length > 5) {
      this.error = "Salutation should not exceed 5 characters"
      this.renderer.invokeElementMethod(this.salutation.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.Salutation.trim().length == 0) {
      this.error = "Salutation should not be empty"
      this.renderer.invokeElementMethod(this.salutation.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.FirstName.trim().length == 0) {
      this.error = "First Name should not be empty"
      this.renderer.invokeElementMethod(this.firstName.nativeElement, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewDoctor.FirstName)) {
      this.error = "First Name should not contain special characters"
      this.renderer.invokeElementMethod(this.firstName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.FirstName.trim().length > 35) {
      this.error = "First Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.firstName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.MiddleName && this.NewDoctor.MiddleName.trim().length == 0) {
      this.error = "Middle Name should not be empty"
      this.renderer.invokeElementMethod(this.middleName.nativeElement, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewDoctor.MiddleName)) {
      this.error = "Middle Name should not contain special characters"
      this.renderer.invokeElementMethod(this.middleName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.MiddleName && this.NewDoctor.MiddleName.trim().length > 20) {
      this.error = "Middle Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.middleName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.LastName.trim().length == 0) {
      this.error = "Last Name should not be empty"
      this.renderer.invokeElementMethod(this.lastName.nativeElement, 'focus');
      return false;
    }
    if (!namesRegex.test(this.NewDoctor.LastName)) {
      this.error = "Last Name should not contain special characters"
      this.renderer.invokeElementMethod(this.lastName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.LastName.trim().length > 35) {
      this.error = "Last Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.lastName.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.PrimaryPhone.trim().length == 0) {
      this.error = "Primary Phone should not be empty"
      this.renderer.invokeElementMethod(this.primaryPhone.nativeElement, 'focus');
      return false;
    }
    if (!phoneRegex.test(this.NewDoctor.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.SecondaryPhone && this.NewDoctor.SecondaryPhone.trim().length == 0) {
      this.error = "Secondary Phone should not be empty"
      this.renderer.invokeElementMethod(this.secondaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.SecondaryPhone && !phoneRegex.test(this.NewDoctor.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.Email.trim().length == 0) {
      this.error = "Email should not be empty"
      this.renderer.invokeElementMethod(this.email.nativeElement, 'focus');
      return false;
    }
    if (!emailRegex.test(this.NewDoctor.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email.nativeElement, 'focus');
      return false;
    }
    if (!this.NewDoctor.Client_Id) {
      this.error = "Please select valid client";
      this.renderer.invokeElementMethod(this.client.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.AddressLine1.trim().length == 0) {
      this.error = "Address should not be empty"
      this.renderer.invokeElementMethod(this.addressLine1.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.AddressLine1.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine1.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.AddressLine2 && this.NewDoctor.AddressLine2.trim().length == 0) {
      this.error = "Address should not be empty"
      this.renderer.invokeElementMethod(this.addressLine2.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.AddressLine2 && this.NewDoctor.AddressLine2.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine2.nativeElement, 'focus');
      return false;
    }

    if (!this.NewDoctor.Country_Id) {
      this.error = "Please select valid country";
      this.renderer.invokeElementMethod(this.country.nativeElement, 'focus');
      return false;
    }
    if (!this.NewDoctor.State_Id) {
      this.error = "Please select valid state";
      this.renderer.invokeElementMethod(this.state.nativeElement, 'focus');
      return false;
    }

    if (!this.NewDoctor.City_Id) {
      this.error = "Please select valid city";
      this.renderer.invokeElementMethod(this.city.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.ZIP.trim().length == 0) {
      this.error = "ZIP should not be empty"
      this.renderer.invokeElementMethod(this.zip.nativeElement, 'focus');
      return false;
    }
    if (this.NewDoctor.ZIP.trim().length > 10) {
      this.error = "ZIP should not exceed 10 characters"
      this.renderer.invokeElementMethod(this.zip.nativeElement, 'focus');
      return false;
    }

    if (this.dictationModes.findIndex((item) => item.toLowerCase() == this.NewDoctor.DictationMode.toLowerCase()) == -1) {
      this.error = "Please select a valid Dictation Mode"
      this.renderer.invokeElementMethod(this.dictationMode.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.DictationMode != "Toll Free" && this.NewDoctor.DictationMode != "Dictaphone & Toll Free") {
      this.NewDoctor.IdigitalId = null;
      this.NewDoctor.IdigitalAuthorId = null;
    }

    if (this.NewDoctor.IdigitalId && this.NewDoctor.IdigitalId.trim().length == 0) {
      this.error = "Idigital Id should not be empty"
      this.renderer.invokeElementMethod(this.idigitalId.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.IdigitalAuthorId && this.NewDoctor.IdigitalAuthorId.trim().length == 0) {
      this.error = "Idigital Author Id should not be empty"
      this.renderer.invokeElementMethod(this.idigitalAuthorId.nativeElement, 'focus');
      return false;
    }

    if (this.jobLevels.findIndex((item) => item.toLowerCase() == this.NewDoctor.JobLevel.toLowerCase()) == -1) {
      this.error = "Please select a valid Job Level"
      this.renderer.invokeElementMethod(this.jobLevel.nativeElement, 'focus');
      return false;
    }

    if (this.voiceGrades.findIndex((item) => item.toLowerCase() == this.NewDoctor.VoiceGrade.toLowerCase()) == -1) {
      this.error = "Please select a valid Voice Grade"
      this.renderer.invokeElementMethod(this.voiceGrade.nativeElement, 'focus');
      return false;
    }

    if (this.NewDoctor.DoctorGroup && !this.NewDoctor.DoctorGroup_Id) {
      this.error = "Please select valid Doctor Group";
      this.renderer.invokeElementMethod(this.doctorGroup.nativeElement, 'focus');
      return false;
    }

    return true;
  }

}



class Doctor {
  Id: number;
  Salutation: string
  FirstName: string;
  MiddleName: string;
  LastName: string;
  PrimaryPhone: string;
  SecondaryPhone: string;
  Email: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  Country: string;
  City_Id: number;
  State_Id: number;
  Country_Id: number;
  ZIP: string;
  Specialties: Array<string>;
  DictationMode: string
  JobLevel: string
  VoiceGrade: string
  MacroPercent: number
  Client: string
  Client_Id: number;
  DoctorGroup: string;
  DoctorGroup_Id: number;
  Active: boolean;
  IdigitalId: string;
  IdigitalAuthorId: string;
}
