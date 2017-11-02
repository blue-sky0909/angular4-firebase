import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../../auth/services/auth-service';
import {EventService} from '../../../shared-module/services/event-service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateAdvancedService} from '../../../create/components/advanced/services/advanced.service';
declare var Quill: any;

@Component({
    templateUrl: './my-event.html',
    styleUrls: [
        './my-event.scss'
    ],
    providers: [NgbActiveModal]

})

export class MyEventComponent implements OnInit{

    id: string;
    description: any;
    view = 'detail';
    // check if current use is a promoter
    promoter = false;

    // TRACK IF DATA HAS BEEN LOADED FROM FIREBASE
    set = false;

    promoters$: any;

    constructor(private auth: AuthService,
                private router: Router,
                private route: ActivatedRoute,
                public eventService: EventService,
                private modalService: NgbModal,
                public activeModal: NgbActiveModal,
                public createAdvancedService: CreateAdvancedService) {
        this.promoters$ = this.eventService.getPromoters;
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // GET ID PARAM AND SET THE SESSION DATA
    // -----------------------------------------------------------------------------------------------------------------------
    ngOnInit(): void{
        this.route.params.forEach((params: Params) => {

            this.route.params.forEach((params: Params) => {
                if (!params['id']){

                }
                else{
                    this.id = params['id'];
                    this.createAdvancedService.setEventId(this.id);
                    this.eventService.setEvent(params['id']).then(() => {
                        this.set = true;
                    });
                }
            });

        });
    }






}
