import { Component, OnInit } from '@angular/core';
import { EmployeeDashboardService } from './employee-dashboard.service';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-employee-dashboard',
  templateUrl: 'employee-dashboard.component.html',
  styleUrls: ['employee-dashboard.component.scss'],
  providers: [EmployeeDashboardService]
})
export class EmployeeDashboardComponent implements OnInit {

  myJobsData: Jobs = new Jobs();
  teamJobsData: Jobs = new Jobs();
  monthWorkDetailsData: MonthWorkDetails = new MonthWorkDetails();
  starsOfTheDay: Array<Star> = new Array<Star>();
  starsOfTheMonth: Array<Star> = new Array<Star>();
  notices: Array<Notice> = new Array<Notice>();
  messages: Array<Message> = new Array<Message>();
  leavesData: Leaves = new Leaves();
  appComponent: AppComponent;

  constructor(private employeeDashboardService: EmployeeDashboardService, private router: Router) {
  }

  ngOnInit() {
    new AppComponent(null).showLoading();
    try {
      this.employeeDashboardService.getMyWorkDetails().subscribe(
        (data) => this.myJobsData = data
      )

      this.employeeDashboardService.getMonthlyWorkDetails().subscribe(
        (data) => this.monthWorkDetailsData = data
      )


      this.employeeDashboardService.getLeavesCount().subscribe(
        (data) => this.leavesData = data
      )
      if (this.isInRole('Coordinator')) {
        this.employeeDashboardService.getTeamWorkDetails().subscribe(
          (data) => this.teamJobsData = data
        )
      }
       new AppComponent(null).hideLoading();

    }
    catch (e) { }
  }



  navigateTo(to: string) {
    this.router.navigate([to]);
  }


  isInRole(role: string) {
    this.appComponent = new AppComponent(null);
    if (this.appComponent.isLoggedIn()) {
      this.appComponent.roles = sessionStorage.getItem('roles');
      return this.appComponent.roles.indexOf(role) > -1;
    }
  }


}


class Jobs {
  MtPending: number;
  MtPendingHours: string;
  MtCompleted: number;
  MtCompletedHours: string;
  MtTotal: number;
  MtTotalHours: string;
  MtLt18: number;
  MtLt18Hours: string;
  MtGt18: number;
  MtGt18Hour: string;


  AqaPending: number;
  AqaPendingHours: string;
  AqaCompleted: number;
  AqaCompletedHours: string;
  AqaTotal: number;
  AqaTotalHours: string;
  AqaLt18: number;
  AqaLt18Hours: string;
  AqaGt18: number;
  AqaGt18Hours: string;


  QaPending: number;
  QaPendingHours: string;
  QaCompleted: number;
  QaCompletedHours: string;
  QaTotal: number;
  QaTotalHours: string;
  QaLt18: number;
  QaLt18Hours: string;
  QaGt18: number;
  QaGt18Hours: string;


  TotalPending: number;
  TotalPendingHours: string;
  TotalCompleted: number;
  TotalCompletedHours: string;
  TotalTotal: number;
  TotalTotalHours: string;
  TotalLt18: number;
  TotalLt18Hours: string;
  TotalGt18: number;
  TotalGt18Hours: string;


}

class MonthWorkDetails {
  MtDirect: number;
  MtIndirect: number;
  MtTotal: number;

  AqaIndirect: number;
  AqaTotal: number;

  QaIndirect: number;
  QaTotal: number;

  TotalDirect: number;
  TotalIndirect: number;
  TotalTotal: number;
}

class Star {
  Department: string;
  PhotoURL: string;
  Name: string;
  Hours: number;
}

class Notice {
  Notice: string;
}

class Message {
  Message: string;
}

class Leaves {
  PlRemaining: number;
  PlTaken: number;
  PlTotal: number;

  ClRemaining: number;
  ClTaken: number;
  ClTotal: number;

  SlRemaining: number;
  SlTaken: number;
  SlTotal: number;

  TotalRemaining: number;
  TotalTaken: number;
  TotalTotal: number;
}