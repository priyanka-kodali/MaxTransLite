import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PayscaleService } from './payscale.service';


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
  editSuccess: boolean;
  EmployeeName: string;
  EmployeeNumber: string;
  isNewEmployee: boolean;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private payscaleService: PayscaleService) {
    this.error = "";
    this.inputDisabled = false;
    this.editSuccess = false;

    this.paymentStructure = new PaymentStructure();
    this.sub = this.activatedRoute.params.subscribe(
      params => this.EmpId = +params['EmpId']
    );
    this.isNewEmployee = isNaN(this.EmpId);

  }

  ngOnInit() {

    if (this.isNewEmployee) {
      this.inputDisabled = false;
      this.editSuccess = false;
    }

    if (!this.isNewEmployee) {
      try {
        this.payscaleService.getPayscale(this.EmpId).subscribe(
          (data) => {
            this.paymentStructure = data['paymentStructure'];
            this.EmployeeName = data['Name']; this.EmployeeNumber = data['EmployeeNumber'];
          },
          (error) => this.error = "Error fetching payscale details"
        )
      }
      catch (e) { this.error = "Error processing payscale details" }
    }

  }

  editChanges() {
    this.inputDisabled = !this.inputDisabled;
  }


  saveChanges() {
    
    if(this.isNewEmployee){      
      this.payscaleService.postPayscale(this.paymentStructure).subscribe(
        (data) => this.router.navigate(["employees"]),
        (error) => { this.error = error['_body']; this.editSuccess = false; throw error; }
      )
    }
    
    else{
        this.payscaleService.editPayscale(this.paymentStructure).subscribe(
        (data) => {
          this.editSuccess = true;
          this.paymentStructure = data;
          this.inputDisabled=true;
        },
        (error) => { this.error = error['_body']; this.editSuccess = false; throw error; }
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
}