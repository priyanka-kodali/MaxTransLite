import { NgModule } from '@angular/core';  
import { Routes, RouterModule } from '@angular/router';  
import { LoginComponent } from './login/login.component'; 
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'; 
import { ResetPasswordComponent } from './reset-password/reset-password.component'; 
import { ChangePasswordComponent } from './change-password/change-password.component'; 
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { newEmployeeRoutes} from './new-employee/new-employee.routes';
import { EmployeesComponent} from './employees/employees.component';
import { editEmployeeRoutes } from './edit-employee/edit-employee.routes';
import { DoctorComponent } from './doctor/doctor.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { ClientComponent } from './client/client.component';
import { ClientsComponent } from './clients/clients.component';
import { DefaultAllocationComponent } from './default-allocation/default-allocation.component';
import { DefaultAllocationsComponent } from './default-allocations/default-allocations.component';
import { ClientEmployeeComponent } from './client-employee/client-employee.component';
import { ClientEmployeesComponent } from './client-employees/client-employees.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { JobsComponent } from './jobs/jobs.component';
import { JobAllocationsComponent } from './job-allocations/job-allocations.component';
import { DoctorGroupsComponent } from './doctor-groups/doctor-groups.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { LeavesComponent } from './leaves/leaves.component';
import { LeavesReviewComponent } from './leaves-review/leaves-review.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { ClientLicenseComponent } from './client-license/client-license.component';
import { ClientLicensesComponent } from './client-licenses/client-licenses.component';


export const routes: Routes=[
  ...newEmployeeRoutes,
  ...editEmployeeRoutes,
  { path: '', component: LogoutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:key', component: ResetPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },

  { path: 'home', component: HomeComponent },
  { path: 'employees', component: EmployeesComponent },  
  { path: 'leaves',component:LeavesComponent},
  { path: 'leaves-review',component:LeavesReviewComponent},
  { path: 'dashboard', component: DashboardComponent },

  { path: 'new-doctor', component: DoctorComponent },  
  { path: 'doctor/:DocId', component: DoctorComponent },  
  { path: 'doctors', component: DoctorsComponent },  
  { path: 'doctors/:CliId', component: DoctorsComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },  
  { path: 'patient-list', component: PatientListComponent },  

  { path: 'new-client', component: ClientComponent },  
  { path: 'client/:ClientId', component: ClientComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'client-license/:ClientId', component: ClientLicenseComponent },
  { path: 'client-licenses/:ClientId', component: ClientLicensesComponent },

  { path: 'new-default-allocation', component: DefaultAllocationComponent },
  { path: 'default-allocation/:DAId', component: DefaultAllocationComponent },
  { path: 'default-allocations', component: DefaultAllocationsComponent },

  { path: 'new-client-employee', component: ClientEmployeeComponent },
  { path: 'client-employee/:CliEmpId', component: ClientEmployeeComponent },
  { path: 'client-employees', component: ClientEmployeesComponent },
  { path: 'client-employees/:CliId', component: ClientEmployeesComponent },

  {path:'employee-dashboard',component:EmployeeDashboardComponent},
  {path:'manager-dashboard',component:ManagerDashboardComponent},
  {path:'jobs',component:JobsComponent},
  {path:'job-allocations',component:JobAllocationsComponent},
  
  {path:'doctor-groups',component:DoctorGroupsComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule { }

export const routingComponents = [EmployeesComponent,HomeComponent,
                                  DoctorComponent,DoctorsComponent,ClientComponent,ClientsComponent,
                                  DefaultAllocationComponent,DefaultAllocationsComponent,ClientEmployeeComponent,
                                  ClientEmployeesComponent,EmployeeDashboardComponent];  

