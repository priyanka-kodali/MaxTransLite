import { Component, OnInit } from '@angular/core';
import { LeavesReviewService } from './leaves-review.service';

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
  ModalError: string;
  UpdateSuccess: boolean;
  UpdateFailed: boolean;
  UpdateProgress : boolean;
  MasterReviewers: Array<string> = new Array<string>();
  MasterReviewer_Ids: Array<number> = new Array<number>();
  Reviewers: Array<string> = new Array<string>();
  Reviewer_Ids: Array<number> = new Array<number>();
  IsReviewerDataAvailable: boolean;

  constructor(private leavesReviewService: LeavesReviewService) {
    this.ReviewLeaveModal = false;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.UpdateProgress=false;
    this.ModalError = "";
    this.IsReviewerDataAvailable = false;
  }

  ngOnInit() {
    this.leavesReviewService.getLeavesToReview().subscribe(
      (data) => this.Leaves = data,
      (error) => { }
    )
  }

  getReviewers() {
    if (!this.IsReviewerDataAvailable) {
      this.leavesReviewService.getReviewers().subscribe(
        (data) => {
          data.forEach(reviewer => {
            // this.MasterReviewers.push(reviewer.Name);
            // this.MasterReviewer_Ids.push(reviewer.Id);
            this.Reviewers.push(reviewer.Name);
            this.Reviewer_Ids.push(reviewer.Id);
            this.IsReviewerDataAvailable = true;
          });
        },
        (error) => { }
      )
    }
  }

  review(leave: Leave) {
    this.SelectedLeave = leave;
    this.SelectedLeaveFromDate = this.SelectedLeave.FromDate.toString().split("T")[0];
    this.SelectedLeaveToDate = this.SelectedLeave.ToDate.toString().split("T")[0];
    if (this.SelectedLeaveReviewDate1 != null)
      this.SelectedLeaveReviewDate1 = this.SelectedLeave.ReviewDate1.toString().split("T")[0];
    if (this.SelectedLeaveReviewDate2 != null)
      this.SelectedLeaveReviewDate2 = this.SelectedLeave.ReviewDate2.toString().split("T")[0];
    this.ReviewLeaveModal = true;
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
    this.ModalError = "";
    // if(this.SelectedLeave.IsReviewer1){
    //   this.Reviewers=this.MasterReviewers.filter((item)=>item!=this.SelectedLeave.Reviewer1);
    //   this.Reviewer_Ids=this.MasterReviewer_Ids.filter((item)=>item!=this.SelectedLeave.Reviewer1Id);
    // }
  }

  authorizeLeave() {
    this.UpdateSuccess = false;
    this.UpdateFailed = false;
        this.UpdateProgress=true;
    this.ModalError = "";
    if (this.SelectedLeave.IsReviewer1) {
      this.SelectedLeave.Reviewer2_Id = this.Reviewer_Ids[this.Reviewers.indexOf(this.SelectedLeave.Reviewer2)];
    }

    this.leavesReviewService.authorizeLeave(this.SelectedLeave).subscribe(
      (data) => {
        this.SelectedLeave = data;
        this.ReviewLeaveModal = false;
        this.UpdateSuccess = true;
        this.UpdateProgress=false;
      },
      (error) => {
        this.UpdateFailed=true;
        this.UpdateProgress=false;
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