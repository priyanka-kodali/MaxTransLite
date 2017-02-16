import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorsService } from './doctors.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';

@Component({
  moduleId: module.id,
  selector: 'app-doctors',
  templateUrl: 'doctors.component.html',
  styleUrls: ['doctors.component.scss'],
  providers: [DoctorsService]
})
export class DoctorsComponent implements OnInit {


  mainDoctors: Array<Doctor>;
  doctors: Array<Doctor>;
  sorting: string;
  key: string;
  keys: Array<string>
  selectedKey: string;
  searchTerm: string;
  page: number;
  count: number;
  pages: number;
  numbers: Array<number>;
  private sub: any;
  CliId: number;
  error: string;
  ModalError: string;
  SelectedDoctor: Doctor = new Doctor();
  Templates: Array<Template> = new Array<Template>();
  TemplateModal: boolean;
  GetTemplateProgress: boolean;
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  NewTemplate: Template = new Template();
  myUrl: string = ApiUrl+"/api/Doctor/AddTemplate";

  public uploader: FileUploader = new FileUploader({
    url: this.myUrl,
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });


  constructor(private router: Router, private doctorsService: DoctorsService, private activatedRoute: ActivatedRoute) {
    this.sorting = "none";
    this.keys = ["Name", "Client", "Phone", "Email", "Job Level", "Voice Grade"];
    this.page = 1;
    this.count = 10;
    this.error = this.ModalError = "";
    this.TemplateModal = false;
    this.GetTemplateProgress = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.CliId = +params['CliId']
    );
  }

  ngOnInit() {
    this.getDoctors();
  }

  getDoctors() {
    this.doctorsService.getDoctors(this.page, this.count, this.CliId).subscribe(
      (data) => {
        this.mainDoctors = data['doctors']; this.doctors = this.mainDoctors;
        this.pages = data['pages']; this.numbers = new Array<number>(this.pages);
        for (var i = 0; i < this.pages; i++) {
          this.numbers[i] = i + 1;
        }
        this.error = "";
      },
      (error) => { this.error = "Error fetching Doctors" }
    )
  }

  changePage(page: number) {
    if (page <= this.pages && page > 0) {
      this.page = page;
      this.getDoctors();
    }
  }

  changeCount(count: number) {
    this.count = count;
    this.getDoctors();
  }

  getDoctor(doc: Doctor) {
    this.router.navigate(["doctor", doc.Id]);
  }

  sort(event) {
    var sorting = this.sorting;
    var key = event.target.firstChild.data;
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.doctors.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.doctors.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((y < x) ? -1 : ((y > x) ? 1 : 0));
      });
    }
  }

  resetDoctors() {
    this.doctors = this.mainDoctors;
    this.searchTerm = "";
  }

  search() {
    this.selectedKey = this.selectedKey.replace(" ", "");
    try {
      this.doctors = this.mainDoctors.filter((item: any) =>
        item[this.selectedKey] == null ? null : item[this.selectedKey].toString().toLowerCase().match(this.searchTerm.toLowerCase())
      );
    }
    catch (error) { throw error; }
  }

  newDoctor() {
    this.router.navigate(["new-doctor"]);
  }

  getTemplates(doctor: Doctor) {
    this.Templates=new Array<Template>();
    this.ModalError = "";
    this.SelectedDoctor = doctor;
    this.TemplateModal = true;
    this.GetTemplateProgress = true;
    this.UpdateProgress = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.doctorsService.getTemplates(this.SelectedDoctor.Id).subscribe(
      (data) => { this.Templates = data; this.GetTemplateProgress = false; },
      (error) => { this.ModalError = "Error Fetching Templates"; this.GetTemplateProgress = false; }
    );
  }

  updateTemplates() {
    this.UpdateProgress = true;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.uploader.onBuildItemForm = (item, form) => { form.append("DocId", this.SelectedDoctor.Id);form.append("Name", this.NewTemplate.Name); }
    this.uploader.uploadAll();
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.UpdateProgress = false;
      response = JSON.parse(response);
      if (status != 200)
        this.UpdateFailed = true;

      if (status == 200) {
        this.UpdateSuccess = true;
        this.Templates=response;
      }
    };
  }

}


class Doctor {
  Id: number;
  FirstName: string;
  LastName: string;
  PrimaryPhone: string;
  Email: string;
  JobLevel: string;
  VoiceGrade: string;
  Client: string;
}

class Template {
  Id: number;
  Name: string;
  TemplateURL: string;
}
