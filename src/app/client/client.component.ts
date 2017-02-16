import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/Rx';
import { ClientService } from './client.service';
import { MasterService } from '../app.service';


@Component({
  moduleId: module.id,
  selector: 'app-client',
  templateUrl: 'client.component.html',
  styleUrls: ['client.component.scss'],
  providers: [ClientService, MasterService]
})
export class ClientComponent implements OnInit {

  NewClient: Client;
  error: string;
  isVendor: boolean;
  isIndirectClient: boolean;
  private sub: any;
  ClientId: number;
  inputDisabled: boolean;
  editSuccess: boolean;
  editProgress: boolean;
  cities: Array<string> = new Array<string>();
  states: Array<string> = new Array<string>();
  countries: Array<string> = new Array<string>();
  masterCities: Array<string> = new Array<string>();
  masterStates: Array<string> = new Array<string>();
  masterCountries: Array<string> = new Array<string>();
  vendors: Array<string> = new Array<string>();
  verticals: Array<string> = new Array<string>();
  cityIds: Array<number> = new Array<number>();
  stateIds: Array<number> = new Array<number>();
  countryIds: Array<number> = new Array<number>();
  masterCityIds: Array<number> = new Array<number>();
  masterStateIds: Array<number> = new Array<number>();
  masterCountryIds: Array<number> = new Array<number>();
  vendorIds: Array<number> = new Array<any>();
  verticalIds: Array<number> = new Array<any>();
  isNewClient: boolean;
  isDataAvailable: boolean;
  IsTranscriptionClient: boolean;
  locations: Array<Location> = new Array<Location>();


  constructor(private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private clientService: ClientService) {
    this.NewClient = new Client();
    this.error = "";
    this.isVendor = false;
    this.isIndirectClient = false;
    this.editSuccess = false;
    this.editProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
    this.isNewClient = isNaN(this.ClientId) || this.ClientId == 0;
    this.isDataAvailable = false;
    this.locations.push(new Location());
    this.locations[0].IsInvoiceAddress = true;
  }

  ngOnInit() {

    if (this.isNewClient) {
      this.inputDisabled = false;
      this.getMasterData();
      this.NewClient.Active = true;
    }

    else {
      this.inputDisabled = true;
      document.body.scrollTop = 0;
      try {
        this.NewClient.Id = this.ClientId;
        this.clientService.getClient(this.ClientId)
          .subscribe(
          (data) => {
            this.NewClient = data['client'];
            this.locations = data['locations'];
            this.isVendor = this.NewClient.ClientType == "Vendor" ? true : false;
            this.isIndirectClient = this.NewClient.ClientType == "Indirect Client" ? true : false;
          },
          (error) => { this.error = "Error fetching Client Details" }
          );
      }
      catch (e) { this.error = "Error processing Client Details" }
    }
  }

  clientTypeChange() {
    this.isVendor = this.NewClient.ClientType == "Vendor" ? true : false;
    this.isIndirectClient = this.NewClient.ClientType == "Indirect Client" ? true : false;
  }

  clientVerticalChange() {
    this.IsTranscriptionClient = this.NewClient.ClientVertical == "Transcription" ? true : false;
  }

  addClientLocation() {
    this.locations.push(new Location());
  }

  InvoiceAddressSelected(i: number) {
    this.locations.forEach(element => {
      element.IsInvoiceAddress = false;
    });
    this.locations[i].IsInvoiceAddress = true;
  }

  getMasterData() {
    this.clientService.getData().subscribe(
      (data) => {

        data['countries'].forEach(country => {
          this.countries.push(country.Name);
          this.masterCountries.push(country.Name);
          this.countryIds.push(country.Id);
          this.masterCountryIds.push(country.Id);
        });
        data['states'].forEach(state => {
          this.masterStates.push(state.Name);
          this.masterStateIds.push(state.Id);
        });
        data['cities'].forEach(city => {
          this.masterCities.push(city.Name);
          this.masterCityIds.push(city.Id);
        });
        data['vendors'].forEach(client => {
          this.vendors.push(client.Name);
          this.vendorIds.push(client.Id);
        });
        data['verticals'].forEach(vertical => {
          this.verticals.push(vertical.Name);
          this.verticalIds.push(vertical.Id);
        });
        this.isDataAvailable = true;
        this.error = "";
      },
      (error) => { this.error = "Error fetching Master Data" }
    );
  }

  editData() {
    this.inputDisabled = !this.inputDisabled;
    if (!this.isDataAvailable)
      this.getMasterData();
  }

  routeToClientList() {
    this.router.navigate(['clients']);
  }


  countrySelected(index: number) {
    this.locations[index].City = "";
    this.locations[index].State = "";
  }

  stateSelected(index: number) {
    this.locations[index].City = "";
  }

  getStates(index: number) {
    this.states = new Array<string>();
    this.stateIds = new Array<number>();
    if (this.locations[index].Country.trim().length < 1) return;
    var countryId = this.countryIds[this.countries.indexOf(this.locations[index].Country)];
    this.masterService.getStates(countryId).subscribe(
      (data) => data['states'].forEach(state => {
        this.states.push(state.Name);
        this.stateIds.push(state.Id);
      })
    )
  }

  getCities(index: number) {
    this.cities = new Array<string>();
    this.cityIds = new Array<number>();
    if (this.locations[index].State.trim().length < 1) return;
    var stateId = this.stateIds[this.states.indexOf(this.locations[index].State)];
    this.masterService.getCities(stateId).subscribe(
      (data) => data['cities'].forEach(city => {
        this.cities.push(city.Name);
        this.cityIds.push(city.Id);
      })
    )
  }

  saveChanges() {
    this.editProgress = true;
    this.error = "";
    this.editSuccess = false;
    this.locations.forEach(element => {
      element.City_Id = this.masterCityIds[this.masterCities.indexOf(element.City)];
      element.State_Id = this.masterStateIds[this.masterStates.indexOf(element.State)];
      element.Country_Id = this.masterCountryIds[this.masterCountries.indexOf(element.Country)];
    });

    this.NewClient.Locations = this.locations;
    this.NewClient.Vendor_Id = this.vendorIds[this.vendors.indexOf(this.NewClient.Vendor)];
    this.NewClient.ClientVertical_Id = this.verticalIds[this.verticals.indexOf(this.NewClient.ClientVertical)];

    try {
      if (this.isNewClient) {
        this.clientService.postClient(this.NewClient).subscribe(
          (data) => this.router.navigate(["client", data]),
          (error) => {
            this.error = error['_body'];
            this.editProgress = false;
          }
        );
      }

      else {
        this.clientService.editClient(this.NewClient)
          .subscribe((data) => {
            document.body.scrollTop = 0;
            this.NewClient = data['client'];
            this.locations = data['locations'];
            this.error = "";
            this.editProgress = false;
            this.editSuccess = true;
            this.inputDisabled = true;
          },
          (error) => {
            this.editSuccess = false;
            this.error = error['_body'];
            this.editProgress = false;
          }
          );
      }
    }
    catch (e) { throw e; }
  }

}

class Client {
  Id: number;
  ClientType: string;
  ClientVertical: string;
  ClientVertical_Id: number;
  Name: string;
  ShortName: string;
  PrimaryPhone: string;
  SecondaryPhone: string;
  Fax: string;
  Email: string;
  TimeZone: string;
  NumberOfCharactersForLine: number;
  PaymentAmount: number;
  Currency: string;
  PaymentType: string;
  Vendor: string;
  Vendor_Id: number;
  FileTypes: string;
  Locations: Array<Location>;
  Active: boolean
}


class Location {
  AddressLine1: string;
  AddressLine2: string;
  ZIP: string;
  City: string;
  State: string;
  Country: string;
  Landmark: string;
  TimeZone: string;
  IsInvoiceAddress: boolean;
  City_Id: number;
  State_Id: number;
  Country_Id: number;

}
