import { Component, OnInit, Input, AfterViewInit, ElementRef, Renderer, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChangePasswordService } from './change-password.service';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [ChangePasswordService]
})
export class ChangePasswordComponent implements OnInit {


  error: string;
  passwordModel: PasswordModel = new PasswordModel();

  @ViewChild("oldPassword") oldPassword: ElementRef;
  @ViewChild("password") password: ElementRef;
  @ViewChild("confirmPassword") confirmPassword: ElementRef;

  constructor(private changePasswordService: ChangePasswordService, private renderer: Renderer, private router: Router, private masterService: MasterService) {
    this.error = "";
    this.masterService.postAlert("remove", "");
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.oldPassword.nativeElement, 'focus');
  }

  changePassword() {

    this.masterService.changeLoading(true);

    if (!this.validate()) {
      this.masterService.changeLoading(false);
      this.masterService.postAlert("error", this.error);
      return;
    }

    this.masterService.postAlert("remove", "");

    this.changePasswordService.changePassword(this.passwordModel).subscribe(
      (data) => {
        sessionStorage.removeItem('access_token');
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Password has been successfully changed!");
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

    if (!this.passwordModel.OldPassword || this.passwordModel.OldPassword.trim().length < 1) {
      this.error = "Old password should not be empty";
      this.renderer.invokeElementMethod(this.oldPassword.nativeElement, 'focus');
      return false;
    }

    if (!this.passwordModel.NewPassword || this.passwordModel.NewPassword.trim().length < 1) {
      this.error = "New password should not be empty";
      this.renderer.invokeElementMethod(this.password.nativeElement, 'focus');
      return false;
    }

    if (!this.passwordModel.ConfirmPassword || this.passwordModel.ConfirmPassword.trim().length < 1) {
      this.error = "New password should not be empty";
      this.renderer.invokeElementMethod(this.confirmPassword.nativeElement, 'focus');
      return false;
    }

    if (this.passwordModel.OldPassword == this.passwordModel.NewPassword) {
      this.error = "New Password must differ from old password";
      this.renderer.invokeElementMethod(this.password.nativeElement, 'focus');
      return false;
    }

    if (this.passwordModel.NewPassword != this.passwordModel.ConfirmPassword) {
      this.error = "Passwords does not match!"
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
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}
