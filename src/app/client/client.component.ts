import { Component, OnInit, Input, AfterViewInit, ElementRef, Renderer, ViewChild } from '@angular/core';
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
export class ClientComponent implements OnInit, AfterViewInit {

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
  vendorIds: Array<number> = new Array<number>();
  verticalIds: Array<number> = new Array<number>();
  timezones: Array<string> = new Array<string>();
  timezoneIds: Array<number> = new Array<number>();
  isNewClient: boolean;
  isDataAvailable: boolean;
  IsTranscriptionClient: boolean;
  locations: Array<Location> = new Array<Location>();
  clientTypes: Array<string> = new Array<string>();
  paymentTypes: Array<string> = new Array<string>();
  currencies: Array<string> = new Array<string>();


  @ViewChild("name") name: ElementRef;
  @ViewChild("shortName") shortName: ElementRef;
  @ViewChild("primaryPhone") primaryPhone: ElementRef;
  @ViewChild("secondaryPhone") secondaryPhone: ElementRef;
  @ViewChild("fax") fax: ElementRef;
  @ViewChild("email") email: ElementRef;
  @ViewChild("clientVertical") clientVertical: ElementRef;
  @ViewChild("clientType") clientType: ElementRef;
  @ViewChild("vendor") vendor: ElementRef;
  @ViewChild("NumberOfCharactersPerLine") NumberOfCharactersPerLine: ElementRef;
  @ViewChild("fileTypes") fileTypes: ElementRef;
  @ViewChild("paymentType") paymentType: ElementRef;
  @ViewChild("currency") currency: ElementRef;


  constructor(private renderer: Renderer, private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute, private clientService: ClientService) {
    this.NewClient = new Client();
    this.error = "";
    this.isIndirectClient = false;
    this.editSuccess = false;
    this.editProgress = false;
    this.clientTypes = ['Direct Client', 'Indirect Client', 'Vendor'];
    this.paymentTypes = ['Fixed', 'FTE', 'Per Unit'];
    this.currencies = ['INR', 'USD'];
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
    this.isNewClient = isNaN(this.ClientId) || this.ClientId == 0;
    this.isDataAvailable = false;
    this.locations.push(new Location());
    this.locations[0].IsInvoiceAddress = true;
  }

  ngAfterViewInit() { }

  ngOnInit() {
    //get states and cities for master arrays 
    this.masterService.getAllCities().subscribe(
      (data) => {
        data["cities"].forEach(city => {
          this.masterCities.push(city.Name);
          this.masterCityIds.push(city.Id);
        });
      });

    this.masterService.getAllStates().subscribe(
      (data) => {
        data["states"].forEach(state => {
          this.masterStates.push(state.Name);
          this.masterStateIds.push(state.Id);
        });
      });


    if (this.isNewClient) {
      this.inputDisabled = false;
      this.getMasterData();
      this.NewClient.Active = true;
      this.NewClient.FileTypes = "DSS|DS2|WAV|WMA";
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

        //states andd cities for master arrays are obtained seperatly

        data['vendors'].forEach(client => {
          this.vendors.push(client.Name);
          this.vendorIds.push(client.Id);
        });
        data['verticals'].forEach(vertical => {
          this.verticals.push(vertical.Name);
          this.verticalIds.push(vertical.Id);
        });
        data['timezones'].forEach(timezone => {
          this.timezones.push(timezone.Name);
          this.timezoneIds.push(timezone.Id);
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

    if (!this.validate()) return;

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;

    this.NewClient.Locations = this.locations;

    try {
      if (this.isNewClient) {
        this.clientService.postClient(this.NewClient).subscribe(
         (data) => {
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

  validate() {

    if (this.isVendor) {
      this.NewClient.NumberOfCharactersPerLine=null;
      this.NewClient.FileTypes=null;
      this.NewClient.PaymentAmount = null;
      this.NewClient.Currency = null;
      this.NewClient.PaymentType = null;
    }
    else {
      this.NewClient.Vendor = null;
      this.NewClient.Vendor_Id = null;
    }

    this.error = "";
    this.editSuccess = false;
    this.editProgress = true;
    var namesRegex = /^[a-zA-Z ]*$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;


    this.NewClient.Vendor_Id = this.vendorIds[this.vendors.indexOf(this.NewClient.Vendor)];
    this.NewClient.ClientVertical_Id = this.verticalIds[this.verticals.indexOf(this.NewClient.ClientVertical)];

    if (!namesRegex.test(this.NewClient.Name)) {
      this.error = "Name should not contain special characters"
      this.renderer.invokeElementMethod(this.name, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewClient.Name.trim().length > 255) {
      this.error = "Name should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.name, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewClient.ShortName.trim().length > 20) {
      this.error = "Short Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.shortName, 'focus');
      this.editProgress = false;
      return false;
    }
    if (!phoneRegex.test(this.NewClient.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewClient.SecondaryPhone && !phoneRegex.test(this.NewClient.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.NewClient.Fax && !phoneRegex.test(this.NewClient.Fax)) {
      this.error = "Please enter a valid Fax Number "
      this.renderer.invokeElementMethod(this.fax, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!emailRegex.test(this.NewClient.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewClient.ClientVertical_Id) {
      this.error = "Please select valid Client Vertical";
      this.renderer.invokeElementMethod(this.clientVertical, 'focus');
      this.editProgress = false;
      return false;
    }
    if (this.clientTypes.indexOf(this.NewClient.ClientType) == -1) {
      this.error = "Please select a valid Client Type"
      this.renderer.invokeElementMethod(this.clientType, 'focus');
      this.editProgress = false;
      return false;
    }

    if (!this.NewClient.Vendor_Id && this.NewClient.Vendor) {
      this.error = "Please select valid vendor";
      this.renderer.invokeElementMethod(this.vendor, 'focus');
      this.editProgress = false;
      return false;
    }

    for (var i = 0; i < this.locations.length; i++) {

      var element = this.locations[i];
      element.City_Id = this.masterCityIds[this.masterCities.indexOf(element.City)];
      element.State_Id = this.masterStateIds[this.masterStates.indexOf(element.State)];
      element.Country_Id = this.masterCountryIds[this.masterCountries.indexOf(element.Country)];
      element.TimeZone_Id = this.timezoneIds[this.timezones.indexOf(element.TimeZone)];

      if (!element.Country_Id) {
        this.error = "Please select valid country for location " + (this.locations.indexOf(element) + 1);
        this.editProgress = false;
        return false;
      }
      if (!element.State_Id) {
        this.error = "Please select valid state for location " + (this.locations.indexOf(element) + 1);
        this.editProgress = false;
        return false;
      }

      if (!element.City_Id) {
        this.error = "Please select valid city for location " + (this.locations.indexOf(element) + 1);
        this.editProgress = false;
        return false;
      }


      if (element.ZIP.trim().length > 10) {
        this.error = "ZIP should not exceed 10 characters for location " + (this.locations.indexOf(element) + 1);
        this.editProgress = false;
        return false;
      }

      if (!element.TimeZone_Id) {
        this.error = "Please select valid timezone for location " + (this.locations.indexOf(element) + 1);
        this.editProgress = false;
        return false;
      }

    }
    
    if(this.locations.filter((item)=>item.IsInvoiceAddress==true).length!=1){
      this.error="Please choose an invoice address";
      return false;
    }


    if (this.NewClient.PaymentType && this.paymentTypes.indexOf(this.NewClient.PaymentType) == -1) {
      this.error = "Please select a valid Payment Type"
      this.renderer.invokeElementMethod(this.paymentType, 'focus');
      this.editProgress = false;
      return false;
    }

    if (this.NewClient.Currency && this.currencies.indexOf(this.NewClient.Currency) == -1) {
      this.error = "Please select a valid currency"
      this.renderer.invokeElementMethod(this.currency, 'focus');
      this.editProgress = false;
      return false;
    }


    return true;
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
  NumberOfCharactersPerLine: number;
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
  TimeZone_Id: number;

}
