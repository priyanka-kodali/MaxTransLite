import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorsService } from './doctors.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';
import { MasterService } from '../app.service';

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
  SelectedDoctor: Doctor = new Doctor();
  Templates: Array<Template> = new Array<Template>();
  TemplateModal: boolean;
  GetTemplateProgress: boolean;
  NewTemplate: Template = new Template();
  myUrl: string = ApiUrl + "/api/Doctor/AddTemplate";

  public uploader: FileUploader = new FileUploader({
    url: this.myUrl,
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]
  });


  constructor(private router: Router, private doctorsService: DoctorsService, private activatedRoute: ActivatedRoute, private masterService: MasterService) {
    this.sorting = "none";
    this.keys = ["Name", "Client", "Phone", "Email", "Job Level", "Voice Grade"];
    this.page = 1;
    this.count = 10;
    this.error = "";
    this.TemplateModal = false;
    this.GetTemplateProgress = false;
    this.sub = this.activatedRoute.params.subscribe(
      params => this.CliId = +params['CliId']
    );
  }

  ngOnInit() {
    this.getDoctors();
  }

  getDoctors() {
    this.masterService.changeLoading(true);
    this.doctorsService.getDoctors(this.page, this.count, this.CliId).then(
      (data) => {
        this.mainDoctors = data['doctors']; this.doctors = this.mainDoctors;
        this.pages = data['pages']; this.numbers = new Array<number>(this.pages);
        for (var i = 0; i < this.pages; i++) {
          this.numbers[i] = i + 1;
        }
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Doctors";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
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
    this.masterService.changeLoading(true);
    var sorting = this.sorting;
    var key = event.target.firstChild.data;
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.doctors.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        this.masterService.changeLoading(false);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.doctors.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        this.masterService.changeLoading(false);
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
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    this.Templates = new Array<Template>();
    this.SelectedDoctor = doctor;
    this.TemplateModal = true;
    this.GetTemplateProgress = true;
    this.doctorsService.getTemplates(this.SelectedDoctor.Id).then(
      (data) => {
        this.Templates = data;
        this.GetTemplateProgress = false;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error Fetching Templates";
        this.GetTemplateProgress = false;
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    );
  }

  updateTemplates() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    this.uploader.onBuildItemForm = (item, form) => { form.append("DocId", this.SelectedDoctor.Id); form.append("Name", this.NewTemplate.Name); }
    
    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials = false;

    
      this.uploader.uploadItem(file);
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);
      if (status != 200) {
        this.error = "Error occoured while uploading template";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }

      if (status == 200) {
        this.Templates = response;
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Template added successfully");
        this.uploader.clearQueue();
        this.NewTemplate=new Template();
      }
    };
  }

   downloadFile(url: string) {
    this.masterService.changeLoading(true);
    this.masterService.GetURLWithSAS(url).then((data) => {
      window.open(data);
      this.masterService.changeLoading(false);
    })
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
