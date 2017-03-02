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
  providers: [DoctorService, MasterService]
})
export class DoctorComponent implements OnInit, AfterViewInit {

  NewDoctor: Doctor;
  error: string;
  private sub: any;
  DocId: number;
  CliId: number;
  inputDisabled: boolean;
  editSuccess: boolean;
  editProgress: boolean;
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
  @ViewChild("jobLevel") jobLevel: ElementRef;
  @ViewChild("voiceGrade") voiceGrade: ElementRef;
  @ViewChild("doctorGroup") doctorGroup: ElementRef;

  constructor(private renderer: Renderer, private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private doctorService: DoctorService) {
    this.NewDoctor = new Doctor();
    this.NewDoctor.Specialties = new Array<string>();
    this.dictationModes = ['Dictaphone', 'Toll Free', 'Email'];
    this.jobLevels = ['L1', 'L1-L3', 'L1-L2-L3'];
    this.voiceGrades = ['A', 'B', 'C', 'D'];
    this.error = "";
    this.editSuccess = false;
    this.editProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.DocId = +params['DocId']
    );
    this.isNewDoctor = isNaN(this.DocId) || this.DocId == 0;
    this.isDataAvailable = false;
  }

  ngAfterViewInit() { }

  ngOnInit() {

    if (this.isNewDoctor) {
      this.inputDisabled = false;
      this.getData();
      this.NewDoctor.Active = true;
    }

    else {
      this.inputDisabled = true;
      document.body.scrollTop = 0;
      try {
        this.NewDoctor.Id = this.DocId;
        this.doctorService.getDoctor(this.DocId).subscribe(
          (data) => this.NewDoctor = data['doctor'],
          (error) => this.error = "Error fetching Doctor Information"
        );
      }
      catch (e) {
        this.error = "Error processing Doctor Information"
      }
    }

  }


  editData() {
    this.inputDisabled = !this.inputDisabled;
    if (!this.isDataAvailable)
      this.getData();


    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    this.masterService.getStates(this.NewDoctor.Country_Id).subscribe(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
      })
    )

    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    this.masterService.getCities(this.NewDoctor.State_Id).subscribe(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
      })
    )

  }

  getData() {
    this.doctorService.getData().subscribe(
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
        this.specialties = data['specialties'];

        //TO REMOVE EXISTING SPECIALITIES FROM LOCAL MASTER DATA
        this.NewDoctor.Specialties.forEach(element => {
          this.specialties = this.specialties.filter((item) => item != element);
        });


        this.isDataAvailable = true;
        this.error = "";
      },
      (error) => { this.error = "Error fetching Master Data" }
    );
  }

  countrySelected() {
    this.NewDoctor.State = "";
    this.NewDoctor.City = "";
    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    var countryId = this.countryIds[this.countries.indexOf(this.NewDoctor.Country)];
    this.masterService.getStates(countryId).subscribe(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
      })
    )
  }

  stateSelected() {
    this.NewDoctor.City = "";
    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    var stateId = this.stateIds[this.states.indexOf(this.NewDoctor.State)];
    this.masterService.getCities(stateId).subscribe(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
      })
    )
  }

  specialtiesChange() {
    if (this.NewDoctor.Specialties.indexOf(this.specialtySelector) > -1) { }
    else {
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
    if (!this.validate()) return;

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;

    try {
      if (this.isNewDoctor) {
        this.doctorService.postDoctor(this.NewDoctor) .subscribe((data) => {
            document.body.scrollTop = 0;
            this.NewDoctor = data['doctor'];
            this.error = "";
            this.editSuccess = true;
            this.editProgress = false;
            this.inputDisabled = true;
          },
          (error) => { this.editSuccess = false; this.editProgress = false; this.error = error['_body']; throw error; }
          );
      }
      else {
        this.doctorService.editDoctor(this.NewDoctor)
          .subscribe((data) => {
            document.body.scrollTop = 0;
            this.NewDoctor = data['doctor'];
            this.error = "";
            this.editSuccess = true;
            this.editProgress = false;
            this.inputDisabled = true;
          },
          (error) => { this.editSuccess = false; this.editProgress = false; this.error = error['_body']; throw error; }
          );
      }
    }
    catch (e) { throw e; }
  }

  validate() {

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;
    var namesRegex = /^[a-zA-Z ]*$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;


    this.NewDoctor.City_Id = this.cityIds[this.cities.indexOf(this.NewDoctor.City)];
    this.NewDoctor.State_Id = this.stateIds[this.states.indexOf(this.NewDoctor.State)];
    this.NewDoctor.Country_Id = this.countryIds[this.countries.indexOf(this.NewDoctor.Country)];
    this.NewDoctor.Client_Id = this.clientIds[this.clients.indexOf(this.NewDoctor.Client)];

    if (!this.NewDoctor.DoctorGroup) {
      this.NewDoctor.DoctorGroup_Id = this.doctorGroupIds[this.doctorGroups.indexOf("Default Group")];
    }
    else {
      this.NewDoctor.DoctorGroup_Id = this.doctorGroupIds[this.doctorGroups.indexOf(this.NewDoctor.DoctorGroup)];
    }


    if (this.NewDoctor.Salutation.trim().length > 5) {
      this.error = "Salutation should not exceed 5 characters"
      this.renderer.invokeElementMethod(this.salutation, 'focus');
      this.editProgress = false;
      return false;
    }


    if (!namesRegex.test(this.NewDoctor.FirstName)) {
      this.error = "First Name should not contain special characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewDoctor.FirstName.trim().length > 35) {
      this.error = "First Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.firstName, 'focus');
      this.editProgress = false;
      return false;
    }
    
    if (!namesRegex.test(this.NewDoctor.MiddleName)) {
      this.error = "Middle Name should not contain special characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewDoctor.MiddleName && this.NewDoctor.MiddleName.trim().length > 20) {
      this.error = "Middle Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.middleName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!namesRegex.test(this.NewDoctor.LastName)) {
      this.error = "Last Name should not contain special characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewDoctor.LastName.trim().length > 35) {
      this.error = "Last Name should not exceed 35 characters"
      this.renderer.invokeElementMethod(this.lastName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!phoneRegex.test(this.NewDoctor.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewDoctor.SecondaryPhone && !phoneRegex.test(this.NewDoctor.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!emailRegex.test(this.NewDoctor.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!this.NewDoctor.Client_Id) {
      this.error = "Please select valid client";
      this.renderer.invokeElementMethod(this.client, 'focus');
      this.editProgress = false;
      return false;
    }


    if (this.NewDoctor.AddressLine1.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine1, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewDoctor.AddressLine2 && this.NewDoctor.AddressLine2.trim().length > 255) {
      this.error = "Address should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.addressLine2, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewDoctor.Country_Id) {
      this.error = "Please select valid country";
      this.renderer.invokeElementMethod(this.country, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!this.NewDoctor.State_Id) {
      this.error = "Please select valid state";
      this.renderer.invokeElementMethod(this.state, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewDoctor.City_Id) {
      this.error = "Please select valid city";
      this.renderer.invokeElementMethod(this.city, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewDoctor.ZIP.trim().length > 10) {
      this.error = "ZIP should not exceed 10 characters"
      this.renderer.invokeElementMethod(this.zip, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.dictationModes.indexOf(this.NewDoctor.DictationMode) == -1) {
      this.error = "Please select a valid Dictation Mode"
      this.renderer.invokeElementMethod(this.dictationMode, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.jobLevels.indexOf(this.NewDoctor.JobLevel) == -1) {
      this.error = "Please select a valid Job Level"
      this.renderer.invokeElementMethod(this.jobLevel, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.voiceGrades.indexOf(this.NewDoctor.VoiceGrade) == -1) {
      this.error = "Please select a valid Voice Grade"
      this.renderer.invokeElementMethod(this.voiceGrade, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewDoctor.DoctorGroup_Id) {
      this.error = "Please select valid Doctor Group";
      this.renderer.invokeElementMethod(this.doctorGroup, 'focus');
      this.editProgress = false;
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
}
