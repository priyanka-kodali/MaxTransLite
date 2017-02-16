import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentsService } from './documents.service';
import { FileUploader } from '../../../node_modules/ng2-file-upload';
import { ApiUrl } from '../shared/config';


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
  uploadSuccess: boolean
  sorting: string;
  NewDocumentModal: boolean;
  EmpId: number;
  private sub: any;
  modalError: string;
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


  constructor(private router: Router, private activatedRoute: ActivatedRoute, private documentService: DocumentsService) {
    this.keys = ["Category", "Document Date", "Upload Date", "Keywords", "Notes"];
    this.sorting = "none";
    this.error = "";
    this.modalError = "";
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);
  }

  ngOnInit() {
    this.nextButton = this.isNewEmployee;
    try {
      this.documentService.getDocuments(this.EmpId).subscribe(
        (data) => {
          this.mainDocuments = data['documents']; this.documents = this.mainDocuments;
          this.EmployeeName = data['Name']; this.EmployeeNumber = data['EmployeeNumber'];
          this.mainDocuments.forEach(element => {
            element.UploadDate = element.UploadDate.split("T")[0];
            element.DocumentDate = element.DocumentDate == null ? null : element.DocumentDate.split("T")[0];
          }
          );
          this.error = "";
        },
        (error) => { this.error = "Error fetching documents"; }
      );
    }
    catch (e) {
      this.error = "Error fetching documents";
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


  }

  newDocument() {
    this.NewDocumentModal = true;
    this.uploadSuccess = false;
    this.NewDocument = new Document();
    this.NewDocument.Employee_Id = this.EmpId;
  }

  uploadDocument() {

    this.error = "";
    this.uploadSuccess = false;

    this.uploader.onBuildItemForm = (item, form) => {
      form.append("documentData", JSON.stringify(this.NewDocument));
    }

    this.uploader.uploadAll();

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      response = JSON.parse(response);

      if (status == 200) {
        this.mainDocuments.push(response);
        this.documents = this.mainDocuments;
        this.uploadSuccess = true;
      }

      if (status != 200) {
        this.error = "An error occoured while uploading the document";
      }
    }
  }

  navigateToPayscale() {
    this.router.navigate(["/new-employee", "payscale", this.EmpId]);
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
