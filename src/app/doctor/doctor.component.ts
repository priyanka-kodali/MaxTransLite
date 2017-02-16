import { Component, OnInit, Input } from '@angular/core';
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
export class DoctorComponent implements OnInit {

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



  constructor(private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private doctorService: DoctorService) {
    this.NewDoctor = new Doctor();
    this.NewDoctor.Specialties = new Array<string>();
    this.error = "";
    this.editSuccess = false;
    this.editProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.DocId = +params['DocId']
    );
    this.isNewDoctor = isNaN(this.DocId) || this.DocId == 0;
    this.isDataAvailable = false;
  }

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
    this.editProgress = true;
    this.NewDoctor.City_Id = this.cityIds[this.cities.indexOf(this.NewDoctor.City)];
    this.NewDoctor.State_Id = this.stateIds[this.states.indexOf(this.NewDoctor.State)];
    this.NewDoctor.Country_Id = this.countryIds[this.countries.indexOf(this.NewDoctor.Country)];
    this.NewDoctor.Client_Id = this.clientIds[this.clients.indexOf(this.NewDoctor.Client)];
    this.NewDoctor.DoctorGroup_Id = this.doctorGroupIds[this.doctorGroups.indexOf(this.NewDoctor.DoctorGroup)];
    try {
      if (this.isNewDoctor) {
        this.doctorService.postDoctor(this.NewDoctor).subscribe(
          (data) => this.router.navigate(["doctor", data]),
          (error) => { this.error = error; this.editProgress = false; }
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
