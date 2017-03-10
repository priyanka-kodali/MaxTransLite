import { Component, OnInit } from '@angular/core';
import { ResetPasswordService } from './reset-password.service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [ResetPasswordService]
})
export class ResetPasswordComponent implements OnInit {

  error: string;
  success: boolean;
  loading: boolean;
  passwordModel: PasswordModel = new PasswordModel();
  sub: any;

  constructor(private resetPasswordService: ResetPasswordService, private router: Router,private activatedRoute : ActivatedRoute) {
    this.error = "";
    this.success = false;
    this.loading = false;    
    this.sub = this.activatedRoute.params.subscribe(
      params => this.passwordModel.Key = params['key']
    );
        
   }

  ngOnInit() {
  }

  resetPassword() {

    this.error = "";
    this.loading = true;
    this.success = false;

    if (this.passwordModel.Password != this.passwordModel.ConfirmPassword) {
      this.error = "Passwords does not match!"
      this.loading = false;
      return;
    }

    this.resetPasswordService.resetPassword(this.passwordModel).subscribe(
      (data) => { this.success = true; this.loading = false; },
      (error) => { this.error = "An error occoured while changing password!"; this.loading = false; }
    );
  }

  navigateTo(route : string){
    this.router.navigate([route]);
  }

}

class PasswordModel {
  Username: string;
  Password: string;
  ConfirmPassword: string;
  Key: any;
}
