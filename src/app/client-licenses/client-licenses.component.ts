import { Component, OnInit, Renderer } from '@angular/core';
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
  client: string;
  SelectedLicense = new License();
  SelectedLicenseIndex: number;
  LicenseModal: boolean;

  constructor(private clientLicensesService: ClientLicensesService, private masterService: MasterService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.masterService.postAlert("remove", "");
    this.SelectedLicenseIndex = -1;
    this.ClientId = 0;
    this.LicenseModal = false;
    this.error = "";
    this.client = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
  }

  ngOnInit() {
    this.masterService.changeLoading(true);

    this.clientLicensesService.getLicenseKeys(this.ClientId).then(
      (data) => {
        this.licenses = data['licenses'];
        this.client = data['ClientName'];
        this.masterService.changeLoading(false);
        if (this.licenses.length == 0) {
          this.masterService.postAlert("info", "There are no licenses for this client!");
        }
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

  editLicense(i: number) {
    if (this.SelectedLicenseIndex != -1) {
      this.licenses[this.SelectedLicenseIndex] = this.SelectedLicense;
    }
    this.SelectedLicenseIndex = i;
    this.SelectedLicense = Object.assign({}, this.licenses[i]);
    this.licenses[i].Disabled = false;
  }

  undoLicense() { //resets the selected license to previous value
    this.licenses[this.SelectedLicenseIndex] = this.SelectedLicense;
  }

  saveLicense() {
    if (!confirm("Do you wish to change permission for client appication?")) {
      return;
    }
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    this.clientLicensesService.resetLicense(this.licenses[this.SelectedLicenseIndex]).then(
      (data) => {
        this.licenses[this.SelectedLicenseIndex] = data;
        this.SelectedLicenseIndex = -1;
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "License Key updated successfully");
      },
      (error) => {
        this.licenses[this.SelectedLicenseIndex] = this.SelectedLicense;
        this.SelectedLicenseIndex = -1;
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
  Disabled: boolean;
}