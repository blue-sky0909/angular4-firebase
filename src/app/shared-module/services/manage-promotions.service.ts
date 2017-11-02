import { Injectable, EventEmitter } from '@angular/core';
import {AppService} from "../../services/app-service";
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database"
import {ManageService} from "./manage-service";
import {AuthService} from "../../auth/services/auth-service";

@Injectable()
export class ManagePromotionsService {

    myPromotions$:FirebaseListObservable<any>;
    history$:FirebaseListObservable<any>;

    constructor(private af:AngularFireDatabase,
                private auth:AuthService, private manageService: ManageService){
        this.myPromotions$ = this.af.list(`/promoters/users/${this.auth.id}`, {
            //TODO SEPARATE OUT HISTORIC EVENTS WHEN PAGE LOADS
        });
    }

    getUserPromotions(id:string):FirebaseListObservable<any>{
         return this.af.list(`/promoters/users/${id}`);
    }

    getHistory(type:String){
        this.history$ = this.af.list(`/promoters/users/${this.auth.id}/`, {
            query: {
                orderByChild: 'status',
                equalTo: type
            }
        });
        return this.history$;
    }
}
