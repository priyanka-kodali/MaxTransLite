import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeesService } from './employees.service';


@Component({
  moduleId: module.id,
  selector: 'app-employees',
  templateUrl: 'employees.component.html',
  styleUrls: ['employees.component.scss'],
  providers: [EmployeesService]
})
export class EmployeesComponent implements OnInit {

  mainEmployees: Array<Employee>;
  employees: Array<Employee>;
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

  constructor(private router: Router, private employeesService: EmployeesService) {
    this.sorting = "none";
    this.keys = ["Employee Number", "Name", "Department", "Designation", "Phone", "Email", "Manager"];
    this.page = 1;
    this.count = 10;
    this.error = "";
  }

  ngOnInit() {
    this.getEmployees();
  }

  getEmployees() {
    try {
      this.employeesService.getEmployees(this.page, this.count).subscribe(
        (data) => {
        this.mainEmployees = data['employees']; this.employees = this.mainEmployees;
          this.pages = data['pages']; this.numbers = new Array<number>(this.pages);
          for (var i = 0; i < this.pages; i++) {
            this.numbers[i] = i + 1;
          }
          this.error="";
        },
        (error) => { this.error = "Error fetching employees" }
      )
    }
    catch (e) {
      this.error = "Error processing employee";
    }

  }

  changeCount(count: number) {
    this.count = count;
    this.getEmployees();
  }

  changePage(page: number) {
    if (page <= this.pages && page > 0) {
      this.page = page;
      this.getEmployees();
    }
  }


  getEmployee(emp: Employee) {
    this.router.navigate(["edit-employee", "general", emp.Id]);
  }

  sort(event) {
    var sorting = this.sorting;
    var key = event.target.firstChild.data.replace(" ", "");
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.employees.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.employees.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((y < x) ? -1 : ((y > x) ? 1 : 0));
      });
    }
  }

  resetEmployees() {
    this.employees = this.mainEmployees;
    this.searchTerm = "";
  }

  search() {
    this.selectedKey = this.selectedKey.replace(" ", "");
    try {
      this.employees = this.mainEmployees.filter((item: any) =>
        item[this.selectedKey] == null ? null : item[this.selectedKey].toString().toLowerCase().match(this.searchTerm.toLowerCase())
      );
    }
    catch (error) {
    }
  }

  newEmployee() {
    this.router.navigate(["new-employee", "general"]);
  }

}



class Employee {
  Id: number
  FirstName: string;
  LastName : string;
  EmployeeNumber: string;
  PrimaryPhone: string;
  Email: string;
  Designation: string;
  Department: string;
  Manager: string;
}