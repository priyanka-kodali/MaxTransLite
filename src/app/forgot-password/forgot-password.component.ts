import { Component, OnInit, Input, AfterViewInit, ElementRef, Renderer, ViewChild } from '@angular/core';
import { ForgotPasswordService } from './forgot-password.service';
import { Router } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [ForgotPasswordService]
})
export class ForgotPasswordComponent implements OnInit {

  username: string;
  error: string;
  success: boolean;
  loading: boolean;

  @ViewChild("userName") userName: ElementRef;

  constructor(private forgotPasswordService: ForgotPasswordService, private renderer: Renderer, private router: Router, private masterService: MasterService) {
    this.error = "";
    this.masterService.postAlert("remove", "");
  }

  ngOnInit() {
    this.masterService.postAlert("remove", "");
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.userName.nativeElement, 'focus');
  }

  resetPassword() {

    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");
    if (!this.username || this.username.trim().length == 0) {
      this.error = "Username should not be empty";
      this.renderer.invokeElementMethod(this.userName.nativeElement, 'focus');
      this.masterService.postAlert("error", this.error);
      this.masterService.changeLoading(false);
      return false;
    }

    this.forgotPasswordService.resetPassword(this.username).subscribe(
      (data) => {
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Please check your registered email");
        this.navigateTo("login");
      },
      (error) => {
        this.error = error["_body"];
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
        return;
      }
    )
  }


  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
