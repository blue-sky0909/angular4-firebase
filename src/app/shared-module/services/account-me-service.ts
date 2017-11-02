import {Injectable, EventEmitter} from '@angular/core';
import {AccountService} from "../../account/services/account-service";
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database"
import {IAccountAbout} from "../../account/components/about/about-model";
import {AuthService} from "../../auth/services/auth-service";
import {IAccountContact} from "../../account/components/contact/contact-model";
import {AccountContactService} from "./account-contact-service";
import {AppService} from "../../services/app-service";
import {ToastyService} from "ng2-toasty";
import {Observable} from "rxjs";

@Injectable()
export class AccountMeService {

    public about$: FirebaseObjectObservable<IAccountAbout>;
    public aboutEmitter:EventEmitter<FirebaseObjectObservable<IAccountAbout>> = new EventEmitter();

    constructor(private auth: AuthService, private af: AngularFireDatabase, private contactService: AccountContactService, private appService: AppService, private toasty: ToastyService) {


        if(this.auth.authenticated){
            this.about$ = this.af.object(`/about/${this.auth.id}`);
            this.aboutEmitter.emit(this.about$);
        }
        else{
            this.auth.authObservable.first().subscribe(()=>{
                this.about$ = this.af.object(`/about/${this.auth.id}`);
                this.aboutEmitter.emit(this.about$);
            });
        }

    }

    updateAbout(values:IAccountAbout){

        this.contactService.contact$.first().subscribe((data:IAccountContact)=>{

            console.log(data);

            if(values.includeEmail){
                values.email = data.email;
            }
            else{
                values.email = "";
            }

            if(values.includePhone){
                values.phone = data.phone;
            }
            else{
                values.phone = "";
            }

            //TODO WHEN SOCIALS ARE ADDED (PROLLY A DIFFERENT SUBSCRIPTION/SERVICE)
            //if(values.includeSocials){}

            this.runUpdate(values);

        });


    }

    runUpdate(values:IAccountAbout){
        try {

            this.appService.startLoadingBar();
            this.about$.update(values).then(()=>{
                let toast = {
                    title: "Success",
                    msg: "Your contact information has saved successfully!"
                };

                this.appService.completeLoadingBar();
                this.toasty.success(toast);
            }, (err)=>{

                let toast = {
                    title: "Failed",
                    msg: `Your contact information was not saved: ${err}`
                };
                this.appService.completeLoadingBar();
                this.toasty.error(toast);

            });

        }
        catch(err){
            let toast = {
                title: "Failed",
                msg: `Your contact information was not saved: ${err}`
            };
            this.appService.completeLoadingBar();
            this.toasty.error(toast);
        }
    }

}
