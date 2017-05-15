import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { JobsService } from './jobs.service';
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
  ExistingPartialUploadFiles: Array<ExistingPartialUploadFile> = new Array<ExistingPartialUploadFile>();
  PreviousSplitFiles: Array<PreviousSplitFile> = new Array<PreviousSplitFile>();
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
  PatientListModal: boolean;
  UploadType: any;
  Files: FileList;

  public uploader: FileUploader = new FileUploader({
    url: this.myUrl
    , headers: [
      {
        name: 'Authorization',
        value: 'Bearer ' + sessionStorage.getItem('access_token')
      }
    ]
  });

  constructor(private jobsService: JobsService, private masterService: MasterService) {
    this.sorting = "none";
    this.keys = ["Employee Number", "Name", "Department", "Designation", "Phone", "Email", "Manager"];
    this.page = 1;
    this.count = 10;
    this.masterService.postAlert("remove", "");
    this.MtVisible = true;
    this.QaVisible = true;
    this.AqaVisible = true;
    this.TemplateModal = false;
    this.FileModal = false;
    this.PartialDownloadModal = false;
    this.IsFinalUpload = false;
    this.IsPartialUpload = false;
    this.Files = null;
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
          (data) => this.MtJobs = data["MtJobs"]
        ),

        this.jobsService.getAqaJobs().then(
          (data) => this.AqaJobs = data["AqaJobs"]
        ),

        this.jobsService.getQaJobs().then(
          (data) => this.QaJobs = data["QaJobs"]
        )
      ]).then(() => {
        this.masterService.changeLoading(false);
        if (this.MtJobs.length == 0 && this.AqaJobs.length == 0 && this.QaJobs.length == 0) {
          this.masterService.postAlert("info", "There are currently no jobs available");
        }
      });
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
        this.Templates = data["Templates"];
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
    if (!job.DT && job.JobWorkLevel == 'MT') {
      this.jobsService.jobDownloaded(job.JobWorkId).then(
        (data) => job.DT = data["myJob"]["DT"]
      );
    }
  }

  uploadFile(job: Job, jobLevel: string) {
    this.ExistingPartialUploadFiles = new Array<ExistingPartialUploadFile>();
    this.PreviousSplitFiles = new Array<PreviousSplitFile>();
    this.FileModal = true;
    this.SelectedJob = job;
    this.SelectedJobLevel = jobLevel;
    if (this.SelectedJob.LevelStatus == "Partial" || !this.SelectedJob.FullUploadAvailable) {
      this.IsPartialUpload = true;
      this.getPartialUploadFiles(job.JobWorkId);
    }
    else {
      this.IsPartialUpload = false;
    }
    this.PartialUploadStartTime = "";
    this.PartialUploadEndTime = "";

    if (this.SelectedJob.IsLastSplit) {
      this.getPreviousSplitFiles(job.JobId);
    }
  }

  getPartialUploadFiles(jobWorkId) {
    this.jobsService.getPartialUploadFiles(jobWorkId).then(
      (data) => {
        this.ExistingPartialUploadFiles = data["partialUploads"];
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching documents";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }


  getPreviousSplitFiles(JobId) {
    this.masterService.postAlert("remove", "");
    this.jobsService.getPreviousSplitFiles(JobId).then(
      (data) => {
        this.PreviousSplitFiles = data["previousSplitFiles"];
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching documents";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }

  postFile() {
    this.uploader.onBuildItemForm = (item, form) => {
      form.append("JobWorkId", this.SelectedJob.JobWorkId);
      form.append("PartialUpload", this.IsPartialUpload);
      form.append("FinalUpload", this.IsFinalUpload);
      form.append("PartialUploadStartTime", this.PartialUploadStartTime);
      form.append("PartialUploadEndTime", this.PartialUploadEndTime);
    }
    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials = false;
    if (file.file.name.split('.').pop() != "doc" && file.file.name.split('.').pop() != "docx") {
      this.error = "Please select a word('.doc. or '.docx') document";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    if (file.file.name.indexOf(this.SelectedJob.JobNumber) == -1) {
      this.error = "file name should contain job number!";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }
    this.uploader.uploadItem(file);

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);
      if (status != 200) {
        this.error = response;
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
        this.FileModal = false;
      }
    };
  }

  postFolder() {

    if (this.Files.length > 0) {
      let formData: FormData = new FormData();
      this.Files[0].name;
      for (var i = 0; i < this.Files.length; i++) {
        if (this.Files[i].name.split('.').pop() != "doc" && this.Files[i].name.split('.').pop() != "docx") {
          continue;
        }
        formData.append(this.Files[i].name, this.Files[i], this.Files[i].name);
      }

      formData.append("JobWorkId", this.SelectedJob.JobWorkId.toString());
      formData.append("PartialUpload", this.IsPartialUpload.toString());
      formData.append("FinalUpload", this.IsFinalUpload.toString());
      formData.append("PartialUploadStartTime", this.PartialUploadStartTime);
      formData.append("PartialUploadEndTime", this.PartialUploadEndTime);


      this.jobsService.uploadTranscriptFolder(formData).then(
        (data) => {
          if (data["status"] == 500) {
            this.error = data["_body"];
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
            return
          }

          this.Files = null;
          this.getJobSummary();
          switch (this.SelectedJobLevel) {
            case 'MT':
              this.MtJobs[this.MtJobs.indexOf(this.SelectedJob)] = data;
              break;
            case 'AQA':
              this.AqaJobs[this.AqaJobs.indexOf(this.SelectedJob)] = data;
              break;
            case 'QA':
              this.QaJobs[this.QaJobs.indexOf(this.SelectedJob)] = data;
              break;
          }
          this.SelectedJob = new Job();
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Folder uploaded successfully");
          this.FileModal = false;
        }
      );
    }
  }

  uploadTypeChanged() {
    this.uploader.clearQueue();
    this.Files = null;
  }

  folderSelected(event) {
    this.Files = event.target.files;
  }


  submitJob() {
    this.IsFinalUpload = false;
    var AllSplitsIncluded = true;
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    try {

      if (this.PartialUploadEndTime.trim() == this.SelectedJob.Duration.split('-')[1].trim() || this.PartialUploadEndTime.split(':')[1] == this.SelectedJob.Duration.split('-')[1].split(':')[1]) {
        if (!confirm("Is this last document?")) {
          this.PartialUploadEndTime = "";
          this.masterService.changeLoading(false);
          return;
        }
        this.IsFinalUpload = true;
      }

      if (this.SelectedJob.IsLastSplit) {
        if (!confirm("Did you append transcripts of previous splits?")) {
          return;
        }
      }

      this.PreviousSplitFiles.forEach((ele) => {
        if ((!ele.Selected || ele.FileUrl == null) && AllSplitsIncluded) {
          alert("Please include all splits");
          AllSplitsIncluded = false;
          this.masterService.changeLoading(false);
          return;
        }
      })
      if (!AllSplitsIncluded) {
        return;
      }

      if (this.UploadType == "fileUpload") {
        this.postFile();
      }
      else {
        this.postFolder();
      }
    }
    catch (e) { }
  }

  getTranscriptFile(job: Job, Level: string, event: Event) {

    if (!job.DT) {
      this.jobsService.jobDownloaded(job.JobWorkId).then(
        (data) => job.DT = data["myJob"]["DT"]
      );
    }

    switch (Level) {
      case 'AQA':
        if (job.MTUrl.indexOf('.docx') == -1 && job.MTUrl.indexOf('.doc') == -1) {
          event.preventDefault();
          this.masterService.changeLoading(true);
          this.PartialDowloadDocuments = new Array<Document>();
          this.PartialDownloadModal = true;
          this.jobsService.getPartialDownloadFiles(job.JobWorkId).then(
            (data) => {
              this.PartialDowloadDocuments = data["data"];
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
                this.PartialDowloadDocuments = data["data"];
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
                this.PartialDowloadDocuments = data["data"];
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
    this.jobsService.GetURLWithSAS(url).then((data) => {
      data["files"].forEach(file => {
        var newWin = window.open(file);
        setTimeout(function () {
          if (!newWin || newWin.outerHeight === 0) {
            alert("Popup Blocker is enabled! Please add this site to your exception list.");
          }
        }, 25);
      });
    });
    this.masterService.changeLoading(false);
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
  ShortDuration: string;
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
  Color: number;
  JobLevel: string;
  JobWorkLevel: string;
  LevelStatus: string;
  OriginalFileName: string;
  FullUploadAvailable: boolean;
  IsLastSplit: boolean;
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

class ExistingPartialUploadFile {
  StartTime: string;
  EndTime: string;
  UploadTime: string;
  PartialFile: string;
}

class PreviousSplitFile {
  Selected: boolean;
  SequenceNumber: number;
  Employee: string;
  FileUrl: string;
}

