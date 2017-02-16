import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangePasswordService } from './change-password.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [ChangePasswordService]
})
export class ChangePasswordComponent implements OnInit {


  error: string;
  success: boolean;
  loading: boolean;
  passwordModel: PasswordModel = new PasswordModel();

  constructor(private changePasswordService: ChangePasswordService, private router: Router) {
    this.error = "";
    this.success = false;
    this.loading = false;
  }

  ngOnInit() {
  }

  changePassword() {

    this.error = "";
    this.loading = true;
    this.success = false;


    if (this.passwordModel.OldPassword == this.passwordModel.NewPassword) {
      this.error = "New Password must differ from old password";
      this.loading = false;
      return;
    }

    if (this.passwordModel.NewPassword != this.passwordModel.ConfirmPassword) {
      this.error = "Passwords does not match!"
      this.loading = false;
      return;
    }

    this.changePasswordService.changePassword(this.passwordModel).subscribe(
      (data) => { this.success = true; this.loading = false; sessionStorage.removeItem('access_token');},
      (error) => { this.error = "An error occoured while changing password!"; this.loading = false; }
    );
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
