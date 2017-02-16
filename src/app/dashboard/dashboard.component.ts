import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  roles: any;

  constructor(private router: Router) {
    if (!this.isLoggedIn) {
      this.router.navigate(['login']);
      return;
    }

    this.navigate();
   
  }

  ngOnInit() {

  }

  navigate(){
 
    this.roles = sessionStorage.getItem('roles');

    if (this.roles.indexOf("Doctor") > -1) {
      this.router.navigate(['doctor-dashboard']);
      return;
    }
    if (this.roles.indexOf("Manager") > -1) {
      this.router.navigate(['manager-dashboard']);      
      return;
    }
    else {
      this.router.navigate(['employee-dashboard']);
      return;
    }
  }


  isLoggedIn() {
    var loggedIn = sessionStorage.getItem('access_token');
    return loggedIn != null;
  }

}
