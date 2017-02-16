import { Component, OnInit } from '@angular/core';
import { DoctorDashboardService } from './doctor-dashboard.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
  providers:[DoctorDashboardService]
})
export class DoctorDashboardComponent implements OnInit {

  Jobs: Array<Job> = new Array<Job>();
  Error: string;
  SearchItem: Search = new Search();

  constructor(private doctorDashboardService: DoctorDashboardService) {
    this.Error = "";
  }

  ngOnInit() {
    this.doctorDashboardService.getJobs().subscribe(
      (data) => { { this.Jobs = data; } },
      (error) => this.Error = "Error fetching jobs"
    )
  }

  search() {

     this.Error = "";

    this.SearchItem.FromDate = this.SearchItem.FromDate == null ? "" : this.SearchItem.FromDate.trim();
    this.SearchItem.ToDate = this.SearchItem.ToDate == null ? "" : this.SearchItem.ToDate.trim();
    this.SearchItem.Status = this.SearchItem.Status == null ? "" : this.SearchItem.Status.trim();
    this.SearchItem.JobNumber = this.SearchItem.JobNumber == null ? "" : this.SearchItem.JobNumber.trim();


    this.doctorDashboardService.searchJobs(this.SearchItem).subscribe(
      (data) => { this.Jobs = data; this.Error = ""; },
      (error) => this.Error = "Error fetching jobs"
    );


  }
}

export class Job {
  JobId: number;
  JobNumber: string;
  JobDate: string;
  TAT: string;
  Status: string;
  Duration: string;
}

class Search {
  Status: string;
  FromDate: string;
  ToDate: string;
  JobNumber : string;
}