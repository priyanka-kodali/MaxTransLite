import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientEmployeesService } from './client-employees.service';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-client-employees',
  templateUrl: 'client-employees.component.html',
  styleUrls: ['client-employees.component.scss'],
  providers: [ClientEmployeesService]
})
export class ClientEmployeesComponent implements OnInit {


  mainClientEmployees: Array<ClientEmployee>;
  clientEmployees: Array<ClientEmployee>;
  sorting: string;
  key: string;
  keys: Array<string>
  selectedKey: string;
  searchTerm: string;
  page: number;
  count: number;
  pages: number;
  numbers: Array<number>;
  CliId: number;
  private sub: any;
  error: string;

  constructor(private router: Router, private masterService: MasterService, private clientEmployeesService: ClientEmployeesService, private activatedRoute: ActivatedRoute) {
    this.sorting = "none";
    this.keys = ["Client", "Name", "Phone", "Email", "Department"];
    this.page = 1;
    this.count = 10;
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.CliId = +params['CliId']
    );
  }

  ngOnInit() {
    this.getclientEmployees();
  }

  getclientEmployees() {
    this.masterService.changeLoading(true);
    this.clientEmployeesService.getClientEmployees(this.page, this.count, this.CliId).then(
      (data) => {
        this.mainClientEmployees = data['clientEmployees']; this.clientEmployees = this.mainClientEmployees;
        this.pages = data['pages']; this.numbers = new Array<number>(this.pages);
        for (var i = 0; i < this.pages; i++) {
          this.numbers[i] = i + 1;
        }
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching client employees";
        this.masterService.postAlert("error", this.error);
        this.masterService.changeLoading(false);
      }
    )
  }

  changePage(page: number) {
    if (page <= this.pages && page > 0) {
      this.page = page;
      this.getclientEmployees();
    }
  }

  changeCount(count: number) {
    this.count = count;
    this.getclientEmployees();
  }

  getClientEmployee(cliEmpId: number) {
    this.router.navigate(["client-employee", cliEmpId]);
  }

  sort(event) {
    this.masterService.changeLoading(true);
    var sorting = this.sorting;
    var key = event.target.firstChild.data.replace(" ", "");
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.clientEmployees.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.clientEmployees.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((y < x) ? -1 : ((y > x) ? 1 : 0));
      });
    }
    
    this.masterService.changeLoading(false);
  }

  resetClientEmployees() {
    this.clientEmployees = this.mainClientEmployees;
    this.searchTerm = "";
  }

  search() {
    this.selectedKey = this.selectedKey.replace(" ", "");
    try {
      this.clientEmployees = this.mainClientEmployees.filter((item: any) =>
        item[this.selectedKey] == null ? null : item[this.selectedKey].toString().toLowerCase().match(this.searchTerm.toLowerCase())
      );
    }
    catch (error) { throw error; }
  }

  newClientEmployee() {
    this.router.navigate(["new-client-employee"]);
  }

}


class ClientEmployee {
  Id: number;
  FullName: string;
  PrimaryPhone: string;
  Client: string;
  Email: string;
  Department: string;
}
