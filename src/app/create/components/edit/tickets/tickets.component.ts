import {Component, AfterContentInit, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, NavigationEnd, RoutesRecognized, ActivatedRoute, Params} from '@angular/router';
import {AppService} from "../../../../services/app-service";
import {AuthService} from "../../../../auth/services/auth-service";
import {CreateEventService} from "../../../services/create-event.service";
import {CreateTicketsService} from "../../../services/create-tickets.service";
import {ITicket} from "../../../models/tickets.models";

@Component({
    selector: 'event-tickets',

    template: `

        <table class="table table-striped" style="margin-top:15px;" *ngIf="ticketLength"> 
            <thead>
                <tr>
                    <td> 
                        <div class="row"> 
                            <div class="col-sm-7"> 
                                Ticket Title
                            </div>
                            <div class="col-sm-2"> 
                                Quantity
                            </div>
                            <div class="col-sm-2"> 
                                Price
                            </div>                            
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody> 
                <tr *ngFor="let ticket of tickets" event-ticket [ticketKey]="ticket.$key" (updateTicket)="updatesTicket($event)" (deleteTicket)="updateDelete($event)"></tr> 
            </tbody>
        </table>
        
        <div style="margin-top:25px;">
            
            <button (click)="addTicket('free')" class="btn btn-primary" style="margin-right:15px;">
                Add Free Ticket <i class="fa fa-plus-square-o"></i>    
            </button>
            
            <button (click)="addTicket('paid')" class="btn btn-primary">
                Add Paid Ticket <i class="fa fa-plus-square-o"></i>    
            </button>
            <p *ngIf="!haveTicket" class="validation-error-text">Tickets are required.</p>
            
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

export class EditTicketsComponent implements OnInit{

    tickets:ITicket[];
    ticketLength:number = 0;
    haveTicket = false;
    @Output() ticketUpdated = new EventEmitter();
    @Output() deleteTicket = new EventEmitter();
    constructor(private auth: AuthService,
                private appService: AppService,
                private router: Router,
                private route: ActivatedRoute,
                private createService:CreateEventService,
                public createTicketService:CreateTicketsService
    ) {

    }

    ngOnInit(){
        this.createTicketService.ticketList$.subscribe((data)=>{
            this.ticketLength = data.length;
            this.tickets = data;
        });
        this.createService.haveTickets.subscribe(data => {
            this.haveTicket = data;
            console.log(data);
        });
        this.createService.saveChanges.subscribe(
            data => {
                if(!data){
                    this.createTicketService.ticketList$.subscribe((data)=>{
                        this.ticketLength = data.length;
                        this.tickets = data;
                    });
                }
            }
        )
    }

    addTicket(ticketType){
        this.createService.updateHaveTickets(true);
        this.createTicketService.addTicket(ticketType);
        this.createService.showSavedDraft();
        this.getTickets();
    }

    updatesTicket(event){
        this.createService.updateHaveTickets(true);
        this.ticketUpdated.emit(event);
    }

    updateDelete(event){
        this.deleteTicket.emit(event);
        let i = 0;
        let index;
        while(this.tickets[i]){
            if(this.tickets[i].$key === event){
                index = i;
            }
            i++;
        }

        this.tickets.splice(index, 1);
    }

    getTickets(){
        this.createService.haveTickets.subscribe(
            data => {
                this.haveTicket = data;
                console.log(data);       
            }
        )
    }

}