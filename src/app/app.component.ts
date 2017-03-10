import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from './app.service';
import { Subscription } from 'rxjs';
import { SimpleNotificationsComponent, NotificationsService } from 'angular2-notifications';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MasterService, NotificationsService]
})
export class AppComponent implements OnInit {

  roles: string;
  public loading: boolean;
  subscription: Subscription
  public info: string;
  public success: string;
  public error: string;

  public options = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true,
    pauseOnHover: true,
    clickToClose: true,
  }

  constructor(private router: Router, private masterService: MasterService, private notificationsService: NotificationsService) {
    this.loading = false;
    this.error = "";
    this.success = "";
    this.info = ""
  }

  ngOnInit() {
    this.subscription = this.masterService.loadingEmitter$.subscribe(
      (loading) => {
        this.loading = loading;
      }
    );

    this.subscription = this.masterService.alertEmitter$.subscribe(
      (alert) => {
        switch (alert.type) {
          case "success": this.notificationsService.success('Success', alert.message); break;
          case "error": this.notificationsService.error('Error', alert.message, { timeOut: 0 }); break;
          case "warning": this.notificationsService.alert('Warning', alert.message); break;
          case "info": this.notificationsService.info('Info', alert.message); break;
          case "remove": this.notificationsService.remove(); break;
        }
      }
    )

  }


  isLoggedIn() {
    var loggedIn = sessionStorage.getItem('access_token');
    return loggedIn != null;
  }

  isInRole(role: string) {
    if (this.isLoggedIn()) {
      this.roles = sessionStorage.getItem('roles');
      return this.roles.indexOf(role) > -1;
    }

  }

  getDisplayName() {
    if (this.isLoggedIn()) {
      return sessionStorage.getItem('displayName');
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }
}


