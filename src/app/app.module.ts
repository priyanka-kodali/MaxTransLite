import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TypeaheadModule, ComponentLoaderFactory, PositioningService } from 'ngx-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { SimpleNotificationsModule } from 'angular2-notifications';


import { AppRoutingModule, routingComponents, routes } from './app.routes';

import { HttpClient } from './http-client';

import { AppComponent } from './app.component';
import { ClientComponent } from './client/client.component';
import { ClientEmployeeComponent } from './client-employee/client-employee.component';
import { ClientEmployeesComponent } from './client-employees/client-employees.component';
import { ClientsComponent } from './clients/clients.component';
import { DefaultAllocationComponent } from './default-allocation/default-allocation.component';
import { DefaultAllocationsComponent } from './default-allocations/default-allocations.component';
import { DoctorComponent } from './doctor/doctor.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { DocumentsComponent } from './documents/documents.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { EmployeeComponent } from './employee/employee.component';
import { EmployeesComponent } from './employees/employees.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NewEmployeeComponent } from './new-employee/new-employee.component';
import { PayscaleComponent } from './payscale/payscale.component';
import { JobsComponent } from './jobs/jobs.component';
import { LogoutComponent } from './logout/logout.component';
import { JobAllocationsComponent } from './job-allocations/job-allocations.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DoctorGroupsComponent } from './doctor-groups/doctor-groups.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeavesComponent } from './leaves/leaves.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { LeavesReviewComponent } from './leaves-review/leaves-review.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { ClientLicensesComponent } from './client-licenses/client-licenses.component';
import { ClientLicenseComponent } from './client-license/client-license.component';


import { MasterService } from './app.service';

@NgModule({
  declarations: [
    AppComponent, routingComponents,
    ClientsComponent, ClientEmployeeComponent, ClientEmployeesComponent, ClientsComponent,
    DefaultAllocationComponent, DefaultAllocationsComponent, DoctorComponent, DoctorsComponent,
    DocumentsComponent, EditEmployeeComponent, EmployeeComponent, EmployeesComponent,
    EmployeeDashboardComponent, HomeComponent, LoginComponent, NewEmployeeComponent, PayscaleComponent,
    JobsComponent, LogoutComponent, JobAllocationsComponent, ForgotPasswordComponent, ResetPasswordComponent,
    ChangePasswordComponent, DoctorGroupsComponent, DoctorDashboardComponent, ClientDashboardComponent,
    DashboardComponent, LeavesComponent, ManagerDashboardComponent, LeavesReviewComponent, PatientListComponent,
    ClientLicensesComponent, ClientLicenseComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    TypeaheadModule,
    FileUploadModule,
    SimpleNotificationsModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [HttpClient, ComponentLoaderFactory, PositioningService],
  bootstrap: [AppComponent]
})
export class AppModule { }
