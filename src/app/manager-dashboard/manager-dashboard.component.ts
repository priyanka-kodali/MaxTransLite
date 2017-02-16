import { Component, OnInit } from '@angular/core';
import { ManagerDashboardService } from './manager-dashboard.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss'],
  providers: [ManagerDashboardService]
})
export class ManagerDashboardComponent implements OnInit {

  Jobs: Array<Job> = new Array<Job>();
  DailyStatistics : DailyStats =new DailyStats();
  Error: string;
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  SearchItem: Search = new Search();

  constructor(private managerDashboardService: ManagerDashboardService) {
    this.Error = "";
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
  }

  ngOnInit() {
    this.managerDashboardService.getJobs().subscribe(
      (data) => { { this.Jobs = data; } },
      (error) => this.Error = "Error fetching jobs"
    )


    this.managerDashboardService.getStats().subscribe(
      (data) => this.DailyStatistics = data,
      (error) => {}
    )
  }


  search() {
    this.SearchItem.FromDate = this.SearchItem.FromDate == null ? "" : this.SearchItem.FromDate.trim();
    this.SearchItem.ToDate = this.SearchItem.ToDate == null ? "" : this.SearchItem.ToDate.trim();
    this.SearchItem.Doctor = this.SearchItem.Doctor == null ? "" : this.SearchItem.Doctor.trim();
    this.SearchItem.Client = this.SearchItem.Client == null ? "" : this.SearchItem.Client.trim();
    this.SearchItem.MT = this.SearchItem.MT == null ? "" : this.SearchItem.MT.trim();
    this.SearchItem.AQA = this.SearchItem.AQA == null ? "" : this.SearchItem.AQA.trim();
    this.SearchItem.QA = this.SearchItem.QA == null ? "" : this.SearchItem.QA.trim();
    this.SearchItem.Status = this.SearchItem.Status == null ? "" : this.SearchItem.Status.trim();


    this.managerDashboardService.searchJobs(this.SearchItem).subscribe(
      (data) => { this.Jobs = data; this.Error = ""; },
      (error) => this.Error = "Error fetching jobs"
    );


  }

}

export class Job {
  JobId: number;
  JobNumber: string;
  JobDate: string;
  Client: string;
  Doctor: string;
  MTId: number;
  MT: string;
  AQAId: number;
  AQA: string;
  QAId: number;
  QA: string;
  TAT: string;
  Status: string;
  JobLevel: string;
  Duration: string;
  ClientShortName: string;
  TotalMinutes: number;
  PatientList: string;
  Color: number;
  DefaultTAT: number;
}


class Search {
  Doctor: string;
  Client: string;
  Status: string;
  MT: string;
  AQA: string;
  QA: string;
  FromDate: string;
  ToDate: string;
}

class DailyStats {
  JobsAtMt: string;
  MtJobs: number;
  JobsAtAqa: string;
  AqaJobs: number;
  JobsAtQa: string;
  QaJobs: number;
  NotYetStarted: string;
  NYS: number;
  Completed: string;
  CompletedJobs: number;
}