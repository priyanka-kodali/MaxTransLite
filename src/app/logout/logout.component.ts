import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template:''
})
export class LogoutComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('roles');
    this.router.navigate(['login']);
  }

}
