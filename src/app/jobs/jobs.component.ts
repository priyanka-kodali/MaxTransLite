import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { JobsService } from './jobs.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';



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
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  myUrl: string = ApiUrl + "/api/Jobs/UploadTranscriptFile";
  DownloadURLs: Array<string> = new Array<string>();
  TempBool: boolean;
  PartialDownloadModal: boolean;
  PartialUploadStartTime: string;
  PartialUploadEndTime: string;
  ModalError: string;
  PatientListModal: boolean

  public uploader: FileUploader = new FileUploader({
    url: this.myUrl
    ,headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });

  constructor(private jobsService: JobsService, private sanitizer: DomSanitizer) {
    this.sorting = "none";
    this.keys = ["Employee Number", "Name", "Department", "Designation", "Phone", "Email", "Manager"];
    this.page = 1;
    this.count = 10;
    this.error = "";
    this.MtVisible = true;
    this.QaVisible = true;
    this.AqaVisible = true;
    this.TemplateModal = false;
    this.FileModal = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.PartialDownloadModal = false;
    this.IsFinalUpload = false;
    this.IsPartialUpload = false;
    this.ModalError = "";
    this.PatientListModal = false;
    this.SelectedJob.PatientList=new Array<string>();
  }

  ngOnInit() {

    try {

      this.jobsService.getMyWorkDetails().subscribe(
        (data) => this.CurrentJobSummary = data

      )

      this.jobsService.getMtJobs().subscribe(
        (data) => {
          this.MtJobs = data;          
        }
      )

      this.jobsService.getAqaJobs().subscribe(
        (data) => this.AqaJobs = data
      )

      this.jobsService.getQaJobs().subscribe(
        (data) => this.QaJobs = data
      )

    }

    catch (e) { }

  }

  getJobSummary() {
    this.jobsService.getMyWorkDetails().subscribe(
      (data) => this.CurrentJobSummary = data
    )
  }


  getTemplates(DoctorId: number) {
    this.UpdateProgress = true;
    this.TemplateModal = !this.TemplateModal;
    this.Templates = new Array<Document>();
    this.jobsService.getTemplates(DoctorId).subscribe(
      (data) => { this.Templates = data; this.UpdateProgress = false; }
    )
    this.MtJobs[0].PatientList.length
  }

  getPatientList(job: Job) {
    this.SelectedJob = job;
    this.PatientListModal = true;
  }

  jobDownloaded(job: Job, JobLevel: string) {
    if (job.DT != null) return;
    this.jobsService.jobDownloaded(job.JobWorkId).subscribe(
      (data) => job.DT = data
    );
  }

  uploadFile(job: Job, jobLevel: string) {
    this.FileModal = true;
    this.SelectedJob = job;
    this.SelectedJobLevel = jobLevel;
    this.IsPartialUpload = false;
    this.UpdateProgress = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.PartialUploadStartTime = "";
    this.PartialUploadEndTime = "";
    this.ModalError = "";
  }

  postJob() {

    try{
    this.UpdateProgress = true;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.ModalError = "";
    this.uploader.onBuildItemForm = (item, form) => {
      form.append("JobWorkId", this.SelectedJob.JobWorkId);
      form.append("PartialUpload", this.IsPartialUpload);
      form.append("FinalUpload", this.IsFinalUpload);
      form.append("PartialUploadStartTime", this.PartialUploadStartTime);
      form.append("PartialUploadEndTime", this.PartialUploadEndTime);
    }
    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials=false;
    if (file.file.type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && file.file.type != "application/msword") {
      this.ModalError = "Please select a word('.doc. or '.docx') document";
      this.UpdateProgress = false;
      return;
    }    
    this.uploader.uploadItem(file);

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.UpdateProgress = false;
      response = JSON.parse(response);
      if (status != 200) {
        this.UpdateFailed = true;
      }
      if (status == 200) {
        this.UpdateSuccess = true;
        this.SelectedJob=new Job();
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
      }
    };

    }
    catch(ex){
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

  PartialTranscriptDownload(job: Job, Level: string, event: Event) {
    this.UpdateProgress = true;
    this.error = "";

    switch (Level) {
      case 'AQA':
        if (job.MTUrl.indexOf('.docx') == -1 && job.MTUrl.indexOf('.doc') == -1) {
          event.preventDefault();
          this.PartialDowloadDocuments = new Array<Document>();
          this.PartialDownloadModal = true;
          this.jobsService.getPartialDownloadFiles(job.JobWorkId).subscribe(
            (data) => { this.PartialDowloadDocuments = data; this.UpdateProgress = false; },
            (error) => { this.error = "Error fetching documents"; this.UpdateProgress = false; }
          );
        }
        break;
      case 'QA':

        if (!job.AQA) {
          if (job.MTUrl.indexOf('.docx') == -1 && job.MTUrl.indexOf('.doc') == -1) {
            event.preventDefault();
            this.PartialDowloadDocuments = new Array<Document>();
            this.PartialDownloadModal = true;
            this.jobsService.getPartialDownloadFiles(job.JobWorkId).subscribe(
              (data) => { this.PartialDowloadDocuments = data; this.UpdateProgress = false; },
              (error) => { this.error = "Error fetching documents"; this.UpdateProgress = false; }
            );
          }
        }
        else {
          if (job.AQAUrl.indexOf('.docx') == -1 || job.AQAUrl.indexOf('.doc') == -1) {
            event.preventDefault();
            this.PartialDowloadDocuments = new Array<Document>();
            this.PartialDownloadModal = true;
            this.jobsService.getPartialDownloadFiles(job.JobWorkId).subscribe(
              (data) => { this.PartialDowloadDocuments = data; this.UpdateProgress = false; },
              (error) => { this.error = "Error fetching documents"; this.UpdateProgress = false; }
            );
          }
        }


        break;
    }
  }


}

class Job {

  constructor() {
    this.PatientList = new Array<string>();
    this.PatientList.length=0;
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

