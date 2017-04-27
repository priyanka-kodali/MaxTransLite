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
  providers: [ClientService]
})
export class ClientComponent implements OnInit, AfterViewInit {

  NewClient: Client;
  error: string;
  isVendor: boolean;
  isIndirectClient: boolean;
  private sub: any;
  ClientId: number;
  inputDisabled: boolean;
  countries: Array<string> = new Array<string>();
  masterCities: Array<string> = new Array<string>();
  masterStates: Array<string> = new Array<string>();
  vendors: Array<string> = new Array<string>();
  verticals: Array<string> = new Array<string>();
  countryIds: Array<number> = new Array<number>();
  masterCityIds: Array<number> = new Array<number>();
  masterStateIds: Array<number> = new Array<number>();
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
    this.masterService.postAlert("remove", "");
    this.NewClient = new Client();
    this.error = "";
    this.isVendor = false;
    this.isIndirectClient = false;
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

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.name.nativeElement, 'focus');
  }

  ngOnInit() {

    //get states and cities for master arrays    (No need of loading image)
    this.masterService.getAllCities().then(
      (data) => {
        data["cities"].forEach(city => {
          this.masterCities.push(city.Name);
          this.masterCityIds.push(city.Id);
        });
      });

    this.masterService.getAllStates().then(
      (data) => {
        data["states"].forEach(state => {
          this.masterStates.push(state.Name);
          this.masterStateIds.push(state.Id);
        });
      })


    this.masterService.changeLoading(true);
    if (this.isNewClient) {
      this.inputDisabled = false;
      this.NewClient.Active = true;
      this.NewClient.FileTypes = "DSS|DS2|WAV|WMA";
      this.getMasterData();
    }

    else {
      this.inputDisabled = true;
      document.body.scrollTop = 0;
      try {
        this.NewClient.Id = this.ClientId;
        this.clientService.getClient(this.ClientId)
          .then(
          (data) => {
            this.NewClient = data['client'];
            this.locations = data['locations'];
            this.isVendor = this.NewClient.ClientType == "Vendor" ? true : false;
            this.isIndirectClient = this.NewClient.ClientType == "Indirect Client" ? true : false;
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.masterService.changeLoading(false);
            this.error = "Error fetching Client Details";
            this.masterService.postAlert("error", this.error);
          }
          );
      }
      catch (e) {
        this.masterService.changeLoading(false);
        this.error = "Error processing Client Details";
        this.masterService.postAlert("error", this.error);
      }
    }
  }

  clientTypeChange() {
    this.isVendor = this.NewClient.ClientType == "Vendor" ? true : false;
    this.isIndirectClient = this.NewClient.ClientType == "Indirect Client" ? true : false;
  }

  clientVerticalChange() {
    this.IsTranscriptionClient = this.NewClient.ClientVertical.toLowerCase() == "transcription" ? true : false;
  }

  addClientLocation() {
    this.locations.push(new Location());
  }

  InvoiceAddressSelected(i: number) {
    // this.locations.forEach(element => {      
    //   element.IsInvoiceAddress = false;
    // });
    for (var k = 0; k < this.locations.length; k++) {
      if (k != i)
        this.locations[k].IsInvoiceAddress = false;
    }
    // this.locations[i].IsInvoiceAddress = !this.locations[i].IsInvoiceAddress;
  }

  getMasterData() {
    var sub = this.clientService.getData().then(
      (data) => {

        data['countries'].forEach(country => {
          this.countries.push(country.Name);
          this.countryIds.push(country.Id);
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
        for (var i = 0; i < this.locations.length; i++) {
          this.getStates(i);
          this.getCities(i);
        }
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Master Data";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }

  editData() {
    this.inputDisabled = !this.inputDisabled;
    if (!this.isDataAvailable) {
      this.masterService.changeLoading(true);
      this.getMasterData();
    }
  }

  routeToClientList() {
    this.router.navigate(['clients']);
  }

  countrySelected(index: number) {
    if (this.locations[index].Country) {
      this.locations[index].City = "";
      this.locations[index].State = "";
      this.getStates(index);
    }
  }

  stateSelected(index: number) {
    if (this.locations[index].State) {
      this.locations[index].City = "";
      this.getCities(index);
    }
  }

  getStates(index: number) {
    this.masterService.changeLoading(true);
    var location = this.locations[index]
    location.states = new Array<string>();
    if (!location.Country) {
      this.masterService.changeLoading(false);
      return;
    }
    var countryId = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == location.Country.toLowerCase())];
    if (location.Country && !countryId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getStates(countryId).then(
      (data) => {
        data['states'].forEach(state => {
          location.states.push(state.Name);
        });
        this.masterService.changeLoading(false);
      }
    )
  }

  getCities(index: number) {
    this.masterService.changeLoading(true);
    var location = this.locations[index]
    location.cities = new Array<string>();
    if (!location.State) {
      this.masterService.changeLoading(false);
      return;
    }
    var stateId = this.masterStateIds[this.masterStates.findIndex((item) => item.toLowerCase() == location.State.toLowerCase())];
    if (location.State && !stateId) {
      this.masterService.changeLoading(false);
      return;
    }
    this.masterService.getCities(stateId).then(
      (data) => {
        data['cities'].forEach(city => {
          location.cities.push(city.Name);
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


    this.NewClient.Name = this.NewClient.Name.trim()
    this.NewClient.ShortName = this.NewClient.ShortName.trim();
    this.NewClient.PrimaryPhone = this.NewClient.PrimaryPhone.trim();
    this.NewClient.SecondaryPhone = this.NewClient.SecondaryPhone ? this.NewClient.SecondaryPhone.trim() : this.NewClient.SecondaryPhone;
    this.NewClient.Fax = this.NewClient.Fax ? this.NewClient.Fax.trim() : this.NewClient.Fax;
    this.NewClient.Email = this.NewClient.Email.trim();
    this.NewClient.FileTypes = this.NewClient.FileTypes ? this.NewClient.FileTypes.trim() : this.NewClient.FileTypes;

    for (var i = 0; i < this.locations.length; i++) {

      var element = this.locations[i];
      element.AddressLine1 = element.AddressLine1.trim();
      element.AddressLine2 = element.AddressLine2 ? element.AddressLine2.trim() : element.AddressLine2;
      element.Landmark = element.Landmark ? element.Landmark.trim() : element.Landmark;
      element.ZIP = element.ZIP.trim();

    }

    this.NewClient.Locations = this.locations;

    try {
      if (this.isNewClient) {
        this.clientService.postClient(this.NewClient).then(
          (data) => {
            document.body.scrollTop = 0;
            this.NewClient = data['client'];
            this.locations = data['locations'];
            this.inputDisabled = true;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("success", "Client added successfully");
            this.isNewClient = false;
          },
          (error) => {
            this.error = error['_body'];
            this.masterService.postAlert("error", this.error);
            this.masterService.changeLoading(false);
          }
        );
      }

      else {
        this.clientService.editClient(this.NewClient)
          .then((data) => {
            document.body.scrollTop = 0;
            this.NewClient = data['client'];
            this.locations = data['locations'];
            this.inputDisabled = true;
            this.masterService.changeLoading(false);
            this.masterService.postAlert("success", "Client details updated successfully");
          },
          (error) => {
            this.error = error['_body'];
            this.masterService.postAlert("error", this.error);
            this.masterService.changeLoading(false);
          }
          );
      }
    }
    catch (e) { throw e; }
  }

  validate() {

    this.masterService.postAlert("remove", "");

    if (this.isVendor) {
      this.NewClient.NumberOfCharactersPerLine = null;
      this.NewClient.FileTypes = null;
      this.NewClient.PaymentAmount = null;
      this.NewClient.Currency = null;
      this.NewClient.PaymentType = null;
    }
    else {
      this.NewClient.Vendor = null;
      this.NewClient.Vendor_Id = null;
    }

    var namesRegex = /^[a-zA-Z0-9 ]*$/;
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;


    this.NewClient.Vendor_Id = this.NewClient.Vendor ? this.vendorIds[this.vendors.findIndex((item) => item.toLowerCase() == this.NewClient.Vendor.toLowerCase())] : null;
    this.NewClient.ClientVertical_Id = this.verticalIds[this.verticals.findIndex((item) => item.toLowerCase() == this.NewClient.ClientVertical.toLowerCase())];

    if (!namesRegex.test(this.NewClient.Name)) {
      this.error = "Name should not contain special characters"
      this.renderer.invokeElementMethod(this.name.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.Name.trim().length == 0) {
      this.error = "Name should not be empty"
      this.renderer.invokeElementMethod(this.name.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.Name.trim().length > 255) {
      this.error = "Name should not exceed 255 characters"
      this.renderer.invokeElementMethod(this.name.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.ShortName.trim().length == 0) {
      this.error = "Short Name should not be empty"
      this.renderer.invokeElementMethod(this.shortName.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.ShortName.trim().length > 20) {
      this.error = "Short Name should not exceed 20 characters"
      this.renderer.invokeElementMethod(this.shortName.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.PrimaryPhone.trim().length == 0) {
      this.error = "Primary Phone should not be empty"
      this.renderer.invokeElementMethod(this.primaryPhone.nativeElement, 'focus');
      return false;
    }
    if (!phoneRegex.test(this.NewClient.PrimaryPhone)) {
      this.error = "Please enter a valid Primary Phone Number "
      this.renderer.invokeElementMethod(this.primaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.SecondaryPhone && this.NewClient.SecondaryPhone.trim().length == 0) {
      this.error = "Secondary Phone should not be empty"
      this.renderer.invokeElementMethod(this.secondaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.SecondaryPhone && !phoneRegex.test(this.NewClient.SecondaryPhone)) {
      this.error = "Please enter a valid Secondary Phone Number "
      this.renderer.invokeElementMethod(this.secondaryPhone.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.Fax && this.NewClient.Fax.trim().length == 0) {
      this.error = "Fax  should not be empty"
      this.renderer.invokeElementMethod(this.fax.nativeElement, 'focus');
      return false;
    }
    if (this.NewClient.Fax && !phoneRegex.test(this.NewClient.Fax)) {
      this.error = "Please enter a valid Fax Number "
      this.renderer.invokeElementMethod(this.fax.nativeElement, 'focus');
      return false;
    }

    if (this.NewClient.Email.trim().length == 0) {
      this.error = "Email should not be empty"
      this.renderer.invokeElementMethod(this.email.nativeElement, 'focus');
      return false;
    }
    if (!emailRegex.test(this.NewClient.Email)) {
      this.error = "Please enter a valid email";
      this.renderer.invokeElementMethod(this.email.nativeElement, 'focus');
      return false;
    }

    if (!this.NewClient.ClientVertical_Id) {
      this.error = "Please select valid Client Vertical";
      this.renderer.invokeElementMethod(this.clientVertical.nativeElement, 'focus');
      return false;
    }
    if (this.clientTypes.findIndex((item) => item.toLowerCase() == this.NewClient.ClientType.toLowerCase()) == -1) {
      this.error = "Please select a valid Client Type"
      this.renderer.invokeElementMethod(this.clientType.nativeElement, 'focus');
      return false;
    }

    if (!this.NewClient.Vendor_Id && this.NewClient.Vendor) {
      this.error = "Please select valid vendor";
      this.renderer.invokeElementMethod(this.vendor.nativeElement, 'focus');
      return false;
    }

    for (var i = 0; i < this.locations.length; i++) {

      var element = this.locations[i];

      element.City_Id = this.masterCityIds[this.masterCities.findIndex((item) => item.toLowerCase() == element.City.toLowerCase())];
      element.State_Id = this.masterStateIds[this.masterStates.findIndex((item) => item.toLowerCase() == element.State.toLowerCase())];
      element.Country_Id = this.countryIds[this.countries.findIndex((item) => item.toLowerCase() == element.Country.toLowerCase())];
      element.TimeZone_Id = this.timezoneIds[this.timezones.findIndex((item) => item.toLowerCase() == element.TimeZone.toLowerCase())];


      if (element.AddressLine1.trim().length == 0) {
        this.error = "Address line 1 should not be empty for location " + (this.locations.indexOf(element) + 1);
        return false;
      }
      if (element.AddressLine1.trim().length > 255) {
        this.error = "Address line 1 should not exceed 255 characters for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (element.AddressLine2 && element.AddressLine2.trim().length == 0) {
        this.error = "Address line 2 should not be empty for location " + (this.locations.indexOf(element) + 1);
        return false;
      }
      if (element.AddressLine2 && element.AddressLine2.trim().length > 255) {
        this.error = "Address line 2 should not exceed 255 characters for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (element.Landmark && element.Landmark.trim().length == 0) {
        this.error = "Landmark should not be empty for location " + (this.locations.indexOf(element) + 1);
        return false;
      }
      if (element.Landmark && element.Landmark.trim().length > 255) {
        this.error = "Landmark should not exceed 255 characters for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (!element.Country_Id) {
        this.error = "Please select valid country for location " + (this.locations.indexOf(element) + 1);
        return false;
      }
      if (!element.State_Id) {
        this.error = "Please select valid state for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (!element.City_Id) {
        this.error = "Please select valid city for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (element.ZIP.trim().length > 10) {
        this.error = "ZIP should not exceed 10 characters for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (element.ZIP.trim().length == 0) {
        this.error = "ZIP should not be empty for location " + (this.locations.indexOf(element) + 1);
        return false;
      }

      if (!element.TimeZone_Id) {
        this.error = "Please select valid timezone for location " + (this.locations.indexOf(element) + 1);
        return false;
      }
    }

    if (this.locations.filter((item) => item.IsInvoiceAddress == true).length != 1) {
      this.error = "Please choose an invoice address";
      return false;
    }

    if (this.NewClient.PaymentType && this.paymentTypes.findIndex((item) => item.toLowerCase() == this.NewClient.PaymentType.toLowerCase()) == -1) {
      this.error = "Please select a valid Payment Type"
      this.renderer.invokeElementMethod(this.paymentType.nativeElement, 'focus');
      return false;
    }

    if (this.NewClient.Currency && this.currencies.findIndex((item) => item.toLowerCase() == this.NewClient.Currency.toLowerCase()) == -1) {
      this.error = "Please select a valid currency"
      this.renderer.invokeElementMethod(this.currency.nativeElement, 'focus');
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
  cities: Array<string> = new Array<string>();
  states: Array<string> = new Array<string>();
  cityIds: Array<number> = new Array<number>();
  stateIds: Array<number> = new Array<number>();
}
