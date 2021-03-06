import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../auth/services/auth-service';
import {EventService} from '../../../shared-module/services/event-service';
import {IoEvent} from '../../../shared-models/oevent';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ChangeStatusModalComponent} from './change-status.component';
declare var Quill: any;

@Component({
    selector: 'my-event-details',
    template: `
        <div *ngIf="eventService.event">
            <h3 class="line" style="margin-bottom:0px;">
                {{ eventService.event.title }}
            </h3>

            <p>

                <a routerLink="/create/{{ eventService.eventId }}">
                    <i class="fa fa-pencil"></i> <span style="font-size: 15px"> Edit event</span>
                </a>
                <br />
                <a routerLink="/event/{{ eventService.eventId }}" target="_blank">
                    <i class="fa fa-eye"></i> <span style="font-size: 15px"> View landing page</span>
                </a>
            </p>

            <div class="row row-vertical" style="padding-top:2rem;">
                <div class="col-md-3">
                    <p><strong>Status:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        <span [ngClass]="eventService.event.liveStatus">
                            {{ eventService.event.liveStatus }}
                        </span>
                         <a (click)="changeStatus()">change</a>
                    </p>
                </div>
            </div>

            <div class="row row-vertical">
                <div class="col-md-3">
                    <p><strong>Schedule:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ eventService.event.date }} | {{ eventService.event.time }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical" *ngIf="eventService.event.type == 'local'">
                <div class="col-md-3">
                    <p><strong>Location:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ eventService.event.location }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical" *ngIf="eventService.event.type == 'online'">
                <div class="col-md-3">
                    <p><strong>URL:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ eventService.event.location }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical">
                <div class="col-md-3">
                    <p><strong>Description:</strong></p>
                </div>
                <div class="col-md-9" style="padding-top:7px;padding-bottom:15px;">

                    <div class="c-desc" >
                        <div id="toolbar"></div>
                        <div id="description" style="padding:30 0px;" ></div>
                    </div>

                </div>
            </div>

            <div class="row row-vertical">
                <div class="col-md-3">
                    <p><strong>Category:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ eventService.event.category }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical">
                <div class="col-md-3">
                    <p><strong>Visibility:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ eventService.event.visibility }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical">
                <div class="col-md-3">
                    <p><strong>Keywords:</strong></p>
                </div>
                <div class="col-md-9">
                    <p>
                        {{ keywordString }}
                    </p>
                </div>
            </div>

            <div class="row row-vertical" style="padding-top:1rem;">
                <div class="col-md-3">
                    <p><strong>Registration Types:</strong></p>
                </div>
                <div class="col-md-9">
                    <table class="register-table">
                        <tbody>
                            <tr *ngFor="let ticket of eventService.eventTickets$ | async">
                                <td>
                                    {{ ticket.ticketTitle }}
                                </td>
                                <td>
                                    {{ ticket.ticketType }}
                                </td>
                                <td>
                                    {{ ticket.ticketsUsed }}/{{ ticket.ticketQuantity }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

    `,
    styles: [
        `
            .register-table tr td{
                padding-right:2rem;
            }

            .register-table tr td:last-child{
                padding-right:0;
            }

            .row.row-vertical{
                padding-bottom:1rem;
            }


        `
    ],
    providers: [NgbActiveModal]

})

export class MyEventDetailsComponent implements OnInit, AfterViewInit {

    @Input() event: IoEvent;
    description: any;
    keywordString = '';
    keywordsBuilt = false;

    // TRACK IF DATA HAS BEEN LOADED FROM FIREBASE
    set = false;

    constructor(private auth: AuthService,
                private router: Router,
                private route: ActivatedRoute,
                public eventService: EventService,
                private activeModal: NgbActiveModal,
                private modalService: NgbModal) {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        // USING SET INTERVAL UNTIL THE DATA IS SET SINCE THE PROPER CONTAINER IS NOT LOADED UNTIL SET IT SET
        const doCheck = setInterval(() => {

            if (this.eventService.set) {

                if (!this.keywordsBuilt) {
                    this.buildKeywordString();
                }

                // ALLOW TIME FOR ANG2 TO REACT
                setTimeout(() => {

                    // INSTANTIATE BASED ON ID
                    this.description = new Quill('#description', {
                        readOnly: true
                    });

                    this.description.setContents(this.eventService.event.description);

                    clearInterval(doCheck);

                }, 150);
            }
        }, 100);
    }

    openPromoter() {

    }

    buildKeywordString() {
        const keywords: string[] = this.eventService.event.keywords;
        if (keywords) {
            let keywordString = '';

            for (let i = 0; i < keywords.length; i++) {
                keywordString += keywords[i];
                if ((i + 1) < keywords.length) {
                    keywordString += ', ';
                }
            }
            this.keywordString = keywordString;
            this.keywordsBuilt = true;
        }
    }

    changeStatus() {
        this.activeModal.dismiss();
        const changeStatus = this.modalService.open(ChangeStatusModalComponent);
        changeStatus.componentInstance.name = 'Change';
    }
}
