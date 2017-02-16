import { Component, OnInit } from '@angular/core';
import { LeavesService } from './leaves.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss'],
  providers: [LeavesService]
})
export class LeavesComponent implements OnInit {

  MyLeavesCount: LeavesCount = new LeavesCount();
  AppliedLeaves: Array<Leave> = new Array<Leave>();
  NewLeave: Leave;
  NewLeaveModal: boolean;
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress: boolean;
  Error: string;

  constructor(private leavesService: LeavesService) {
    this.Error = "";
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;

    this.leavesService.getLeavesCount().subscribe(
      (data) => this.MyLeavesCount = data,
      (error) => { }
    )

    this.leavesService.getAppliedLeaves().subscribe(
      (data) => this.AppliedLeaves = data,
      (error) => { }
    )
  }

  ngOnInit() {
  }

  newLeave() {
    this.NewLeave = new Leave();
    this.NewLeaveModal = true;

    this.Error = "";
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = false;
  }

  applyLeave() {
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress = true;
    this.Error="";  
    if (this.NewLeave.ToDate < this.NewLeave.FromDate || new Date(this.NewLeave.FromDate) < new Date()) {
      this.Error = "Please select valid 'From' and 'To' dates";
      this.UpdateProgress = false;
      return;
    }


    this.leavesService.applyLeave(this.NewLeave).subscribe(
      (data) => {
        this.UpdateProgress = false;
        this.AppliedLeaves.push(data);
      },
      (error) => {
        this.UpdateProgress = false;
        if (error['_body'] == "No of Leaves appiled are more than No of Leaves Available") {
          this.Error = error['_body'];
          return;
        }
        this.UpdateFailed = true;
      }
    );

  }

}


class LeavesCount {
  PlRemaining: number;
  PlTaken: number;
  PlTotal: number;

  ClRemaining: number;
  ClTaken: number;
  ClTotal: number;

  SlRemaining: number;
  SlTaken: number;
  SlTotal: number;

  TotalRemaining: number;
  TotalTaken: number;
  TotalTotal: number;
}

class Leave {
  FromDate: Date;
  ToDate: Date;
  NoOfDays: number;
  FinalStatus: string;
  Comments: string;
  LeaveType: string;

}