import { Component, OnInit } from '@angular/core';
import { ClientLicensesService } from './client-licenses.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-client-licenses',
  templateUrl: './client-licenses.component.html',
  styleUrls: ['./client-licenses.component.scss'],
  providers: [ClientLicensesService]
})
export class ClientLicensesComponent implements OnInit {

  ClientId: number;
  error: string;
  private sub: any;
  licenses: Array<License> = new Array<License>();

  constructor(private clientLicensesService: ClientLicensesService, private masterService: MasterService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.ClientId = 0;
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
  }
  ngOnInit() {
    this.masterService.changeLoading(true);

    this.clientLicensesService.getLicenseKeys(this.ClientId).then(
      (data) => {
        this.licenses = data['licenses'];
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = error['_body'];
        this.masterService.postAlert("error", this.error);
        this.masterService.changeLoading(false);
      }
    )
  }

  newLicense() {
    this.router.navigate(["client-license", this.ClientId]);
  }

  resetLicense(LicenseId: number) {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    this.clientLicensesService.resetLicense(LicenseId).then(
      (data) => {
        this.licenses = this.licenses.filter((item) => item.Id != LicenseId).reverse();
        this.licenses = this.licenses.concat(data);
        this.licenses = this.licenses.reverse();
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "License Key updated successfully");
      },
      (error) => {
        this.error = error['_body'];
        this.masterService.postAlert("error", this.error);
        this.masterService.changeLoading(false);
      }
    )
  }


}


class License {
  Id: number;
  LicenseKey: string;
  Location: string;
  Active: boolean;
  Download: boolean;
  Upload: boolean;
}