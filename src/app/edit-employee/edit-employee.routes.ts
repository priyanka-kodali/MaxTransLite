import {Routes } from '@angular/router';
import { EditEmployeeComponent} from './edit-employee.component';
import { EmployeeComponent} from '../employee/employee.component';
import { DocumentsComponent} from '../documents/documents.component';
import { PayscaleComponent} from '../payscale/payscale.component';

export const editEmployeeRoutes: Routes=[    
  { path: 'edit-employee', component: EditEmployeeComponent,
    children:[
        { path: 'general/:EmpId', component: EmployeeComponent },
        { path: 'documents/:EmpId', component: DocumentsComponent },
        { path: 'payscale/:EmpId', component: PayscaleComponent }
        ]
 }
];

