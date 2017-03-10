import { Component, OnInit } from '@angular/core';
import { DoctorGroupsService } from './doctor-groups.service';
import { MasterService } from '../app.service';

@Component({
  selector: 'app-doctor-groups',
  templateUrl: './doctor-groups.component.html',
  styleUrls: ['./doctor-groups.component.scss'],
  providers: [DoctorGroupsService]
})
export class DoctorGroupsComponent implements OnInit {

  error: string;
  ViewDoctorGroupModal: boolean;
  AddDoctorGroupModal: boolean;
  DoctorGroups: Array<DoctorGroup> = new Array<DoctorGroup>();
  DoctorGroupEmployees: Array<string> = new Array<string>();
  DoctorGroupDoctors: Array<string> = new Array<string>();
  SelectedGroup: DoctorGroup = new DoctorGroup();


  constructor(private doctorGroupsService: DoctorGroupsService, private masterService: MasterService) {
    this.error = "";
    this.ViewDoctorGroupModal = false;
    this.AddDoctorGroupModal = false;
  }

  ngOnInit() {
    this.masterService.changeLoading(true);
    this.doctorGroupsService.getDoctorGroups().then(
      (data) => {
        this.DoctorGroups = data;
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Doctor Groups";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  viewDoctorGroup(doctorGroup: DoctorGroup) {
    this.masterService.changeLoading(true);
    this.SelectedGroup = doctorGroup;
    this.ViewDoctorGroupModal = true;
    this.DoctorGroupEmployees = new Array<string>();
    this.DoctorGroupDoctors = new Array<string>();

    this.doctorGroupsService.getDoctorGroup(doctorGroup.Id).then(
      (data) => {
        this.DoctorGroupEmployees = data['employees'];
        this.DoctorGroupDoctors = data["doctors"];
        this.masterService.changeLoading(false);
      },
      (error) => {
        this.error = "Error fetching Doctor Group Details";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

  newDoctorGroup() {
    this.masterService.postAlert("remove", "");
    this.AddDoctorGroupModal = true;
    this.SelectedGroup = new DoctorGroup();
  }

  addDoctorGroup() {
    this.masterService.changeLoading(true);
    this.masterService.postAlert("remove", "");

   if( this.DoctorGroups.findIndex((item)=>item.Name.toLowerCase()==this.SelectedGroup.Name.toLowerCase())>-1){
        this.error = "Doctor Group with this name already exists!";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
        return;
   }

    this.doctorGroupsService.addDoctorGroup(this.SelectedGroup.Name).then(
      (data) => {
        this.DoctorGroups.push(data);
        this.masterService.changeLoading(false);
        this.masterService.postAlert("success", "Doctor group added successfully");
        this.AddDoctorGroupModal = false;
      },
      (error) => {
        this.error = "Error adding Doctor Group Details";
        this.masterService.changeLoading(false);
        this.masterService.postAlert("error", this.error);
      }
    )
  }

}

class DoctorGroup {
  Id: number;
  Name: string;
}

