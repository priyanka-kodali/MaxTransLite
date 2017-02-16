import { Component, OnInit } from '@angular/core';
import { ClientLicenseService } from './client-license.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  editSuccess: boolean;
  license : License =new License();
  locations : Array<string>=new Array<string>();


  constructor(private clientLicenseService: ClientLicenseService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.ClientId = 0;
    this.error = "";
    this.editSuccess = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.ClientId = +params['ClientId']
    );
    this.license.ClientId=this.ClientId;
  }

  ngOnInit() {
        this.clientLicenseService.getClientLocations(this.ClientId).subscribe(
          (data)=>this.locations=data['locations']
        );
  }

  saveChanges() {
    this.error = "";
    if (this.license.LicenseKey.trim().length > 0 && this.license.Location.trim().length > 0) {
      this.clientLicenseService.addLicenseKey(this.license).subscribe(
        (data) =>  this.router.navigate(['client-licenses',this.ClientId]),
        (error) => { this.error = error['_body']; }
      )
    }
  }


  routeToLicensesList() {
    this.router.navigate(['client-licenses',this.ClientId]);
  }

}

class License{
ClientId : number;
LicenseKey:string;
Location : string;
}
