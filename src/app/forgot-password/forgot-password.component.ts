import { Component, OnInit } from '@angular/core';
import { ForgotPasswordService } from './forgot-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers:[ForgotPasswordService]
})
export class ForgotPasswordComponent implements OnInit {

  username :string;
  error:boolean;
  success: boolean;
  loading : boolean;

  constructor(private forgotPasswordService : ForgotPasswordService,private router : Router) {
    this.error=false;
    this.success=false;
    this.loading=false;
   }

  ngOnInit() {
  }

  resetPassword(){
    this.error=false;
    this.success=false;
    this.loading=true;
    this.forgotPasswordService.resetPassword(this.username).subscribe(
      (data)=>{this.loading=false;this.success=true;},
      (error)=>{this.loading=false;this.error=true;},
    )
  }


  navigateTo(route : string){
    this.router.navigate([route]);
  }

}
