import { Component, OnInit } from '@angular/core';
import { ClientLicenseService } from './client-license.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-client-license',
  templateUrl: './client-license.component.html',
  styleUrls: ['./client-license.component.scss'],
  providers: [ClientLicenseService]
})
export class ClientLicenseComponent implements OnInit {


  private sub: any;
  ClientId: number;
  error: string;
  license: License = new License();
  locations: Array<string> = new Array<string>();


  constructor(private clientLicenseService: ClientLicenseService, private masterService: MasterService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.ClientId = 0;
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
    this.license.ClientId = this.ClientId;
  }

  ngOnInit() {

    this.masterService.changeLoading(true);
    this.clientLicenseService.getClientLocations(this.ClientId).then(
      (data) => {
        this.locations = data['locations'];
        this.masterService.changeLoading(false);
      }
    );
  }

  saveChanges() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");

    if (this.locations.findIndex((item)=>item.toLowerCase()==this.license.Location.toLowerCase()) == -1) {
      this.error = "Please select a valid location";
      this.masterService.postAlert("error", this.error);
      this.masterService.changeLoading(false);
      return;
    }

    if (this.license.LicenseKey.trim().length > 0 && this.license.Location.trim().length > 0) {
      this.clientLicenseService.addLicenseKey(this.license).then(
        (data) => {
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "License added successfully");
          this.router.navigate(['client-licenses', this.ClientId]);
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }
  }


  routeToLicensesList() {
    this.router.navigate(['client-licenses', this.ClientId]);
  }

}

class License {
  ClientId: number;
  LicenseKey: string;
  Location: string;
}
