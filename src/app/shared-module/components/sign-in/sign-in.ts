import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../../../auth/services/auth-service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AppService} from "../../../services/app-service";
import {ToastyService} from "ng2-toasty";
import {AccountContactService} from "../../services/account-contact-service";
import {AccountMeService} from "../../services/account-me-service";
import {IAccountContact} from "../../../account/components/contact/contact-model";
import {AttendModalComponent} from '../../modals/event/modals/attend-modal-component';
import {JoinComponent} from '../join/join';

declare var jQuery;

@Component({
    selector: 'fl-sign-in',
    styles: [
       `
            .login-error{padding-bottom:15px;}
        `
    ],
    templateUrl: './sign-in.html'
})

export class SignInComponent implements OnInit{
    email:string;
    password:string;
    showSignIn:boolean = false;
    error:boolean = false;
    errorMessage:string = "Username and password are invalid";
    @Output() bubbleJoin:EventEmitter<any> = new EventEmitter();
    @Input() routeThrough = true;

    constructor(
        public appService: AppService,
        public auth: AuthService,
        private router: Router,
        public activeModal: NgbActiveModal,
        public toasty: ToastyService,
        private contactService: AccountContactService,
        private aboutService: AccountMeService,
        private modalService: NgbModal
        ) {
    }

    onSubmit(form:any){
        this.appService.startLoadingBar();
        this.error = false;

        this.auth.signInWithEmail(form.value.email, form.value.password).then(
            (user)=>{

                this.auth.user = user;

                this.contactService.contactEmitter.subscribe((contact$)=>{
                    contact$.first().subscribe((data:IAccountContact)=>{
                        console.log(data);
                        if(
                            !data.first || data.first.length == 0 ||
                            !data.last || data.last.length == 0 ||
                            !data.email || data.email.length == 0 ||
                            !data.phone || data.phone.length == 0 ||
                            !data.country || data.country.length == 0 ||
                            !data.address || data.address.length == 0 ||
                            !data.city || data.city.length == 0 ||
                            !data.state || data.state.length == 0 ||
                            !data.postal || data.postal.length == 0 ||
                            data.timeZone == 0
                        ){
                            this.auth.showProfileReminder = true;
                        }else{
                            this.auth.showProfileReminder = false;
                        }

                        if(!data.email || data.email.length == 0){
                            contact$.update({email:this.auth.user.email});
                        }


                    });
                });

                this.aboutService.aboutEmitter.first().subscribe((about$)=>{
                    about$.subscribe((values)=>{

                        console.log(values);

                        if(
                            !values.imageSet ||
                            !values.organizerName || values.organizerName.length == 0
                        ){
                            this.auth.showAboutMeReminder = true;
                        }else{
                            this.auth.showAboutMeReminder = false;
                        }

                    });
                });



                this.appService.completeLoadingBar();
                this.toasty.success("You are now signed in");
                //FORCE NEW SESSION WHEN LOGGING IN
                this.appService.setSessionId(true);
                this.showSignedIn();
                if(this.routeThrough){
                    this.router.navigateByUrl('/home').then(()=>{});
                } else{
                    this.activeModal.dismiss();
                    const signInRef = this.modalService.open(AttendModalComponent);
                    signInRef.componentInstance.name = 'Attend';
                }


            },
            (err)=>{

                    console.log("FAIL____");
                    this.appService.completeLoadingBar();
                    this.error = true;
                }
            );
    }

    private showSignedIn(){

        this.showSignIn = true;
        setTimeout(()=>this.activeModal.dismiss(),750);

        //SHOW FREE TRIAL ON EVERY LOGIN UNLESS THEY'VE ALREADY STARTED OR SIGNED UP
        setTimeout(()=>{
            if(!this.appService.ocodeSet){
                this.appService.triggerFreeTrialProcess();
            }
        }, 1500);
    }

    private postSignIn(): void {
        this.router.navigate(['/dashboard']);
    }

    public join(){
        this.activeModal.dismiss();

        if(this.router.url != "/login"){
            if(this.routeThrough){
                this.appService.openJoin();
            } else{
                const signInRef = this.modalService.open(JoinComponent);
                signInRef.componentInstance.name = "Join";
                signInRef.componentInstance.routeThrough = this.routeThrough;
            }
        }
        else{
            this.bubbleJoin.emit();
        }



    }

    public forgotPass(){
        this.activeModal.dismiss();
        this.appService.openForgotPassword();
    }

    ngOnInit(){

    }
}
