import { Component, OnInit } from '@angular/core';
import { JobAllocationsService } from './job-allocations.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-job-allocations',
  templateUrl: './job-allocations.component.html',
  styleUrls: ['./job-allocations.component.scss'],
  providers: [JobAllocationsService]
})
export class JobAllocationsComponent implements OnInit {

  Jobs: Array<Job> = new Array<Job>();
  // DuplicateJobs: Array<Job> = new Array<Job>();
  previousLevel: string;
  error: string;
  warning: string;
  Employees: Array<string> = new Array<string>();
  EmployeeIds: Array<number> = new Array<number>();
  EditAllocationModal: boolean;
  SelectedJob: Job = new Job();
  MTDisabled: boolean;
  AQADisabled: boolean;
  QADisabled: boolean;
  MTHidden: boolean;
  AQAHidden: boolean;
  QAHidden: boolean;
  splitMTDisabled: boolean;
  splitAQADisabled: boolean;
  SplitAllocationModal: boolean;
  SplitAllocationChildJobs: Array<SplitJob>;
  SplitAllocationError: string;
  NoOfSplits: number;
  SelectedJobNumber: string;
  SelectedJobSequenceNumber: number;
  isDataAvailable: boolean;
  Levels: Array<string> = new Array<string>();
  SplitJobsStartTime: number;
  SearchItem: Search = new Search();

  constructor(private jobAllocationsService: JobAllocationsService, private masterService: MasterService) {
    this.masterService.postAlert("remove", "");
    this.error = this.error = this.SplitAllocationError = this.warning = "";
    this.EditAllocationModal = false;
    this.MTDisabled = false;
    this.AQADisabled = false;
    this.QADisabled = false;
    this.MTHidden = false;
    this.AQAHidden = false;
    this.QAHidden = false;
    this.isDataAvailable = false;
    this.splitAQADisabled = false;
    this.splitMTDisabled = false;
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    this.jobAllocationsService.getJobs().then(
      (data) => {
        this.Jobs = data["Jobs"];
        // this.DuplicateJobs = data;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching jobs";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  mtChanged() {
    if (this.SelectedJob.MT.trim() == "") {
      this.statusChanged();
    }

    if ((this.SelectedJob.AQA && this.SelectedJob.MT.trim() == this.SelectedJob.AQA.trim()) || (this.SelectedJob.QA && this.SelectedJob.MT.trim() == this.SelectedJob.QA.trim())) {
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
    this.MTDisabled = false;
    this.AQADisabled = false;
    this.QADisabled = false;
    switch (this.SelectedJob.JobStatus) {
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
      case "L1":
        if (this.MTDisabled) {
          this.SelectedJob.JobLevel = this.previousLevel;
          this.masterService.postAlert("warning", "Please select a valid level");
          return;
        }
        this.AQAHidden = true;
        this.QAHidden = true;
        this.MTHidden = false;
        break;
      case "L1-L3":
        if (this.MTDisabled && this.QADisabled) {
          this.SelectedJob.JobLevel = this.previousLevel;
          this.masterService.postAlert("warning", "Please select a valid level");
          return;
        }
        this.AQAHidden = true;
        this.QAHidden = false;
        this.MTHidden = false;
        if (this.SelectedJob.JobStatus == "Pending at AQA") {
          this.SelectedJob.JobStatus = "Pending at QA";
        }
        break;
      case "L1-L2-L3":
        if (this.MTDisabled && this.QADisabled && this.AQADisabled) {
          this.SelectedJob.JobLevel = this.previousLevel;
          this.masterService.postAlert("warning", "Please select a valid level");
        }
        this.AQAHidden = false;
        this.QAHidden = false;
        this.MTHidden = false;
        break;
    }
  }

  closeEditAllocationModal() {
    this.EditAllocationModal = false;
  }

  editAllocation(i: number) {
    if (this.Jobs[i].JobStatus == "Completed" || this.Jobs[i].JobStatus == "Downloaded") {
      return;
    }
    this.EditAllocationModal = true;
    this.SelectedJob = Object.assign({}, this.Jobs[i]);
    if (this.SelectedJob.MT == null) this.SelectedJob.MT == "";
    if (this.SelectedJob.AQA == null) this.SelectedJob.AQA == "";
    if (this.SelectedJob.QA == null) this.SelectedJob.QA == "";
    this.previousLevel = this.SelectedJob.JobLevel;
    this.statusChanged();
    this.levelChanged();
    this.getEmployees();
  }

  getEmployees() {
    if (this.isDataAvailable) return;
    this.masterService.changeLoading(true);
    this.jobAllocationsService.getEmployees().then(
      (data) => {
        data.forEach(element => {
          this.Employees.push(element.Name);
          this.EmployeeIds.push(element.Id);
        });
        this.isDataAvailable = true;
        this.masterService.changeLoading(false);
      }
    )
  }

  updateAllocation() {

    this.masterService.changeLoading(true);

    if (!this.validateAllocation()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    try {
      this.jobAllocationsService.updateAllocation(this.SelectedJob).then(
        (data) => {
          this.Jobs = this.Jobs.filter((item) => item.JobId != data['JobId']);
          this.Jobs.push(data);
          this.Jobs.sort(function (a, b) { return a.JobId - b.JobId; });
          // this.Jobs.forEach(job => {
          //   this.DuplicateJobs.push(Object.assign({}, job));
          // });
          this.SelectedJob = new Job();
          this.EditAllocationModal = false;
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Job details updated successfully");

        },
        (error) => {
          this.error = error["_body"];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }
    catch (e) {
      this.error = "Error updating job details";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
    }
  }

  validateAllocation() {
    this.masterService.postAlert("remove", "");
    try {

      if (this.SelectedJob.MT && this.SelectedJob.AQA && this.SelectedJob.MT.trim() == this.SelectedJob.AQA.trim()) {
        this.error = "MT and AQA should not be same"
        return false;
      }

      if (this.SelectedJob.MT && this.SelectedJob.QA && this.SelectedJob.MT.trim() == this.SelectedJob.QA.trim()) {
        this.error = "MT and QA should not be same"
        return false;
      }

      if (this.SelectedJob.QA && this.SelectedJob.AQA && this.SelectedJob.QA.trim() == this.SelectedJob.AQA.trim()) {
        this.error = "AQA and QA should not be same"
        return false;
      }

      this.SelectedJob.MTId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SelectedJob.MT)];
      this.SelectedJob.AQAId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SelectedJob.AQA)];
      this.SelectedJob.QAId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SelectedJob.QA)];


      if (!this.MTDisabled && this.SelectedJob.MT && !this.SelectedJob.MTId) {
        this.error = "Please select valid MT"
        return false;
      }

      if (!this.AQADisabled && this.SelectedJob.AQA && !this.SelectedJob.AQAId) {
        this.error = "Please select valid AQA"
        return false;
      }

      if (!this.QADisabled && this.SelectedJob.QA && !this.SelectedJob.QAId) {
        this.error = "Please select valid QA"
        return false;
      }
      return true;
    }
    catch (e) {

    }
  }

  splitJob(i: number) {
    if (this.Jobs[i].JobStatus == "Completed" || this.Jobs[i].JobStatus == "Downloaded") {
      return;
    }
    this.SplitAllocationModal = true;
    this.SelectedJob = Object.assign({}, this.Jobs[i]);
    this.previousLevel = this.SelectedJob.JobLevel;
    this.NoOfSplits = 0;
    this.SplitAllocationChildJobs = new Array<SplitJob>();
    this.SelectedJobNumber = this.SelectedJob.JobNumber.split('_')[0];
    this.SelectedJobSequenceNumber = parseInt(this.SelectedJob.JobNumber.split('_')[1]);
    this.statusChanged();
    this.levelChanged();
    this.getEmployees();
    this.error = "";
    this.splitAQADisabled = false;
    this.splitMTDisabled = false;
  }

  employeeForSplitSelected(i: number, level: string) {
    this.warning = "";
    var splitJob = this.SplitAllocationChildJobs[i];
    switch (level) {
      case 'MT':
        if (splitJob.MT != "" && (splitJob.MT == splitJob.AQA || splitJob.MT == splitJob.QA)) {
          splitJob.MT = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == i) continue;
          if (splitJob.MT != "" && this.SplitAllocationChildJobs[k].MT == splitJob.MT) {
            this.warning = "Multiple jobs are having same MT";
          }
        }
        break;
      case 'AQA':
        if (splitJob.AQA != "" && (splitJob.AQA == splitJob.MT || splitJob.MT == splitJob.QA)) {
          splitJob.AQA = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == i) continue;
          if (splitJob.AQA != "" && this.SplitAllocationChildJobs[k].AQA == splitJob.AQA) {
            this.warning = "Multiple jobs are having same AQA";
          }
        }
        break;
      case 'QA':
        if (splitJob.QA != "" && (splitJob.QA == splitJob.MT || splitJob.MT == splitJob.AQA)) {
          splitJob.QA = "";
        }
        for (var k = 0; k < this.NoOfSplits; k++) {
          if (k == i) continue;
          if (splitJob.QA != "" && this.SplitAllocationChildJobs[k].QA == splitJob.QA) {
            this.warning = "Multiple jobs are having same QA";
          }
        }
        break;
    }
    this.SplitAllocationError = this.warning;
    if (this.warning != "") {
      this.masterService.postAlert("warning", this.warning);
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
    job.StartTime = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]) + parseInt(startTime.split(':')[2]) / 60;
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
      if (this.SelectedJob.JobStatus == "Pending at AQA" || this.SelectedJob.JobStatus == "Pending at QA") {
        this.SplitAllocationChildJobs[i].MT = this.SelectedJob.MT;
        this.SplitAllocationChildJobs[i].MTId = this.SelectedJob.MTId;
        this.splitMTDisabled = true;
      }
      if (this.SelectedJob.JobLevel == "L1-L2-L3" || this.SelectedJob.JobStatus == "Pending at QA") {
        this.SplitAllocationChildJobs[i].AQA = this.SelectedJob.AQA;
        this.SplitAllocationChildJobs[i].AQAId = this.SelectedJob.AQAId;
        this.splitAQADisabled = true;
      }
    }

  }

  splitAllocation() {
    this.masterService.changeLoading(true);

    if (!this.validateSplitAllocations()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    this.jobAllocationsService.splitAllocation(this.SplitAllocationChildJobs).then(
      (data) => {
        this.Jobs = data;
        // this.DuplicateJobs = data;
        this.SplitAllocationModal = false;
        this.SplitAllocationChildJobs = new Array<SplitJob>();
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Jobs splitted successfully");
      },
      (error) => {
        this.error = "Error splitting Jobs";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }

  validateSplitAllocations() {

    this.masterService.postAlert("remove", "");


    this.SplitAllocationChildJobs[0].StartTime = this.SplitJobsStartTime;
    this.error = "";
    var total = 0;
    this.SplitAllocationChildJobs.forEach(element => {
      total += element.EndTime - element.StartTime;
    })

    if (total != this.SelectedJob.TotalMinutes) {
      this.error = "Please check allocation durations";
      return false;
    }

    for (var i = 1; i < this.NoOfSplits; i++) {
      if (this.SplitAllocationChildJobs[i].StartTime != this.SplitAllocationChildJobs[i - 1].EndTime) {
        this.error = "Please check allocation durations";
        return false;
      }
    }

    if (this.SplitAllocationError != "") {
      this.error = this.SplitAllocationError;
      return false;
    }

    for (var i = 0; i < this.NoOfSplits; i++) {

      if (this.SplitAllocationChildJobs[i].MT) {
        this.SplitAllocationChildJobs[i].MT = this.SplitAllocationChildJobs[i].MT.trim();
      }

      if (this.SplitAllocationChildJobs[i].AQA) {
        this.SplitAllocationChildJobs[i].AQA = this.SplitAllocationChildJobs[i].AQA.trim();
      }

      if (this.SplitAllocationChildJobs[i].QA) {
        this.SplitAllocationChildJobs[i].QA = this.SplitAllocationChildJobs[i].QA.trim();
      }

      this.SplitAllocationChildJobs[i].MTId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SplitAllocationChildJobs[i].MT)];
      this.SplitAllocationChildJobs[i].AQAId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SplitAllocationChildJobs[i].AQA)];
      this.SplitAllocationChildJobs[i].QAId = this.EmployeeIds[this.Employees.findIndex((item) => item == this.SplitAllocationChildJobs[i].QA)];

      if (!this.splitMTDisabled && this.SplitAllocationChildJobs[i].MT && !this.SplitAllocationChildJobs[i].MTId) {
        this.error = "Please select valid MT for Split " + (i + 1);
        return false;
      }

      if (!this.splitAQADisabled && this.SplitAllocationChildJobs[i].AQA && !this.SplitAllocationChildJobs[i].AQAId) {
        this.error = "Please select valid AQA for Split " + (i + 1);
        return false;
      }

      if (this.SplitAllocationChildJobs[i].QA && !this.SplitAllocationChildJobs[i].QAId) {
        this.error = "Please select valid QA for Split " + (i + 1);
        return false;
      }
    }
    return true;
  }

  search() {

    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");

    this.SearchItem.Doctor = this.SearchItem.Doctor ? this.SearchItem.Doctor.trim() : this.SearchItem.Doctor;
    this.SearchItem.Client = this.SearchItem.Client ? this.SearchItem.Client.trim() : this.SearchItem.Client;
    this.SearchItem.MT = this.SearchItem.MT ? this.SearchItem.MT.trim() : this.SearchItem.MT;
    this.SearchItem.AQA = this.SearchItem.AQA ? this.SearchItem.AQA.trim() : this.SearchItem.AQA;
    this.SearchItem.QA = this.SearchItem.QA ? this.SearchItem.QA.trim() : this.SearchItem.QA;
    this.SearchItem.JobStatus = this.SearchItem.JobStatus ? this.SearchItem.JobStatus.trim() : this.SearchItem.JobStatus;
    this.SearchItem.JobNumber = this.SearchItem.JobNumber ? this.SearchItem.JobNumber.trim() : this.SearchItem.JobNumber;


    this.jobAllocationsService.searchJobs(this.SearchItem).then(
      (data) => { this.Jobs = data; this.masterService.changeLoading(false); },
      (error) => {
        this.error = "Error fetching jobs";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );


  }

  clearSearch() {
    this.SearchItem.Doctor = "";
    this.SearchItem.Client = "";
    this.SearchItem.MT = "";
    this.SearchItem.AQA = "";
    this.SearchItem.QA = "";
    this.SearchItem.JobStatus = "";
    this.SearchItem.JobNumber = "";
    this.SearchItem.FromDate = null;
    this.SearchItem.ToDate = null;
    this.ngOnInit(); //load current jobs
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
  ClientShortName: string;
  TotalMinutes: number;
  Color: number;
  DefaultTAT: number;
  OriginalFileName: string;
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
  JobStatus: string;
  MT: string;
  AQA: string;
  QA: string;
  FromDate: Date;
  ToDate: Date;
  JobNumber: string;
}