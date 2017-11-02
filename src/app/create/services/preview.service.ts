import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {AuthService} from "../../auth/services/auth-service";

@Injectable()
export class PreviewService{

    eventId:string;

    constructor(private af: AngularFireDatabase,
                private auth: AuthService
    ) {

    }

    setEventId(id){
        this.eventId = id;
    }

}
