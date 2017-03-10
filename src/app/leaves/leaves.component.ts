import { Component, OnInit } from '@angular/core';
import { LeavesService } from './leaves.service';
import { MasterService } from '../app.service';

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
  error: string;

  constructor(private leavesService: LeavesService, private masterService: MasterService) {
    this.error = "";
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    Promise.all([
      this.leavesService.getLeavesCount().then(
        (data) => this.MyLeavesCount = data,
        (error) => { }
      ),
      this.leavesService.getAppliedLeaves().then(
        (data) => this.AppliedLeaves = data,
        (error) => { }
      )
    ]).then(() => this.masterService.changeLoading(false));
  }

  newLeave() {
    this.NewLeave = new Leave();
    this.NewLeaveModal = true;
    this.error = "";
  }

  applyLeave() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    if (this.NewLeave.ToDate < this.NewLeave.FromDate || new Date(this.NewLeave.FromDate) < new Date()) {
      this.error = "Please select valid 'From' and 'To' dates";
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }


    this.leavesService.applyLeave(this.NewLeave).then(
      (data) => {
        this.AppliedLeaves.push(data);
        this.masterService.changeLoading(false);
      },
      (error) => {
        if (error['_body'] == "No of Leaves appiled are more than No of Leaves Available") {
          this.error = error['_body'];
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
          return;
        }
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