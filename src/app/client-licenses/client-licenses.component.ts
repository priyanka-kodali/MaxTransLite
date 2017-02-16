import { Component, OnInit } from '@angular/core';
import { ClientLicensesService } from './client-licenses.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client-licenses',
  templateUrl: './client-licenses.component.html',
  styleUrls: ['./client-licenses.component.scss'],
  providers: [ClientLicensesService]
})
export class ClientLicensesComponent implements OnInit {

  ClientId: number;
  error: string;
  editSuccess: boolean;
  private sub: any;
  licenses: Array<License> = new Array<License>();

  constructor(private clientLicensesService: ClientLicensesService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.ClientId = 0;
    this.error = "";
    this.editSuccess = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
  }
  ngOnInit() {
    this.clientLicensesService.getLicenseKeys(this.ClientId).subscribe(
      (data) => this.licenses = data['licenses'],
      (error) => { this.error = error['_body']; }
    )
  }
 
  newLicense() {
    this.router.navigate(["client-license", this.ClientId]);
  }

  resetLicense(LicenseId: number) {
    this.editSuccess=false;
    this.error="";
    this.clientLicensesService.resetLicense(LicenseId).subscribe(
      (data) => {
        this.licenses = this.licenses.filter((item) => item.Id != LicenseId).reverse();
        this.licenses = this.licenses.concat(data);
        this.licenses = this.licenses.reverse();
        this.editSuccess=true;
      },
      (error) => { this.error = error['_body']; }
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