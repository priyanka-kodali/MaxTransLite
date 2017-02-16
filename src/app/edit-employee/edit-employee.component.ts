import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  moduleId: module.id,
  selector: 'app-edit-employee',
  templateUrl: 'edit-employee.component.html',
  styleUrls: ['edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {

  private sub: any;
  EmpId: number;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.sub =  this.sub = this.activatedRoute.children[0].params.subscribe(
      params => this.EmpId = +params['EmpId']  
    );
    }

  edit(location: string) {

    this.router.navigate(["edit-employee",location,this.EmpId]);    
  }

}
