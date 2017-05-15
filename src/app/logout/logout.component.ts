import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-logout',
  template: ''
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private masterService: MasterService) { }

  ngOnInit() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('roles');
    this.router.navigate(['login']);
    this.masterService.logOut(false);
  }

}
