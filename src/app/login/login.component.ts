import { Component, AfterViewInit, ViewChild, Renderer, ElementRef, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  moduleId: module.id,
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit, AfterViewInit {

  User: User = new User();
  token: string;
  error: string;


  @ViewChild("username") username: ElementRef;
  @ViewChild("password") password: ElementRef;


  constructor(private loginService: LoginService, private router: Router, private masterService: MasterService, private renderer: Renderer) {
    this.error = "";
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.username.nativeElement, 'focus');
  }

  ngOnInit() {
    this.masterService.postAlert("remove", "");
    this.masterService.changeLoading(false);
  }

  isLoggedIn() {
    this.token = sessionStorage.getItem('access_token');
    return this.token != null;
  }

  login() {

    this.masterService.postAlert("remove", "");
    this.masterService.changeLoading(true);

    if (this.User.username.trim().length == 0) {
      this.error = "Please enter valid username";
      this.masterService.postAlert("error", this.error);
      this.renderer.invokeElementMethod(this.username.nativeElement, 'focus');
      this.masterService.changeLoading(false);
      return;
    }

    if (this.User.password.trim().length == 0) {
      this.error = "Please enter valid password";
      this.masterService.postAlert("error", this.error);
      this.renderer.invokeElementMethod(this.password.nativeElement, 'focus');
      this.masterService.changeLoading(false);
      return;
    }

    if (!this.isLoggedIn()) {
      this.loginService.login(this.User).subscribe(
        (data) => {
          sessionStorage.setItem('access_token', data.access_token);
          sessionStorage.setItem('roles', data.roles);
          sessionStorage.setItem('displayName', data.displayName);
          this.masterService.changeLoading(false);
          this.router.navigate(['dashboard']);
        },
        (error) => {
          this.error = "Please enter valid credentials";
          this.masterService.postAlert("error", this.error);
          this.masterService.changeLoading(false);
        }
      );
    }
    else {
      this.router.navigate(['dashboard']);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}

export class User {
  username: string;
  password: string;
  grant_type: string = "password";
}
