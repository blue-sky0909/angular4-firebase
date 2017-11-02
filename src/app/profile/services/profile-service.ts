import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {IAccountAbout, AccountAbout} from "../../account/components/about/about-model";
import {IAccountContact, AccountContact} from "../../account/components/contact/contact-model";
import {Socials} from "../../account/components/social/account-social-component";
import {AuthService} from "../../auth/services/auth-service";
import {FirebaseApp} from "angularfire2";

@Injectable()
export class ProfileService {

    profile:IAccountAbout = new AccountAbout();
    set:boolean = false;
    profileId:string;
    upcomingEvents$:FirebaseListObservable<any>;
    upcomingLimit:number = 2;
    upcomingTotal:number = 0;
    contact:IAccountContact;
    socials:Socials;
    socialsSet:boolean = false;

    constructor(public af: AngularFireDatabase,
                public auth: AuthService,
                private app: FirebaseApp) {
        this.profile = new AccountAbout();
        this.contact = new AccountContact();
    }

    setInfo(id:string): void{
        this.setProfile(id);
        this.setContact(id);
        this.setSocials(id);
    }

    setProfile(id:string): void{
        this.af.object(`/about/${id}/`).subscribe((profile:IAccountAbout)=>{
            this.profile = profile;
            this.setUpcoming(id);
        });

        this.app.storage().ref(`userImages/${id}/profile`).getDownloadURL().then((URL)=>{
          console.log(URL);
          this.profile.imageURL = URL;
        });

    }

    setContact(id:string): void{
        this.af.object(`/contact/${id}`).first().subscribe((contact:IAccountContact)=>{
            this.contact = contact;
        });
    }

    setSocials(id:string): void{
        this.af.object(`/socials/${id}`).first().subscribe((socials:Socials)=>{
            this.socials = socials;
        });
    }

    setUpcoming(id){

        this.profileId = id;
        this.setLimit(this.upcomingLimit);
        this.set = true;

    }

    setLimit(num){

        let now = Math.floor( Date.now() / 1000 );
        console.log(now)
        this.upcomingLimit = num;

        this.upcomingEvents$ = this.af.list(`/events/profile/upcoming/${this.profileId}`, {
            query: {
                orderByChild: 'startDate',
                startAt: now,
                limitToFirst: this.upcomingLimit
            }
        });
        console.log("profile service profile id", this.profileId)
        this.upcomingEvents$.first().subscribe((data)=>{
            console.log("profile service value", data);
            this.upcomingTotal = data.length;
        })

    }

}
