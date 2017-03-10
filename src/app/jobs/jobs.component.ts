import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { JobsService } from './jobs.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';
import { MasterService } from '../app.service';



@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
  providers: [JobsService]

})


export class JobsComponent implements OnInit {


  @ViewChild('uploadEl') uploadElRef: ElementRef;
  error: string;
  sorting: string;
  keys: Array<string>;
  page: number;
  count: number;
  MtJobs: Array<Job> = new Array<Job>();
  QaJobs: Array<Job> = new Array<Job>();
  AqaJobs: Array<Job> = new Array<Job>();
  Templates: Array<Document> = new Array<Document>();
  PartialDowloadDocuments: Array<Document> = new Array<Document>();
  CurrentJobSummary: Array<JobSummary> = new Array<JobSummary>();
  MtVisible: boolean;
  QaVisible: boolean;
  AqaVisible: boolean;
  TemplateModal: boolean;
  FileModal: boolean;
  IsPartialUpload: boolean;
  IsFinalUpload: boolean;
  SelectedJob: Job = new Job();
  SelectedJobLevel: string;
  myUrl: string = ApiUrl + "/api/Jobs/UploadTranscriptFile";
  DownloadURLs: Array<string> = new Array<string>();
  TempBool: boolean;
  PartialDownloadModal: boolean;
  PartialUploadStartTime: string;
  PartialUploadEndTime: string;
  PatientListModal: boolean

  public uploader: FileUploader = new FileUploader({
    url: this.myUrl
    , headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });

  constructor(private jobsService: JobsService, private sanitizer: DomSanitizer, private masterService: MasterService) {
    this.sorting = "none";
    this.keys = ["Employee Number", "Name", "Department", "Designation", "Phone", "Email", "Manager"];
    this.page = 1;
    this.count = 10;

    this.MtVisible = true;
    this.QaVisible = true;
    this.AqaVisible = true;
    this.TemplateModal = false;
    this.FileModal = false;
    this.PartialDownloadModal = false;
    this.IsFinalUpload = false;
    this.IsPartialUpload = false;

    this.PatientListModal = false;
    this.SelectedJob.PatientList = new Array<string>();
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    try {
      Promise.all([
        this.jobsService.getMyWorkDetails().then(
          (data) => this.CurrentJobSummary = data

        ),
        this.jobsService.getMtJobs().then(
          (data) => this.MtJobs = data
        ),

        this.jobsService.getAqaJobs().then(
          (data) => this.AqaJobs = data
        ),

        this.jobsService.getQaJobs().then(
          (data) => this.QaJobs = data
        )
      ]).then(() => this.masterService.changeLoading(false));
    }

    catch (e) {
      this.error = "Error fetching jobs data";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
    }

  }

  getJobSummary() {
    this.jobsService.getMyWorkDetails().then(
      (data) => this.CurrentJobSummary = data
    )
  }

  getTemplates(DoctorId: number) {
    this.masterService.changeLoading(true);
    this.TemplateModal = !this.TemplateModal;
    this.Templates = new Array<Document>();
    this.jobsService.getTemplates(DoctorId).then(
      (data) => {
        this.Templates = data;
        this.masterService.changeLoading(false);
      }
    )
  }

  getPatientList(job: Job) {
    this.SelectedJob = job;
    this.PatientListModal = true;
  }

  downloadAudioFile(audioURL: string, job: Job, JobLevel: string) {
    this.downloadFile(audioURL);
    if (job.DT != null && (job.AQA != null || job.QA != null)) return;
    this.jobsService.jobDownloaded(job.JobWorkId).then(
      (data) => job.DT = data
    );
  }

  uploadFile(job: Job, jobLevel: string) {
    this.FileModal = true;
    this.SelectedJob = job;
    this.SelectedJobLevel = jobLevel;
    this.IsPartialUpload = false;
    this.PartialUploadStartTime = "";
    this.PartialUploadEndTime = "";

  }

  postJob() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    try {

      if (this.PartialUploadEndTime.trim() == this.SelectedJob.Duration.split('-')[1].trim()) {
        this.IsFinalUpload = true;
        if (!confirm("Is this last document?")) {
          this.PartialUploadEndTime = "";
          this.masterService.changeLoading(false);
          return;
        }
      }
      this.uploader.onBuildItemForm = (item, form) => {
        form.append("JobWorkId", this.SelectedJob.JobWorkId);
        form.append("PartialUpload", this.IsPartialUpload);
        form.append("FinalUpload", this.IsFinalUpload);
        form.append("PartialUploadStartTime", this.PartialUploadStartTime);
        form.append("PartialUploadEndTime", this.PartialUploadEndTime);
      }
      var file = this.uploader.queue[this.uploader.queue.length - 1];
      file.withCredentials = false;
      if (file.file.type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && file.file.type != "application/msword") {
        this.error = "Please select a word('.doc. or '.docx') document";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
        return;
      }
      this.uploader.uploadItem(file);

      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        response = JSON.parse(response);
        if (status != 200) {
          this.error = "Error uploading file";
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
        if (status == 200) {
          this.uploader.clearQueue();
          this.getJobSummary();
          switch (this.SelectedJobLevel) {
            case 'MT':
              this.MtJobs[this.MtJobs.indexOf(this.SelectedJob)] = response;
              break;
            case 'AQA':
              this.AqaJobs[this.AqaJobs.indexOf(this.SelectedJob)] = response;
              break;
            case 'QA':
              this.QaJobs[this.QaJobs.indexOf(this.SelectedJob)] = response;
              break;
          }
          this.SelectedJob = new Job();
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "File uploaded successfully");
          this.FileModal=false;
        }
      };

    }
    catch (ex) {
      throw ex;
    }
  }

  checkboxChanged(job: Job, jobLevel: string) {
    job.ShowUpload = job.ShowDownload = !job.Selected;
    this.DownloadURLs.push(job.AudioURL);
    // switch(jobLevel){
    //   case 'MT': this.MtJobs.forEach(element=>{
    //     if(element.Selected){
    //        this.DownloadURLs.push(element.AudioURL);
    //        element.ShowDownload=false;
    //        element.ShowUpload=false;
    //     }
    //      else{
    //          element.ShowDownload=true;
    //          element.ShowUpload=true;
    //      }
    //   })
    // }

  }

  getTranscriptFile(job: Job, Level: string, event: Event) {

    this.jobsService.jobDownloaded(job.JobWorkId).then(
      (data) => job.DT = data
    );

    switch (Level) {
      case 'AQA':
        if (job.MTUrl.indexOf('.docx') == -1 && job.MTUrl.indexOf('.doc') == -1) {
          event.preventDefault();
          this.masterService.changeLoading(true);
          this.PartialDowloadDocuments = new Array<Document>();
          this.PartialDownloadModal = true;
          this.jobsService.getPartialDownloadFiles(job.JobWorkId).then(
            (data) => {
              this.PartialDowloadDocuments = data;
              this.masterService.changeLoading(false);
            },
            (error) => {
              this.error = "Error fetching documents";
              this.masterService.changeLoading(false);
              this.masterService.postAlert("error", this.error);
            }
          );
        }
        else {
          this.downloadFile(job.MTUrl);
        }
        break;
      case 'QA':

        if (!job.AQA) {
          if (job.MTUrl.indexOf('.docx') == -1 && job.MTUrl.indexOf('.doc') == -1) {
            event.preventDefault();
            this.masterService.changeLoading(true);
            this.PartialDowloadDocuments = new Array<Document>();
            this.PartialDownloadModal = true;
            this.jobsService.getPartialDownloadFiles(job.JobWorkId).then(
              (data) => {
                this.PartialDowloadDocuments = data;
                this.masterService.changeLoading(false);
              },
              (error) => {
                this.error = "Error fetching documents";
                this.masterService.changeLoading(false);
                this.masterService.postAlert("error", this.error);
              }
            );
          }
          else {
            this.downloadFile(job.MTUrl);
          }
        }
        else {
          if (job.AQAUrl.indexOf('.docx') == -1 || job.AQAUrl.indexOf('.doc') == -1) {
            event.preventDefault();
            this.masterService.changeLoading(true);
            this.PartialDowloadDocuments = new Array<Document>();
            this.PartialDownloadModal = true;
            this.jobsService.getPartialDownloadFiles(job.JobWorkId).then(
              (data) => {
                this.PartialDowloadDocuments = data;
                this.masterService.changeLoading(false);
              },
              (error) => {
                this.error = "Error fetching documents";
                this.masterService.changeLoading(false);
                this.masterService.postAlert("error", this.error);
              }
            );
          }
          else {
            this.downloadFile(job.AQAUrl);
          }
        }
        break;
    }
  }

  downloadFile(url: string) {
    this.jobsService.GetURLWithSAS(url).then((data) => window.open(data))
  }

}

class Job {

  constructor() {
    this.PatientList = new Array<string>();
    this.PatientList.length = 0;
  }

  Selected: boolean;
  JobId: number;
  JobWorkId: number;
  JobNumber: string;
  JobDate: string;
  AudioURL: string;
  Duration: string;
  ClientId: number;
  Client: string;
  ClientShortName: string;
  DoctorId: number;
  Doctor: string;
  MT: string;
  AQA: string;
  QA: string;
  TAT: string
  DT: Date;
  UT: Date;
  Lines: string;
  PatientList: Array<string>;
  MTUrl: string;
  AQAUrl: string;
  ShowDownload: boolean;
  ShowUpload: boolean;
  Color: number;
  JobLevel: number;
}

class JobSummary {

  MtPending: number;
  MtPendingHours: string;
  MtCompleted: number;
  MtCompletedHours: string;
  MtTotal: number;
  MtTotalHours: string;
  MtLt18: number;
  MtLt18Hours: string;
  MtGt18: number;
  MtGt18Hour: string;


  AqaPending: number;
  AqaPendingHours: string;
  AqaCompleted: number;
  AqaCompletedHours: string;
  AqaTotal: number;
  AqaTotalHours: string;
  AqaLt18: number;
  AqaLt18Hours: string;
  AqaGt18: number;
  AqaGt18Hours: string;


  QaPending: number;
  QaPendingHours: string;
  QaCompleted: number;
  QaCompletedHours: string;
  QaTotal: number;
  QaTotalHours: string;
  QaLt18: number;
  QaLt18Hours: string;
  QaGt18: number;
  QaGt18Hours: string;
}

class Document {
  Name: string;
  DocumentURL: string;
}

