import {Component, Output, EventEmitter, Input} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../../auth/services/auth-service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AngularFireDatabase} from "angularfire2/database/database";
import {AppService} from "../../../services/app-service";
import {AttendModalComponent} from '../../modals/event/modals/attend-modal-component';
import {SignInComponent} from '../../../auth/components/sign-in';

@Component({
    selector: 'fl-join',
    styles: [

    ],
    templateUrl: './join.html'
})

export class JoinComponent {
    email:string = "";
    password:string = "";
    first:string = "";
    last:string = "";
    timeZone:string = "";
    errors:any[] = [];
    fbError:boolean = false;
    fbErrorMsg:string = "";
    @Output() bubbleLogin:EventEmitter<any> = new EventEmitter();
    @Input() routeThrough = true;

    constructor(private auth: AuthService,
                private router: Router,
                private af:AngularFireDatabase,
                public appService: AppService,
                public activeModal: NgbActiveModal,
                private modalService: NgbModal
            ) {


        console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)


        this.errors['password'] = {
            state:false,
            message: "Password must be at least 8 characters long"
        };

        this.errors['email'] = {
            state:false,
            message: "Enter a valid email"
        };

        this.errors['first'] = {
            state:false,
            message: "Enter a valid first name"
        };

        this.errors['last'] = {
            state:false,
            message: "Please enter a last name"
        };

        this.errors['timeZone'] = {
            state:false,
            message: "Please select a timezone"
        };

    }

    checkFields(){
       let check:boolean = true;
       this.errors['email'].state = false;
       this.errors['password'].state = false;
       this.errors['first'].state = false;
       this.errors['last'].state = false;
       this.errors['timeZone'].state = false;

       if(!this.appService.validateEmail(this.email)){
           this.errors['email'].state = true;
           check = false;
       }

       if(this.password.length < 8){
           this.errors['password'].state = true;
           check = false;
       }

       if(this.first.length < 1){
           this.errors['first'].state = true;
           check = false;
       }

        if(this.last.length < 1){
            this.errors['last'].state = true;
            check = false;
        }

        if(this.timeZone.length < 1){
            this.errors['timeZone'].state = true;
            check = false;
        }

       if(check){
           return true;
       }
       else{
           return false;
       }


    }

    registerWithEmail(): void{
        this.fbError = false;
        if(this.checkFields()){

            this.auth.registerWithEmail(this.email, this.password)
                .then((success)=>{
                    this.activeModal.dismiss();
                    if(this.routeThrough){
                        this.addInfo().then(()=>{
                            this.router.navigateByUrl('/account');
                        });
                    } else{
                        const signInRef = this.modalService.open(AttendModalComponent);
                        signInRef.componentInstance.name = 'Attend';
                    }
                },
                (err)=>{
                    this.fbError = true;
                    this.fbErrorMsg = err.message;
                });
        }
    }

    checkSign(check){
        check.then((data)=>{
            console.log(data);
        });
    }

    addInfo():Promise<any>{
        return new Promise((resolve, reject)=>{
           if(this.auth.authenticated){
                this.addContactInfo().then(()=>{
                    resolve();
                });
           }
           else{
               this.auth.authObservable.first().subscribe(()=>{
                   this.addContactInfo().then(()=>{
                       resolve();
                   });
               })
           }
        });
    }

    addContactInfo():Promise<any>{

        let contact$ = this.af.object(`/contact/${this.auth.id}`);
        return new Promise((resolve, reject)=>{
            contact$.update({
                first: this.first,
                last: this.last,
                timeZone: this.timeZone
            }).then(()=>{
                resolve();
            }, (err)=>{
                reject(err);
            })
        })


    }

    private postSignIn(): void {
        this.router.navigate(['/dashboard']);
    }

    public login(){
        this.activeModal.dismiss();

        if(this.router.url != '/login'){
            if(this.routeThrough){
                this.appService.openLogin();
            } else{
                const signInRef = this.modalService.open(SignInComponent);
                signInRef.componentInstance.name = 'Login';
                signInRef.componentInstance.routeThrough = this.routeThrough;
            }
        }
        else{
            this.bubbleLogin.emit();
        }



    }
}
