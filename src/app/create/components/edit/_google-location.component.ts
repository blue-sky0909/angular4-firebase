import { Component, AfterContentInit, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized, ActivatedRoute, Params} from '@angular/router';
import {AppService} from "../../../services/app-service";
import {AuthService} from "../../../auth/services/auth-service";
import {CreateEventService} from "../../services/create-event.service";
import {IGPS} from "../../../shared-models/gps";
import {EventMapComponent} from "./modal/event-map.component";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FieldValidation} from "../../../../assets/common/validation/field-validation";

@Component({
    selector: 'google-location',

    template: `
        <div *ngIf="type === 'local'">
            <div>
                <label>
                   Location
                </label>
            </div>
            <div>
                <input type="test" [(ngModel)]="location" name="type" class="form-control" placeholder="4920 Oak Street, Highland, UT 84003" (blur)="setGeoCode()"/>
                <div class="lookup-location-wrapper">
                    <!--<i class="fa fa-map-marker"></i>
                     <a href="javascript:null">lookup location</a> -->
                     <i class="fa fa-map"></i>
                    <a href="javascript:null" (click)="openMap()" *ngIf="gps"> See on map</a>
                </div>
                <div *ngIf="!createService.isFieldValid('local-location')" class="validation-error-text">{{createService.fieldValidations.get("local-location").errorMessage}}</div>

            </div>
        </div>
        <div *ngIf="type === 'online'">
            <label>URL of event</label>
            <input class="form-control" placeholder="http://www.example.com/event" [(ngModel)]="location" (blur)="saveURL()" />
            <div *ngIf="!createService.isFieldValid('online-location')" class="validation-error-text">{{createService.fieldValidations.get("online-location").errorMessage}}</div>

        </div>

    `,
    styles: [
        `
            :host{
                display:block;
            }

            .lookup-location-wrapper{
                position:relative;
                top:-7px;
            }
        `
    ],

})

export class GoogleLocationComponent implements OnInit{

    type:string;
    location:string;
    @Output() updatedLocation = new EventEmitter();
    gps:IGPS;

    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                private modalService: NgbModal,
                public activeModal: NgbActiveModal,
                public createService: CreateEventService) {

    }

    ngOnInit(){
        this.location = this.createService.draft.location;
        this.gps = this.createService.draft.gps;
        this.type = this.createService.draft.type;

        this.createService.saveChanges.subscribe(
            data => {
                if(!data){
                    this.location = this.createService.draft.location;
                    this.gps = this.createService.draft.gps;
                    this.type = this.createService.draft.type;
                }
            }
        )

        // this.createService.draftUpdated.subscribe(()=>{
        //     this.type = this.createService.draft.type;


            // if(this.type==='local')
            //   {
            //     if(FieldValidation.isEmptyText(this.location)){
            //       this.createService.initValidationField("local-location");
            //       this.createService.setErrorInField("local-location","Address can\'t be empty for the local event");
            //     }

            //   }else if(this.type==='online')
            //   {
            //     if(FieldValidation.isEmptyText(this.location)){
            //       this.createService.initValidationField("online-location");
            //       this.createService.setErrorInField("online-location","URL can't be empty for the online event");
            //     }

            //   }

        // });
        console.log(this.location);
        //this.createService.validateLive();
        this.createService.locationType.subscribe(data => {
            this.type = data;
            this.location = '';
        })
    }

    setGeoCode(){

      //this.createService.initValidationField('local-location');
      if(!FieldValidation.isEmptyText(this.location)){
        this.createService.initValidationField("local-location");

        this.createService.getGeoCode(this.location).subscribe((data)=>{
          let response = JSON.parse(data._body);
          if(response.results.length >= 1){
              let result = response.results[0];
              this.location = result.formatted_address;
              this.gps = result.geometry.location;
              this.updatedLocation.emit({location: this.location, gps: this.gps});
            //   this.createService.draftObject$.update({location:this.location, gps:this.gps}).then(()=>{
            //       console.log('geo code saved');
            //       this.createService.showSavedDraft();
            //       if(this.createService.validateLive()){
            //         if(this.createService.isLive()){
            //             this.createService.publish();
            //         }
            //     }
            //   });
          }
          else{
              //TODO DO SOMETHING IF THERE ARE MULTIPLE MATCHES
              this.updatedLocation.emit({location: this.location, gps: this.gps});
          }
        });
      }else{
        // this.createService.draftObject$.update({location:this.location}).then(()=>{
        // //for validation purpose  updating empty string.
        // });
        this.updatedLocation.emit({location: this.location, gps: this.gps});
        this.createService.setErrorInField("local-location","Address can\'t be empty for the local event");
      }
    }

    saveURL(){
      //this.createService.initValidationField('online-location');
      if(!FieldValidation.isEmptyText(this.location)){
        this.createService.initValidationField("online-location");
        // this.createService.showSavedDraft();
        this.updatedLocation.emit({location: this.location});
        // if(this.createService.isLive())
        // {
        //   this.createService.publish();
        // }else
        // {
        //   this.createService.draftObject$.update({location:this.location}).then(()=>{
        //       this.createService.showSavedDraft();
        //   });
        // }
        }else{
        //   this.createService.draftObject$.update({location:this.location}).then(()=>{
        //     //for validation purpose  updating empty string.
        //     });
        this.createService.setErrorInField("online-location","URL can't be empty for the online event");
        }
    }


    openMap(){
        this.activeModal.dismiss();
        this.modalService.open(EventMapComponent);
    }

}
