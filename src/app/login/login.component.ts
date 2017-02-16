import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {

  User: User = new User();
  token: string;
  loading : boolean;
  error : boolean;
  constructor(private loginService: LoginService, private router: Router) {
    this.loading=false;
    this.error=false;
   }

  ngOnInit() {
  }

  isLoggedIn() {
    this.token = sessionStorage.getItem('access_token');    
    return this.token != null;
  }

  login() {
    this.error=false;
    this.loading=true;
    if (!this.isLoggedIn()) {
      this.loginService.login(this.User).subscribe(
        (data) => {
          sessionStorage.setItem('access_token', data.access_token);
          sessionStorage.setItem('roles',data.roles);
          sessionStorage.setItem('displayName',data.displayName);
          this.router.navigate(['dashboard']);
        },
        (error)=>{this.loading=false;this.error=true;}
      );
    }
    else{
          this.router.navigate(['dashboard']);
    }
  }

  navigateTo(route : string){
    this.router.navigate([route]);
  }

}

export class User {
  username: string;
  password: string;
  grant_type: string = "password";
}
