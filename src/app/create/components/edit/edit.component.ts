import { getSaveChangesComponent } from './modal/saveChanges-modal.component';

import { ToastyService } from 'ng2-toasty/index';
import { CreateTicketsService } from './../../services/create-tickets.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { OEvent, IoEvent } from './../../../shared-models/oevent';
import {Component, AfterContentInit, OnInit} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized, ActivatedRoute, Params} from '@angular/router';
import {AppService} from "../../../services/app-service";
import {AuthService} from "../../../auth/services/auth-service";
import {CreateEventService} from "../../services/create-event.service";
import {CreateEventDateService} from "../../services/create-date.service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
    templateUrl: './edit.component.html',
    styles: [
        `

        `
    ],

})

export class EditComponent implements OnInit{

    draft = new IoEvent();
    dateValues;
    tickets = [];
    ticketDelete = [];
    published = false;
    changesOnPublish = false;
    masterData;
    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                private createService: CreateEventService,
                private dateService: CreateEventDateService,
                private ticketService: CreateTicketsService,
                private toasty: ToastyService,
                private modalService: NgbModal,
                public activeModal: NgbActiveModal,
            ) {

    }

    ngOnInit(){
        this.createService.setEventId(this.createService.eventId).then(data => {
            this.draft = this.createService.draft;
            console.log(this.draft);
        });

        this.dateService.dateObject$.subscribe(
            data => {
                this.dateValues = data;
            }
        )

        this.ticketService.ticketList$.subscribe(
            data => {
                this.tickets = [];
                let i = 0;
                while(data[i]){
                    let ticket = {};
                    ticket['key'] = data[i].$key;
                    ticket['value'] = data[i];
                    this.tickets.push(ticket);
                    i++;
                }
                console.log(this.tickets);
            }
        )
        
        this.createService.draftObject$.subscribe(data =>{
            this.draft = data;
            this.masterData = data;
            if(this.draft.status == 'active'){
                this.published = true;
            } else{
                this.published = false;
                this.changesOnPublish = false;
            }
        });

        this.createService.saveChanges.subscribe(
            data => {
                if(this.changesOnPublish){
                    console.log(data);
                    if(data){
                        this.saveDraft();
                        this.createService.publish(false);
                        this.createService.updateSaveChanges(false);
                        console.log('draft is saved');
                    } else if(!data){
                        this.createService.publish(false);
                        this.draft = this.masterData;
                        console.log(this.masterData);
                        console.log(this.draft);
                    }
                }
            }
        )
        
    }

    updateTitle(event){
        if(this.draft.status != 'active'){
            this.draft.status = 'draft';
        }
        this.draft.title = event;
        this.changeOnPublished();
        this.createService.valid = true;
    }

    updateDate(event){
        this.dateValues = event.value;
        this.draft.date = event.date.dateString;
        this.draft.time = event.date.timeString;
        this.draft.dateType = event.value.eventType;
        this.draft.startDate = event.date.startDate;
        this.draft.endDate = event.date.endDate;
        this.changeOnPublished();
    }

    updateType(event){
        this.draft.type = event;
        this.changeOnPublished();
    }

    updateLocation(event){
        this.draft.location = event.location;
        if(event.gps){
            this.draft.gps = event.gps;
        }
        console.log(this.draft.location);
        this.changeOnPublished();
        this.createService.valid = true;
    }

    updateCategory(event){
        this.draft.category = event;
        this.changeOnPublished();
        this.createService.valid = true;
    }

    updateKeyword(event){
        this.draft.keywords = event;
        this.changeOnPublished();
    }

    updateVisible(event){
        this.draft.visibility = event;
        this.changeOnPublished();
    }

    updateRemainTicket(event){
        this.draft.showRemainingTickets = event;
        this.changeOnPublished();
    }

    updateAttendie(event){
        this.draft.showRegisteredAttendees = event;
        this.changeOnPublished();
    }

    updateDescription(event){
        this.draft.description = event.description;
        this.draft.descriptionText = event.descriptionText;
        this.changeOnPublished();
    }

    updateTicket(event){
        let index;
        let match = false;
        let i = 0;
        while(this.tickets[i]){
            if(this.tickets[i].key === event.key){
                match = true;
                index = i;
            }
            i++;
        }

        if(match){
            console.log(index);
            this.tickets.splice(index, 1);
            console.log(this.tickets);
        }
        this.tickets.push(event); 
        console.log(this.tickets);
        this.changeOnPublished();
        this.createService.valid = true;
    }

    updateImage(event){
        this.draft.imagePath = event;
        this.changeOnPublished();
        if(this.draft.status == 'blank'){
            this.draft.status = 'draft';
        }
        console.log(this.draft);
    }

    updateDeleteTickets(event){
        this.ticketDelete.push(event);
        let i = 0;
        let index;
        while(this.tickets[i]){
            if(this.tickets[i].key === event){
                index = i;
            }
            i++;
        }
        this.tickets.splice(index, 1);
        this.changeOnPublished();
    }

    initialDate(event){
        console.log('initial data');
        if(event){
            this.changesOnPublish = false;
        }
    }

    saveDraft(event?){
        console.log(this.draft);
        if(this.draft.status == 'draft' || this.draft.status == 'active'){
            console.log(this.dateValues);
            this.createService.draftObject$.update(this.draft).then((data) => {
                this.dateService.dateObject$.update(this.dateValues);
            });
            if(this.ticketDelete.length > 0){
                let i = 0;
                while(this.ticketDelete[i]){
                    this.ticketService.removeTicket(this.ticketDelete[i]);
                    i++;
                }
                this.ticketDelete = [];
            }
            if(this.tickets.length > 0){
                console.log('value update ho gai');
                let ticketRef$;
                for(let i = 0; i < this.tickets.length; i++){
                    ticketRef$ = this.ticketService.getTicketObject(this.tickets[i].key);
                    ticketRef$.update(this.tickets[i].value);
                }
            }
        }
    }

    publish(event){
        
        if(event){
            this.saveDraft(event);
            this.createService.liveEventValue = false;
            this.published = true;
            if(this.createService.validateLive()){
                this.createService.publish();
            } else{
                this.toasty.error("Error validating");
            }
        } else{
            if(this.changesOnPublish){
                this.modalService.open(getSaveChangesComponent);
            } else{
                this.createService.publish(event);
            }
            // this.createService.publish(event);
        }
    }

    updateLiveEvent(){
        this.saveDraft();
        this.published = false;
        this.changesOnPublish = false;
        this.createService.liveEventValue = true;
        if(this.createService.validateLive()){
            this.createService.publish();
            console.log('update ho jana chahye live event');
        } else{
            this.toasty.error("Error validating");
            this.createService.publish(false);
        }
    }

    changeOnPublished(){
        if(this.published){
            this.changesOnPublish = true;
            console.log(this.changesOnPublish);
        }
    }
}
