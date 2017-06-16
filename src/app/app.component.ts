import { Component, OnInit, Compiler } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from './app.service';
import { Subscription } from 'rxjs';
import { MdSnackBar } from '@angular/material';
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
  public errorNotificationId: string;
  NoticeCount: number;
  LeaveReviewCount: number;
  MessageCount: number;
  NotificationCount: number;
  LoggedIn: boolean;

  public options = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true,
    pauseOnHover: true,
    clickToClose: true,
  }

  constructor(private snackBar: MdSnackBar, private router: Router, private masterService: MasterService, private notificationsService: NotificationsService, private _compiler: Compiler) {
    this.loading = false;
    this.error = "";
    this.success = "";
    this.info = "";
    this.errorNotificationId = "";
    this.LoggedIn = this.isLoggedIn();
    this.NoticeCount = this.LeaveReviewCount = this.MessageCount = this.NotificationCount = 0;
  }

  ngOnInit() {
    this._compiler.clearCache();
    this.subscription = this.masterService.loadingEmitter$.subscribe(
      (loading) => {
        this.loading = loading;
      }
    );

    this.subscription = this.masterService.logoutEmitter$.subscribe(
      (isLoggedIn) => {
        this.LoggedIn = isLoggedIn;
      }
    )

    this.subscription = this.masterService.alertEmitter$.subscribe(

      (alert) => {
        switch (alert.type) {
          case "success": this.notificationsService.success('Success', alert.message); break;
          case "error": this.notificationsService.error('Error', alert.message, { timeOut: 0 }); break;
          case "warning": this.notificationsService.alert('Warning', alert.message); break;
          case "info": this.notificationsService.info('Info', alert.message); break;
          case "remove":
            if (this.errorNotificationId.trim().length > 0) {
              this.notificationsService.remove(this.errorNotificationId);
              this.errorNotificationId = "";
            }
            break;
        }
      }
    )

    this.masterService.getNotificationCount().then(
      (data) => {
        this.NoticeCount = data["NoticeCount"];
        this.LeaveReviewCount = data["LeaveReviewCount"];
        this.MessageCount = data["MessageCount"];
        this.NotificationCount = data["NotificationCount"];
      }
    )

  }

  getDesktopApplication() {

 this.masterService.GetURLWithSAS("https://maxtrans.blob.core.windows.net/setup/EmpApp_Setup.rar").then((data) => {
      data["files"].forEach(file => {
        var newWin = window.open(file);
        setTimeout(function () {
          if (!newWin || newWin.outerHeight === 0) {
            alert("Popup Blocker is enabled! Please add this site to your exception list.");
          }
        }, 25);
      });
    });   
  }

  onCreate(event) {
    if (event["type"] == "error") {
      this.errorNotificationId = event["id"];
    }
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


