import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DefaultAllocationsService } from './default-allocations.service';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-default-allocations',
  templateUrl: 'default-allocations.component.html',
  styleUrls: ['default-allocations.component.scss'],
  providers: [DefaultAllocationsService]
})
export class DefaultAllocationsComponent implements OnInit {

  keys: Array<string>;
  sorting: string;
  allocations: Array<DefaultAllocation> = new Array<DefaultAllocation>();
  SearchTerm: string;
  selectedKey: string;
  page: number;
  count: number;
  pages: number;
  error: string;

  constructor(private router: Router, private defaultAllocationsService: DefaultAllocationsService, private masterService: MasterService) {
    this.keys = ["Client", "Doctor", "Job Level", "Employee", "Accuracy", "Minutes"];
    this.sorting = "none";
    this.page = 1;
    this.count = 10;
    this.error = "";
  }

  ngOnInit() {
    this.getAllocations();
  }

  getAllocations() {
    this.masterService.changeLoading(true);
    this.defaultAllocationsService.getAllocations(this.page, this.count).then(
      (data) => {
        this.allocations = data['defaultAllocations'];
        this.pages = data['pages'];
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching default allocations";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  search() {
    if (this.SearchTerm.trim().length < 1 && this.pages == 0) this.getAllocations();
    if (this.SearchTerm.trim().length < 1) return;
    this.masterService.changeLoading(true);
    this.defaultAllocationsService.searchAllocations(this.SearchTerm).then(
      (data) => {
        this.allocations = data, this.pages = 0;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching default allocations";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  sort(event) {
    this.masterService.changeLoading(true);
    var sorting = this.sorting;
    var key = event.target.firstChild.data.replace(" ", "");
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.allocations.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.allocations.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((y < x) ? -1 : ((y > x) ? 1 : 0));
      });
    }
    this.masterService.changeLoading(false);
  }

  newDefaultAllocation() {
    this.router.navigate(['new-default-allocation']);
  }

  editAllocation(DAId: number) {
    this.router.navigate(["default-allocation", DAId]);
  }

  changePage(page: number) {
    if (page <= this.pages && page > 0) {
      this.page = page;
      this.getAllocations();
    }
  }

  changeCount(count: number) {
    this.count = count;
    this.getAllocations();
  }

}

class DefaultAllocation {
  Id: number;
  Client: string;
  Doctor: string;
  Employee: string;
  JobLevel: string;
  Accuracy: number;
  Minutes: string;
}