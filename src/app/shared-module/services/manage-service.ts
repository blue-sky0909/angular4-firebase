import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { IManage, Manage } from '../../manage/manage-model';
import {IoEvent} from "../../shared-models/oevent";
import {Observable} from "rxjs";
import {CreateAdvancedService} from "../../create/components/advanced/services/advanced.service";
import {AuthService} from "../../auth/services/auth-service";

@Injectable()
export class ManageService {

    eventsList$: FirebaseListObservable<IoEvent[]>;
    promotersList$: FirebaseListObservable<any>;

    constructor(public af: AngularFireDatabase,
                public auth: AuthService,
                public advancedService: CreateAdvancedService) {

    }

    getEvents(type:string): FirebaseListObservable<any>{
        
        if(type == 'history'){
            this.eventsList$ = this.af.list(`/drafts/draft/${this.auth.id}/`, {
                query: {
                    orderByChild: 'status',
                    equalTo: type
                }
            });
        } else if(type !== ''){
            this.eventsList$ = this.af.list(`/drafts/draft/${this.auth.id}/`, {
                query: {
                    orderByChild: 'status',
                    equalTo: type
                }
            });
        }
        else{
            this.eventsList$ = this.af.list(`/drafts/draft/${this.auth.id}/`)
        }

        return this.eventsList$;
    }

    getPromoters(eventId:string):FirebaseListObservable<any>{
        return this.af.list(`/promoters/events/${eventId}`);
    }

}
