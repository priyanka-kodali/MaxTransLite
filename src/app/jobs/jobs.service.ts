import { Injectable } from '@angular/core';
import { HttpClient } from '../http-client';
import { ApiUrl } from '../shared/config';


@Injectable()
export class JobsService {

  constructor(private http: HttpClient) { }

  getMtJobs() {

    let url = ApiUrl + "/api/Jobs/GetMtJobs";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getAqaJobs() {

    let url = ApiUrl + "/api/Jobs/GetAqaJobs";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getQaJobs() {
    let url = ApiUrl + "/api/Jobs/GetQaJobs";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }


  getMyWorkDetails() {
    let url = ApiUrl + "/api/Dashboard/GetMyJobDetails";
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getTemplates(DoctorId: number) {
    let url = ApiUrl + "/api/Doctor/GetTemplates?DoctorId=" + DoctorId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  jobDownloaded(JobWorkId: number) {
    let url = ApiUrl + "/api/Jobs/JobDownloaded?JobWorkId=" + JobWorkId;
    try {
      return this.http.post(url, null).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  getPartialDownloadFiles(JobWorkId: number) {
    let url = ApiUrl + "/api/Jobs/GetPartialDownloadFiles?JobWorkId=" + JobWorkId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  GetURLWithSAS(blobURL: string) {
    let url = ApiUrl + "/api/Jobs/GetURLWithSAS?url=" + blobURL;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getPartialUploadFiles(JobWorkId: number) {
    let url = ApiUrl + "/api/Jobs/GetPartialUploads?JobWorkId=" + JobWorkId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }
  }

  getPreviousSplitFiles(JobId: number) {
    let url = ApiUrl + "/api/Jobs/GetPreviousSplitFiles?JobId=" + JobId;
    try {
      return this.http.get(url).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }

  uploadTranscriptFolder(formData: any) {
    let url = ApiUrl + "/api/Jobs/UploadTranscriptFolder";
    try {
      return this.http.post(url,formData).toPromise().then((data) => data.json());
    }
    catch (e) { throw e; }

  }


}
