import {Injectable, EventEmitter} from '@angular/core';
import {AccountService} from "../../account/services/account-service";
import {AuthService} from "../../auth/services/auth-service";
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database"
import {IAccountContact, AccountContact} from "../../account/components/contact/contact-model";

@Injectable()
export class AccountContactService {

    public contact$: FirebaseObjectObservable<IAccountContact> = new FirebaseObjectObservable();
    public set:boolean = false;
    public contactEmitter:EventEmitter<any> = new EventEmitter();

    constructor(private auth: AuthService, private af: AngularFireDatabase) {
        if(this.auth.authSet){
            console.log(this.auth.id);
            this.contact$ = this.af.object(`/contact/${this.auth.id}`);
            this.contactEmitter.emit(this.contact$);
        }
        else{
            this.auth.authObservable.subscribe(()=>{
                if(this.auth.authSet){
                    this.contact$ = this.af.object(`/contact/${this.auth.id}`);
                    this.contactEmitter.emit(this.contact$);
                }
            });
        }
    }

    getContactRef(id:string):FirebaseObjectObservable<any>{
        return this.af.object(`/contact/${id}`)
    }

}
