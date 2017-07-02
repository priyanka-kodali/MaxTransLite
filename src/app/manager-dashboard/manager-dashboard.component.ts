import { Component, OnInit } from '@angular/core';
import { ManagerDashboardService } from './manager-dashboard.service';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss'],
  providers: [ManagerDashboardService]
})
export class ManagerDashboardComponent implements OnInit {

  Jobs: Array<Job> = new Array<Job>();
  DailyStatistics: DailyStats = new DailyStats();
  error: string;
  SearchItem: Search = new Search();

  constructor(private managerDashboardService: ManagerDashboardService, private masterService: MasterService) {
    this.masterService.postAlert("remove", "");
    this.error = "";
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    Promise.all([
      this.managerDashboardService.getJobs().then(
        (data) => this.Jobs = data,
        (error) => { }
      ),
      this.managerDashboardService.getStats().then(
        (data) => this.DailyStatistics = data,
        (error) => { }
      )
    ]).then(() => this.masterService.changeLoading(false));
  }


  search() {
    this.masterService.changeLoading(true);
    this.SearchItem.FromDate = this.SearchItem.FromDate == null ? "" : this.SearchItem.FromDate.trim();
    this.SearchItem.ToDate = this.SearchItem.ToDate == null ? "" : this.SearchItem.ToDate.trim();
    this.SearchItem.Doctor = this.SearchItem.Doctor == null ? "" : this.SearchItem.Doctor.trim();
    this.SearchItem.Client = this.SearchItem.Client == null ? "" : this.SearchItem.Client.trim();
    this.SearchItem.MT = this.SearchItem.MT == null ? "" : this.SearchItem.MT.trim();
    this.SearchItem.AQA = this.SearchItem.AQA == null ? "" : this.SearchItem.AQA.trim();
    this.SearchItem.QA = this.SearchItem.QA == null ? "" : this.SearchItem.QA.trim();
    this.SearchItem.JobStatus = this.SearchItem.JobStatus == null ? "" : this.SearchItem.JobStatus.trim();


    this.managerDashboardService.searchJobs(this.SearchItem).then(
      (data) => {
        this.Jobs = data;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching jobs";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
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
  JobStatus: string;
  JobLevel: string;
  Duration: string;
  ShortDuration: string;
  ClientShortName: string;
  TotalMinutes: number;
  PatientList: string;
  Color: number;
  DefaultTAT: number;
  MtStatus: number;
  AqaStatus: number;
  QaStatus: number;
  MtTime: string;
  AqaTime: string;
  QaTime: string;
}


class Search {
  Doctor: string;
  Client: string;
  JobStatus: string;
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
  Total: string;
  TotalJobs: number;
}