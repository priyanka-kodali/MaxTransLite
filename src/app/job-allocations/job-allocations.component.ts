import { Component, OnInit } from '@angular/core';
import { JobAllocationsService } from './job-allocations.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';

@Component({
  selector: 'app-job-allocations',
  templateUrl: './job-allocations.component.html',
  styleUrls: ['./job-allocations.component.scss'],
  providers: [JobAllocationsService]
})
export class JobAllocationsComponent implements OnInit {

  Jobs: Array<Job> = new Array<Job>();
  Error: string;
  ModalError: string;
  ModalWarning: string;
  Employees: Array<string> = new Array<string>();
  EmployeeIds: Array<number> = new Array<number>();
  EditAllocationModal: boolean;
  UpdateSuccess: boolean;
  SelectedJob: Job = new Job();
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  MTDisabled: boolean;
  AQADisabled: boolean;
  QADisabled: boolean;
  MTHidden: boolean;
  AQAHidden: boolean;
  QAHidden: boolean;
  SplitAllocationModal: boolean;
  SplitAllocationChildJobs: Array<SplitJob>;
  NoOfSplits: number;
  SelectedJobNumber: string;
  SelectedJobSequenceNumber: number;
  isDataAvailable: boolean;
  Levels: Array<string> = new Array<string>();
  SplitJobsStartTime: number;
  SearchItem: Search = new Search();

  constructor(private jobAllocationsService: JobAllocationsService) {
    this.Error = this.ModalError = this.ModalWarning = "";
    this.EditAllocationModal = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.MTDisabled = false;
    this.AQADisabled = false;
    this.QADisabled = false;
    this.MTHidden = false;
    this.AQAHidden = false;
    this.QAHidden = false;
    this.isDataAvailable = false;
  }

  ngOnInit() {
    this.jobAllocationsService.getJobs().subscribe(
      (data) => { { this.Jobs = data; } },
      (error) => this.Error = "Error fetching jobs"
    )
  }

  mtChanged() {
    if (this.SelectedJob.MT.trim() == "") {
      this.statusChanged();
    }

    if (this.SelectedJob.MT.trim() == this.SelectedJob.AQA.trim() || this.SelectedJob.MT.trim() == this.SelectedJob.QA.trim()) {
      this.SelectedJob.MT = "";
    }
  }

  qaChanged() {
    if (this.SelectedJob.QA.trim() == "") {
      this.SelectedJob.AQA = "";
      this.AQADisabled = true;
    }

    if (this.SelectedJob.QA.trim() == this.SelectedJob.AQA.trim() || this.SelectedJob.QA.trim() == this.SelectedJob.MT.trim()) {
      this.SelectedJob.QA = "";
    }
  }

  aqaChanged() {
    if (this.SelectedJob.AQA.trim() == this.SelectedJob.QA.trim() || this.SelectedJob.AQA.trim() == this.SelectedJob.MT.trim()) {
      this.SelectedJob.AQA = "";
    }
  }

  statusChanged() {
    switch (this.SelectedJob.Status) {
      case 'Completed':
        this.MTDisabled = true;
        this.AQADisabled = true;
        this.QADisabled = true;
        break;

      case 'NYS':
        this.MTDisabled = false;
        this.AQADisabled = false;
        this.QADisabled = false;
        break;

      case 'Pending at MT':
        this.MTDisabled = false;
        this.AQADisabled = false;
        this.QADisabled = false;
        break;

      case 'Pending at QA':
        this.MTDisabled = true;
        this.AQADisabled = true;
        this.QADisabled = false;
        break;

      case 'Pending at AQA':
        this.MTDisabled = true;
        this.AQADisabled = false;
        this.QADisabled = false;
        break;

      default:
        this.MTDisabled = true;
        this.AQADisabled = true;
        this.QADisabled = true;
        this.SelectedJob.MT = "";
        this.SelectedJob.AQA = "";
        this.SelectedJob.QA = "";
        break;
    }
  }

  levelChanged() {
    switch (this.SelectedJob.JobLevel) {
      case "L1 (MT)":
        this.AQAHidden = true;
        this.QAHidden = true;
        this.MTHidden = false;
        break;
      case "L1-L3 (MT,QA)":
        this.AQAHidden = true;
        this.QAHidden = false;
        this.MTHidden = false;
        break;
      case "L1-L2-L3 (MT,AQA,QA)":
        this.AQAHidden = false;
        this.QAHidden = false;
        this.MTHidden = false;
        break;
    }
  }

  closeEditAllocationModal() {
    this.EditAllocationModal = false;
  }

  editAllocation(job: Job) {
    this.EditAllocationModal = true;
    this.UpdateFailed = false;
    this.UpdateSuccess = false;
    this.ModalError = "";
    var newJob=new Job();
    newJob=job;
    this.SelectedJob = newJob;
    this.statusChanged();
    this.levelChanged();
    this.getEmployees();
  }

  getEmployees() {
    if (this.isDataAvailable) return;
    this.jobAllocationsService.getEmployees().subscribe(
      (data) => {
        data.forEach(element => {
          this.Employees.push(element.Name);
          this.EmployeeIds.push(element.Id);
          this.isDataAvailable = true;
        });
      }
    )
  }

  updateAllocation() {
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.ModalError = "";
    try {
      this.SelectedJob.MTId = this.EmployeeIds[this.Employees.indexOf(this.SelectedJob.MT)];
      this.SelectedJob.AQAId = this.EmployeeIds[this.Employees.indexOf(this.SelectedJob.AQA)];
      this.SelectedJob.QAId = this.EmployeeIds[this.Employees.indexOf(this.SelectedJob.QA)];

      if (this.SelectedJob.MT && !this.SelectedJob.MTId) {
        this.ModalError = "Please select valid MT"
        return;
      }

      if (this.SelectedJob.AQA && !this.SelectedJob.AQAId) {
        this.ModalError = "Please select valid AQA"
        return;
      }

      if (this.SelectedJob.QA && !this.SelectedJob.QAId) {
        this.ModalError = "Please select valid QA"
        return;
      }

      this.jobAllocationsService.updateAllocation(this.SelectedJob).subscribe(
        (data) => {
          this.Jobs = this.Jobs.filter((item) => item.JobId != data['JobId']);
          this.Jobs.push(data);
          this.UpdateSuccess = true;
          this.Jobs.sort(function (a, b) { return a.JobId - b.JobId; });

        },
        (error) => this.UpdateFailed = true
      )
    }
    catch (e) {
      this.UpdateFailed = false;
    }
  }

  splitJob(job: Job) {
    this.SplitAllocationModal = true;
    this.SelectedJob = job;
    this.NoOfSplits = 0;
    this.SplitAllocationChildJobs = new Array<SplitJob>();
    this.SelectedJobNumber = job.JobNumber.split('_')[0];
    this.SelectedJobSequenceNumber = parseInt(job.JobNumber.split('_')[1]);
    this.getEmployees();
    this.ModalError = "";
    this.UpdateFailed = false;
    this.UpdateSuccess = false;
  }

  employeeForSplitSelected(i: number, level: string) {
    this.ModalError = "";
    var splitJob = this.SplitAllocationChildJobs[i];
    switch (level) {
      case 'MT':
        if (splitJob.MT != "" && (splitJob.MT == splitJob.AQA || splitJob.MT == splitJob.QA)) {
          splitJob.MT = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == 1) continue;
          if (splitJob.MT != "" && this.SplitAllocationChildJobs[k].MT == splitJob.MT) {
            this.ModalWarning = "Multiple jobs are having same MT";
          }
        }
        break;
      case 'AQA':
        if (splitJob.AQA != "" && (splitJob.AQA == splitJob.MT || splitJob.MT == splitJob.QA)) {
          splitJob.AQA = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == 1) continue;
          if (splitJob.AQA != "" && this.SplitAllocationChildJobs[k].AQA == splitJob.AQA) {
            this.ModalWarning = "Multiple jobs are having same AQA";
          }
        }
        break;
      case 'QA':
        if (splitJob.QA != "" && (splitJob.QA == splitJob.MT || splitJob.MT == splitJob.AQA)) {
          splitJob.QA = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == 1) continue;
          if (splitJob.QA != "" && this.SplitAllocationChildJobs[k].QA == splitJob.QA) {
            this.ModalWarning = "Multiple jobs are having same QA";
          }
        }
        break;
    }
  }

  splitNumberChange() {
    if (this.NoOfSplits < 2) return;
    this.NoOfSplits = this.NoOfSplits > 5 ? 5 : this.NoOfSplits;
    var SplitTime = this.SelectedJob.TotalMinutes / this.NoOfSplits;
    this.SplitAllocationChildJobs = new Array<SplitJob>();
    var job: SplitJob = new SplitJob();
    job.JobNumber = this.SelectedJobNumber + '_' + this.SelectedJobSequenceNumber;
    var startTime = this.SelectedJob.Duration.split('-'[0]).toString();
    job.StartTime = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    this.SplitJobsStartTime = job.StartTime;
    job.EndTime = job.StartTime + SplitTime;
    job.MT = this.SelectedJob.MT;
    job.AQA = this.SelectedJob.AQA;
    job.QA = this.SelectedJob.QA;
    this.SplitAllocationChildJobs.push(job);

    for (var i = 1; i < this.NoOfSplits; i++) {
      var job: SplitJob = new SplitJob();
      var jobNumber = this.SelectedJobNumber + '_' + i;
      job.JobNumber = jobNumber;
      job.StartTime = this.SplitAllocationChildJobs[i - 1].EndTime;
      job.EndTime = this.SplitAllocationChildJobs[0].StartTime + ((i + 1) * SplitTime);
      this.SplitAllocationChildJobs.push(job);
    }

  }

  splitAllocation() {
    this.SplitAllocationChildJobs[0].StartTime = this.SplitJobsStartTime;
    this.ModalError = "";
    this.UpdateFailed = false;
    this.UpdateSuccess = false;
    var total = 0;
    this.SplitAllocationChildJobs.forEach(element => {
      total += element.EndTime - element.StartTime;
    })

    if (total != this.SelectedJob.TotalMinutes) {
      this.ModalError = "Please check allocation durations";
    }

    for (var i = 1; i < this.NoOfSplits; i++) {
      if (this.SplitAllocationChildJobs[i].StartTime != this.SplitAllocationChildJobs[i - 1].EndTime) {
        this.ModalError = "Please check allocation durations";
        return;
      }
    }

    for (var i = 0; i < this.NoOfSplits; i++) {

      if (this.SplitAllocationChildJobs[i].MT != undefined) {
        this.SplitAllocationChildJobs[i].MT = this.SplitAllocationChildJobs[i].MT.trim();
      }

      if (this.SplitAllocationChildJobs[i].AQA != undefined) {
        this.SplitAllocationChildJobs[i].AQA = this.SplitAllocationChildJobs[i].AQA.trim();
      }

      if (this.SplitAllocationChildJobs[i].QA != undefined) {
        this.SplitAllocationChildJobs[i].QA = this.SplitAllocationChildJobs[i].QA.trim();
      }

      this.SplitAllocationChildJobs[i].MTId = this.EmployeeIds[this.Employees.indexOf(this.SplitAllocationChildJobs[i].MT)];
      this.SplitAllocationChildJobs[i].AQAId = this.EmployeeIds[this.Employees.indexOf(this.SplitAllocationChildJobs[i].AQA)];
      this.SplitAllocationChildJobs[i].QAId = this.EmployeeIds[this.Employees.indexOf(this.SplitAllocationChildJobs[i].QA)];

      if (this.SplitAllocationChildJobs[i].MT && !this.SplitAllocationChildJobs[i].MTId) {
        this.ModalError = "Please select valid MT for Split " + (i + 1);
        return;
      }

      if (this.SplitAllocationChildJobs[i].AQA && !this.SplitAllocationChildJobs[i].AQAId) {
        this.ModalError = "Please select valid AQA for Split " + (i + 1);
        return;
      }

      if (this.SplitAllocationChildJobs[i].QA && !this.SplitAllocationChildJobs[i].QAId) {
        this.ModalError = "Please select valid QA for Split " + (i + 1);
        return;
      }

    }

    this.jobAllocationsService.splitAllocation(this.SplitAllocationChildJobs).subscribe(
      (data) => { this.Jobs = data, this.UpdateSuccess = true; },
      (error) => this.UpdateFailed = true
    );
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


    this.jobAllocationsService.searchJobs(this.SearchItem).subscribe(
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
  Color : number;
  DefaultTAT : number;
}

class SplitJob {
  JobNumber: string;
  MTId: number;
  MT: string;
  AQAId: number;
  AQA: string;
  QAId: number;
  QA: string;
  StartTime: number;
  EndTime: number;
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