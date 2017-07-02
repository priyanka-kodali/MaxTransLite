import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentsService } from './documents.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';
import { MasterService } from '../app.service';


@Component({
  moduleId: module.id,
  selector: 'app-documents',
  templateUrl: 'documents.component.html',
  styleUrls: ['documents.component.scss'],
  providers: [DocumentsService]
})
export class DocumentsComponent implements OnInit {

  searchTerm: string;
  keys: Array<any>;
  selectedKey: string;
  mainDocuments: Array<any>
  documents: Array<any>;
  NewDocument: Document;
  sorting: string;
  NewDocumentModal: boolean;
  EmpId: number;
  private sub: any;
  error: string;
  nextButton: boolean;
  EmployeeName: string
  EmployeeNumber: string
  isNewEmployee: boolean;


  public uploader: FileUploader = new FileUploader({
    url: ApiUrl + "/api/EmployeeDocuments/AddDocument",
    headers: [{
      name: 'Authorization',
      value: 'Bearer ' + sessionStorage.getItem('access_token')
    }]

  });


  constructor(private router: Router, private activatedRoute: ActivatedRoute, private masterService: MasterService, private documentService: DocumentsService) {
    this.masterService.postAlert("remove", "");
    this.keys = ["Category", "Document Date", "Upload Date", "Keywords", "Notes"];
    this.sorting = "none";
    this.error = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);
  }

  ngOnInit() {
    this.nextButton = true;
    this.masterService.changeLoading(true);
    try {
      this.documentService.getDocuments(this.EmpId).then(
        (data) => {
          this.mainDocuments = data['documents']; this.documents = this.mainDocuments;
          this.EmployeeName = data['Name']; this.EmployeeNumber = data['EmployeeNumber'];
          this.mainDocuments.forEach(element => {
            element.UploadDate = element.UploadDate.split("T")[0];
            element.DocumentDate = element.DocumentDate == null ? null : element.DocumentDate.split("T")[0];
          }
          );
          this.masterService.changeLoading(false);
        },
        (error) => {
          this.error = "Error fetching documents";
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      );
    }
    catch (e) {
      this.error = "Error fetching documents";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
    }

  }

  resetDocuments() {
    this.documents = this.mainDocuments;
    this.searchTerm = "";
  }

  search() {
    this.selectedKey = this.selectedKey.replace(" ", "");
    try {
      this.documents = this.mainDocuments.filter((item: any) =>
        item[this.selectedKey] == null ? null : item[this.selectedKey].toString().toLowerCase().match(this.searchTerm.toLowerCase())
      );
    }
    catch (error) {
    }
  }

  sort(event) {
    this.masterService.changeLoading(true);
    var sorting = this.sorting;
    var key = event.target.firstChild.data.replace(" ", "");
    if (sorting == "none" || sorting == "des") {
      this.sorting = "asc";
      this.documents.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    if (sorting == "asc") {
      this.sorting = "des";
      this.documents.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((y < x) ? -1 : ((y > x) ? 1 : 0));
      });
    }
    this.masterService.changeLoading(false);
  }

  newDocument() {
    this.NewDocumentModal = true;
    this.NewDocument = new Document();
    this.NewDocument.Employee_Id = this.EmpId;
  }

  uploadDocument() {
    this.masterService.changeLoading(true);

    this.masterService.postAlert("remove", "");


    this.uploader.onBuildItemForm = (item, form) => {
      form.append("documentData", JSON.stringify(this.NewDocument));
    }

    var file = this.uploader.queue[this.uploader.queue.length - 1];
    file.withCredentials = false;


    this.uploader.uploadItem(file);

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);

      if (status == 200) {
        this.mainDocuments.push(response);
        this.documents = this.mainDocuments;
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Document added successfully");
        this.NewDocument = new Document();
        this.NewDocumentModal = false;
      }

      if (status != 200) {
        this.error = "An error occoured while uploading the document";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    }
  }

  navigateToPayscale() {
    this.router.navigate(["/new-employee", "payscale", this.EmpId]);
  }


  downloadFile(url: string) {
    this.masterService.DownloadFile(url);
    // this.masterService.changeLoading(true);
    // this.masterService.GetURLWithSAS(url).then((data) => {
    //   var newWin = window.open(data, "_self");
    //   this.masterService.changeLoading(false);
    //   setTimeout(function () {
    //     if (!newWin || newWin.outerHeight === 0) {
    //       alert("Popup Blocker is enabled! Please add this site to your exception list.");
    //     }
    //   }, 25);
    // })
  }
}



export class Document {
  Category: string;
  UploadDate: Date;
  DocumentDate: Date;
  Document: File;
  Notes: string;
  Keywords: string;
  Employee_Id: number;
}
