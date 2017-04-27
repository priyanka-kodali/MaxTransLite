import { Component, OnInit } from '@angular/core';
import { LeavesReviewService } from './leaves-review.service';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-leaves-review',
  templateUrl: './leaves-review.component.html',
  styleUrls: ['./leaves-review.component.scss'],
  providers: [LeavesReviewService]
})
export class LeavesReviewComponent implements OnInit {

  Leaves: Array<Leave> = new Array<Leave>();
  SelectedLeave: Leave;
  SelectedLeaveFromDate: any;
  SelectedLeaveToDate: string;
  SelectedLeaveReviewDate1: string;
  SelectedLeaveReviewDate2: string;
  ReviewLeaveModal: boolean;
  MasterReviewers: Array<string> = new Array<string>();
  MasterReviewer_Ids: Array<number> = new Array<number>();
  Reviewers: Array<string> = new Array<string>();
  Reviewer_Ids: Array<number> = new Array<number>();
  IsReviewerDataAvailable: boolean;
  error: string;
  SelectedLeaveIndex: number;

  constructor(private leavesReviewService: LeavesReviewService, private masterService: MasterService) {
    this.masterService.postAlert("remove", "");
    this.ReviewLeaveModal = false;
    this.error = "";
    this.IsReviewerDataAvailable = false;
    this.SelectedLeaveIndex = -1;
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    this.leavesReviewService.getLeavesToReview().then(
      (data) => {
        this.Leaves = data["Leaves"];
        this.Leaves.forEach(element => {
          element.FromDate = new Date(element.FromDate);   //convert to local time
          element.ToDate = new Date(element.ToDate);
        });
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching leaves data";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  getReviewers() {
    if (this.SelectedLeave.ReviewStatus1 != "Further Authorization") {
      return;
    }
    this.masterService.changeLoading(true);
    if (!this.IsReviewerDataAvailable) {
      this.leavesReviewService.getReviewers().then(
        (data) => {
          data["reviewers"].forEach(reviewer => {
            this.Reviewers.push(reviewer.Name);
            this.Reviewer_Ids.push(reviewer.Id);
            this.IsReviewerDataAvailable = true;
          });
          this.masterService.changeLoading(false);
        },
        (error) => {
          this.error = "Error fetching reviewers";
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      )
    }
  }

  review(i: number) {
    this.ReviewLeaveModal = true;
    this.SelectedLeave = Object.assign({}, this.Leaves[i]);
    this.SelectedLeaveIndex = i;
    this.SelectedLeaveFromDate = this.SelectedLeave.FromDate.toString().split("T")[0];
    this.SelectedLeaveToDate = this.SelectedLeave.ToDate.toString().split("T")[0];
    if (this.SelectedLeaveReviewDate1 != null)
      this.SelectedLeaveReviewDate1 = this.SelectedLeave.ReviewDate1.toString().split("T")[0];
    if (this.SelectedLeaveReviewDate2 != null)
      this.SelectedLeaveReviewDate2 = this.SelectedLeave.ReviewDate2.toString().split("T")[0];
  }

  authorizeLeave() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    if (this.SelectedLeave.IsReviewer1) {
      if (this.SelectedLeave.Reviewer2) {
        this.SelectedLeave.Reviewer2_Id = this.Reviewer_Ids[this.Reviewers.findIndex((item) => item.toLowerCase() == this.SelectedLeave.Reviewer2.toLowerCase())];
        if (!this.SelectedLeave.Reviewer2_Id) {
          this.error = "Please select a valid reviewer";
          this.masterService.changeLoading(false);
          this.masterService.postAlert("error", this.error);
        }
      }
    }

    this.leavesReviewService.authorizeLeave(this.SelectedLeave).then(
      (data) => {
        data.FromDate = new Date(data.FromDate);
        data.ToDate = new Date(data.ToDate);
        this.Leaves[this.SelectedLeaveIndex] = data;
        this.SelectedLeaveIndex = -1;
        this.ReviewLeaveModal = false;
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Leave authorization succesful");
      },
      (error) => {
        this.error = "Error updating leave";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

}

class Leave {

  public Id: number;
  public FromDate: Date;
  public ToDate: Date;
  public LeaveType: string;
  public Comments: string;
  public NoOfDays: number;
  public ReviewDate1: Date;
  public ReviewDate2: Date;
  public ReviewStatus1: string;
  public ReviewStatus2: string;
  public ReviewComments: string;
  public FinalStatus: string;
  public Employee: string;
  public Reviewer1: string;
  public Reviewer2: string;
  public Reviewer1_Id: number;
  public Reviewer2_Id: number;
  public IsReviewer1: boolean;

}