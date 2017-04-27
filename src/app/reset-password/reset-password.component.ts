import { Component, OnInit, Input, AfterViewInit, ElementRef, Renderer, ViewChild } from '@angular/core';
import { ResetPasswordService } from './reset-password.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [ResetPasswordService]
})
export class ResetPasswordComponent implements OnInit, AfterViewInit {

  error: string;
  passwordModel: PasswordModel = new PasswordModel();
  sub: any;

  @ViewChild("username") username: ElementRef;
  @ViewChild("password") password: ElementRef;
  @ViewChild("confirmPassword") confirmPassword: ElementRef;

  constructor(private resetPasswordService: ResetPasswordService, private renderer: Renderer, private router: Router, private masterService: MasterService, private activatedRoute: ActivatedRoute) {
    this.error = "";
    this.masterService.postAlert("remove", "");
    this.sub = this.activatedRoute.params.subscribe(
      params => this.passwordModel.Key = params['key']
    );

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.username.nativeElement, 'focus');
  }

  resetPassword() {
    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    this.resetPasswordService.resetPassword(this.passwordModel).subscribe(
      (data) => {
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Password has been successfully reset!");
        this.navigateTo("login");
      },
      (error) => {
      this.error = "An error occoured while changing password!";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
        return;
      }
    );
  }

  validate() {
 
    this.masterService.postAlert("remove", "");

    if (!this.passwordModel.Username || this.passwordModel.Username.trim().length == 0) {
      this.error = "Username should not be empty";
      this.renderer.invokeElementMethod(this.username.nativeElement, 'focus');
      return false;
    }


    if (!this.passwordModel.Password || this.passwordModel.Password.trim().length == 0) {
      this.error = "Password should not be empty";
      this.renderer.invokeElementMethod(this.password.nativeElement, 'focus');
      return false;
    }

    if (!this.passwordModel.ConfirmPassword || this.passwordModel.ConfirmPassword.trim().length == 0) {
      this.error = "Password should not be empty";
      this.renderer.invokeElementMethod(this.confirmPassword.nativeElement, 'focus');
      return false;
    }

    if (this.passwordModel.Password != this.passwordModel.ConfirmPassword) {
      this.error = "Passwords does not match!";
      this.renderer.invokeElementMethod(this.password.nativeElement, 'focus');
      return false;
    }

    return true;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}

class PasswordModel {
  Username: string;
  Password: string;
  ConfirmPassword: string;
  Key: any;
}
