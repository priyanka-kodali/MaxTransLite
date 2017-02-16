import { Routes } from '@angular/router';
import { NewEmployeeComponent} from './new-employee.component';
import { EmployeeComponent} from '../employee/employee.component';
import { DocumentsComponent} from '../documents/documents.component';
import { PayscaleComponent} from '../payscale/payscale.component';

export const newEmployeeRoutes: Routes=[    
  { path: 'new-employee', component: NewEmployeeComponent,
    children:[
        { path: 'general', component: EmployeeComponent },
        { path: 'documents/:EmpId', component: DocumentsComponent },
        { path: 'payscale/:EmpId', component: PayscaleComponent }
        ]
 }
];

