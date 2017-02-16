import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  roles : string;

  constructor(private router : Router){}
  

  isLoggedIn() {
    var loggedIn = sessionStorage.getItem('access_token');
    return loggedIn != null;
  }

  isInRole(role: string) {
     //return true;
    if (this.isLoggedIn()) {
      this.roles = sessionStorage.getItem('roles');      
      return this.roles.indexOf(role)>-1;
    } 

  }
  getDisplayName(){
    if(this.isLoggedIn()){    
      return sessionStorage.getItem('displayName');
    }
  }

  navigateTo(route : string){    
    this.router.navigate([route]);
  }

}


