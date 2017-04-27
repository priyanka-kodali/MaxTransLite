import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PayscaleService } from './payscale.service';
import { MasterService } from '../app.service';


@Component({
  moduleId: module.id,
  selector: 'app-payscale',
  templateUrl: 'payscale.component.html',
  styleUrls: ['payscale.component.scss'],
  providers: [PayscaleService]
})
export class PayscaleComponent implements OnInit {

  paymentStructure: PaymentStructure;
  private sub: any;
  EmpId: number;
  error: string;
  inputDisabled: boolean;
  EmployeeName: string;
  EmployeeNumber: string;
  isNewEmployee: boolean;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private masterService: MasterService, private payscaleService: PayscaleService) {
    this.error = "";
    this.inputDisabled = false;
    this.masterService.postAlert("remove", "");
 this.paymentStructure = new PaymentStructure();
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);

  }

  ngOnInit() {
    this.masterService.changeLoading(true);

    if (this.isNewEmployee) {
      this.inputDisabled = false;
      this.masterService.changeLoading(false);
    }

    if (!this.isNewEmployee) {
      try {
        this.payscaleService.getPayscale(this.EmpId).then(
          (data) => {
            this.paymentStructure = data['employeePaymentStructure'];
            this.masterService.changeLoading(false);
          },
          (error) => {
            this.error = "Error fetching payscale details";
            this.masterService.changeLoading(false);
            this.masterService.postAlert("error", this.error);
          }
        )
      }
      catch (e) {
        this.error = "Error processing payscale details";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    }

  }

  editChanges() {
    this.inputDisabled = !this.inputDisabled;
  }


  saveChanges() {

    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");

    if (this.isNewEmployee) {
      this.payscaleService.postPayscale(this.paymentStructure).then(
        (data) => {
          this.router.navigate(["employees"]);
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Payscale updated successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
          throw error;
        }
      )
    }

    else {
      this.payscaleService.editPayscale(this.paymentStructure).then(
        (data) => {
          this.paymentStructure = data['employeePaymentStructure'];
          this.inputDisabled = true;
          this.masterService.changeLoading(false);
          this.masterService.postAlert("success", "Payscale updated successfully");
        },
        (error) => {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
          throw error;
        }
      )
    }
  }
}


export class PaymentStructure {
  Gross: number;
  BankAccNo: string;
  BankAccName: string;
  BankName: string;
  BankBranch: string;
  Employee_Id: number;
  EmployeeName: string;
  EmployeeNumber: string;
}