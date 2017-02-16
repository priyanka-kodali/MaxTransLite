import { Component, OnInit } from '@angular/core';
import { DoctorGroupsService } from './doctor-groups.service';

@Component({
  selector: 'app-doctor-groups',
  templateUrl: './doctor-groups.component.html',
  styleUrls: ['./doctor-groups.component.scss'],
  providers: [DoctorGroupsService]
})
export class DoctorGroupsComponent implements OnInit {

  UpdateSuccess: boolean;
  UpdateFail: boolean;
  Error: string;
  ModalError: string;
  ViewDoctorGroupModal: boolean;
  AddDoctorGroupModal: boolean;
  UpdateProgress: boolean;
  DoctorGroups: Array<DoctorGroup> = new Array<DoctorGroup>();
  DoctorGroupEmployees: Array<string> = new Array<string>();
  DoctorGroupDoctors: Array<string> = new Array<string>();
  SelectedGroup: DoctorGroup = new DoctorGroup();


  constructor(private doctorGroupsService: DoctorGroupsService) {
    this.UpdateSuccess = false;
    this.UpdateFail = false;
    this.UpdateProgress = false;
    this.Error = "";
    this.ModalError = "";
    this.ViewDoctorGroupModal = false;
    this.AddDoctorGroupModal = false;
  }

  ngOnInit() {
    this.doctorGroupsService.getDoctorGroups().subscribe(
      (data) => this.DoctorGroups = data,
      (error) => this.Error = "Error fetching Doctor Groups"
    )
  }

  viewDoctorGroup(doctorGroup: DoctorGroup) {
    this.Error = "";
    this.UpdateProgress = true;
    this.SelectedGroup = doctorGroup;
    this.ViewDoctorGroupModal = true;
    this.DoctorGroupEmployees = new Array<string>();
    this.DoctorGroupDoctors = new Array<string>();

    this.doctorGroupsService.getDoctorGroup(doctorGroup.Id).subscribe(
      (data) => {
        this.DoctorGroupEmployees = data['employees'];
        this.DoctorGroupDoctors = data["doctors"];
        this.UpdateProgress = false;
      },
      (error) => {
      this.ModalError = "Error fetching Doctor Group Details";
        this.UpdateProgress = false;
      }
    )
  }

  newDoctorGroup() {
    this.UpdateSuccess = false;
    this.UpdateFail = false;
    this.AddDoctorGroupModal = true;
    this.SelectedGroup = new DoctorGroup();
  }

  addDoctorGroup() {
    this.UpdateSuccess = false;
    this.UpdateFail = false;
    this.doctorGroupsService.addDoctorGroup(this.SelectedGroup.Name).subscribe(
      (success) => this.UpdateSuccess = true,
      (error) => this.UpdateFail = true
    )
  }

}

class DoctorGroup {
  Id: number;
  Name: string;
}

