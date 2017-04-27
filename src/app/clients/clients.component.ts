import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientsService } from './clients.service';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-clients',
  templateUrl: 'clients.component.html',
  styleUrls: ['clients.component.scss'],
  providers: [ClientsService]
})
export class ClientsComponent implements OnInit {

  mainClients: Array<Client>;
  clients: Array<Client>;
  sorting: string;
  key: string;
  keys: Array<string>
  selectedKey: string;
  searchTerm: string;
  page: number;
  count: number;
  pages: number;
  numbers: Array<number>;
  error: string;

  constructor(private router: Router, private clientsService: ClientsService, private masterService: MasterService) {
    this.masterService.postAlert("remove", "");
    this.sorting = "none";
    this.keys = ["Name", "Phone", "Fax", "Email", "Type", "Time Zone", "Vendor"];
    this.page = 1;
    this.count = 10;
    this.error = "";
  }

  ngOnInit() {
    this.getClients();
  }

  getClients() {
    this.masterService.changeLoading(true);
    this.clientsService.getClients(this.page, this.count).then(
      (data) => {
        this.mainClients = data['clients']; this.clients = this.mainClients;
        this.pages = data['pages']; this.numbers = new Array<number>(this.pages);
        for (var i = 0; i < this.pages; i++) {
          this.numbers[i] = i + 1;
        }
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching clients";
        this.masterService.postAlert("error", this.error);
        this.masterService.changeLoading(false);
      }
    )
  }

  changePage(page: number) {
    if (page <= this.pages && page > 0) {
      this.page = page;
      this.getClients();
    }
  }

  changeCount(count: number) {
    this.count = count;
    this.getClients();
  }

  getClient(cliId: number) {
    this.router.navigate(["client", cliId]);
  }

  getClientEmployees(cliId: number) {
    this.router.navigate(["client-employees", cliId]);
  }

  getClientDoctors(cliId: number) {
    this.router.navigate(["doctors", cliId]);
  }

  getClientLicenses(cliId: number) {
    this.router.navigate(["client-licenses", cliId]);
  }

  sort(event) {
    this.masterService.changeLoading(true);
    var sorting = this.sorting;
    if (event.target.firstChild != null) {
      var key = event.target.firstChild.data.replace(" ", "");
      if (sorting == "none" || sorting == "des") {
        this.sorting = "asc";
        this.clients.sort(function (a, b) {
          var x = a[key]; var y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }

      if (sorting == "asc") {
        this.sorting = "des";
        this.clients.sort(function (a, b) {
          var x = a[key]; var y = b[key];
          return ((y < x) ? -1 : ((y > x) ? 1 : 0));
        });
      }
    }
    this.masterService.changeLoading(false);
  }

  resetClients() {
    this.clients = this.mainClients;
    this.searchTerm = "";
  }

  search() {
    this.selectedKey = this.selectedKey.replace(" ", "");
    try {
      this.clients = this.mainClients.filter((item: any) =>
        item[this.selectedKey] == null ? null : item[this.selectedKey].toString().toLowerCase().match(this.searchTerm.toLowerCase())
      );
    }
    catch (error) { throw error; }
  }

  newClient() {
    this.router.navigate(["new-client"]);
  }

}


class Client {
  Id: number;
  Name: string;
  PrimaryPhone: string;
  Fax: string;
  Email: string;
  ClientType: string;
  TimeZone: string;
  Vendor: string;
}
