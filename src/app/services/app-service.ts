import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable, EventEmitter } from '@angular/core';
import {SlimLoadingBarService} from "ng2-slim-loading-bar/index";
import {FirebaseObjectObservable, AngularFireDatabase} from "angularfire2/database";
import {IHeader} from "../models/header";
import {AuthService} from "../auth/services/auth-service";
import {Router} from "@angular/router";
import { environment } from '../../environments/environment';
//import {ISearchQuery, SearchQuery} from "../../views/search/models/search-query";
import {OCodeService} from "./ocode-service";
import {AccountContactService} from "../shared-module/services/account-contact-service";
import {IAccountContact, AccountContact} from "../account/components/contact/contact-model";
import {IAccountAbout, AccountAbout} from "../account/components/about/about-model";
import {ToastyService} from "ng2-toasty";
import {GPS} from "../shared-models/gps";

@Injectable()
export class AppService {

    openJoinEmitter: EventEmitter<any> = new EventEmitter(true);
    openLoginEmitter: EventEmitter<any> = new EventEmitter(true);
    updateProfileEmitter: EventEmitter<any> = new EventEmitter(true);
    forgotPasswordEmitter: EventEmitter<any> = new EventEmitter(true);
    ocodeStatusEmitter: EventEmitter<any> = new EventEmitter(true);
    triggerFreeTrial: EventEmitter<any> = new EventEmitter(true);
    contactEmitter: EventEmitter<any> = new EventEmitter(true);
    aboutEmitter: EventEmitter<any> = new EventEmitter(true);
    ocodeBlockEmitter: EventEmitter<any> = new EventEmitter();
    signalRPingEmitter: EventEmitter<any> = new EventEmitter();
    signalRInvalidEmitter: EventEmitter<any> = new EventEmitter();
    signalRSuccessEmitter: EventEmitter<any> = new EventEmitter();

    header: any = {};
    environment: any = {};
    headerSub:any;
    sessionId:string;

    ocodeChecked:boolean = false;
    ocode:string;
    ocodeSet:boolean = false;

    email:string;
    emailSet:boolean = false;
    authChecked:boolean = false;
    userImage:string = "";
    contact:IAccountContact = new AccountContact();
    about:IAccountAbout = new AccountAbout();
    contactSet:boolean = false;
    aboutSet:boolean = false;

    location:any;
    locationSet:boolean = false;
    locationEmitter: EventEmitter<any> = new EventEmitter(true);

    admin:boolean = false;

    constructor(
            private loadingBar: SlimLoadingBarService,
            public af: AngularFireDatabase,
            public auth: AuthService,
            public router: Router,
            public ocodeService: OCodeService,
            public as: AccountContactService,
            private toasty: ToastyService,

        ) {

        this.environment = environment;

        //CALL FUNCTION ONLY AFTER AUTH STATE IS CREATED
        this.auth.authObservable.subscribe(()=>{
            this.onAuthState();
        });

        this.setSessionId();

        this.ocodeService.ocodeEmitter.subscribe((data)=>{

                this.ocode = data;
                this.ocodeChecked = true;

                if(this.ocode.length){
                    this.ocodeSet = true;
                }

                this.ocodeStatusEmitter.emit();

        }, (err)=>{
            console.log("app-service-ocode-service-emitter", err);
        });

        if(this.auth.authenticated){
            this.af.object(`/contact/${this.auth.id}`).first().subscribe((data)=>{
                this.updateContact(data);
            });
            this.af.object(`/about/${this.auth.id}`).first().subscribe((data)=>{
                this.updateAbout(data);
            });
        }
        else{
            this.auth.authObservable.subscribe(()=>{
                this.af.object(`/contact/${this.auth.id}`).first().subscribe((data)=>{
                    this.updateContact(data);
                });
                this.af.object(`/about/${this.auth.id}`).first().subscribe((data)=>{
                    this.updateAbout(data);
                });
            })
        }

    }

    updateContactAndAbout():void{
        this.af.object(`/contact/${this.auth.id}`).first().subscribe((data)=>{
            this.updateContact(data);
        });
        this.af.object(`/about/${this.auth.id}`).first().subscribe((data)=>{
            this.updateAbout(data);
        });
    }



    updateContact(data):void{
        this.contact = data;
        this.contactSet=true;
        this.contactEmitter.emit();
        this.setLocation()
    }

    updateAbout(data):void{
        this.about = data;
        this.aboutSet=true;
        this.aboutEmitter.emit()
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // FUNCTIONALITY THAT DEPENDS ON AN AUTH STATE BEING LOADED FIRST
    // -----------------------------------------------------------------------------------------------------------------------
    onAuthState(){

        this.updateProfile();
        this.authChecked = true;
        let header$ = new FirebaseObjectObservable<IHeader>();
        if(this.auth.authenticated){
            header$ = this.af.object(`/contact/${this.auth.id}`);
            this.headerSub = header$.subscribe((data)=>{
                this.header = data;
            });

            this.ocodeService.getOcodeObservable.emit(false);

            this.checkRoles();
        }
    }

    checkRoles(){
        let admin:boolean = false;

        this.af.object(`/admin/${this.auth.id}/roles/admin`).first().subscribe((isAdmin)=>{
            if(isAdmin.$value){
                this.admin = true;
            }
        });

    }

    setOcode(ocode){
        this.ocode = ocode;
    }

    openJoin(){
        this.openJoinEmitter.emit(false);
    }

    openLogin(){
        this.openLoginEmitter.emit(false);
    }

    openForgotPassword(){
        this.forgotPasswordEmitter.emit(false)
    }

    signOut(){
        this.headerSub.unsubscribe();

        this.auth.signOut().then(()=>{
            this.deleteCookie('angSessionIDSet');
            this.toasty.success("You are now logged out.");

            this.router.navigate(['/']).then(()=>{

            });
        });

    }

    updateProfile(){
        this.updateProfileEmitter.emit(false);
    }

    startLoadingBar(){
        this.loadingBar.progress = 30;
        this.loadingBar.start();
    }

    completeLoadingBar(){
        this.loadingBar.complete();
    }

    stopLoadingBar(){
        this.loadingBar.complete();//changed this to complete from stop because I kept messing it up :).
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    scrollToTop(){

        if(window.scrollY!=0)
        {
            let $this = this;
            setTimeout(function() {
                window.scrollTo(0,window.scrollY-60);
                $this.scrollToTop();
            }, 15);
        }

    }

    //BYPASS TO SET A NEW SESSION ID EVENT IF THE COOKIE IS SET
    setSessionId(bypass:boolean = false){

        let guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        if(this.getCookie('angSessionIDSet') !== "set" || bypass){
            this.setCookie('angSessionID', guid());
            this.setCookie('angSessionIDSet', 'set');
        }

        this.sessionId = this.getCookie('angSessionID');

    }

    getCookie(name: string) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    deleteCookie(name) {
        this.setCookie(name, "", -1);
    }

    setCookie(name: string, value: string, expireDays: number = 1, path: string = "/") {
        let d:Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires:string = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "");
    }

    triggerFreeTrialProcess(){

        let freeTrial$ = this.af.object(`marketing/free-trial-popup/${this.auth.id}`);

        freeTrial$.first().subscribe((data)=>{
            if(!data.$exists()){
                this.triggerFreeTrial.emit(false);
            }
        });

    }

    reset(){
        /*if(typeof this.auth.id == 'undefined' || !this.auth.id.length){
           this.auth.authObservable.first().subscribe(()=>{

           });
        }
        else{
            this.auth.auth$.authState.subscribe((authState)=>{
                this.auth.id = authState.uid;
            });
        }*/
    }

    setLocation():void{
        if(typeof this.contact.address !== "undefined"
            && this.contact.address.length
            && this.contact.city !== "undefined"
            && this.contact.city.length){

            this.getEnteredAddress().then((location)=>{
                this.location = location;
                this.locationSet = true;
                this.locationEmitter.emit();
            });

        }
        else{
            this.getBrowserGPS().then((location)=>{
                this.location = location;
                this.locationSet = true;
                this.locationEmitter.emit();
            })
        }
    }

    getEnteredAddress():Promise<any>{
        return new Promise((resolve, reject)=>{
            this.getUsersAddress().then((location) => {
                resolve(location);
            })
        });
    }

    getBrowserGPS():Promise<any>{
        return new Promise((resolve, reject)=>{
            if (navigator.geolocation) {

                let $this = this;

                navigator.geolocation.watchPosition(function (position) {

                    },
                    //IF USER HAS GPS BUT BLOCKS
                    function (error) {
                        if (error.code == error.PERMISSION_DENIED) {
                            resolve({location: "",gps: false})
                        }
                    });

                //IF THE USER HAS AND HAS ACCEPTED GPS
                navigator.geolocation.getCurrentPosition((position) => {
                    let newGPS: GPS = new GPS(position.coords.latitude, position.coords.longitude);
                    let address = `${newGPS.lat}, ${newGPS.lng}`;
                    resolve({location: address, gps: true});
                });

                //IF A USER DOESN'T HAVE GPS INFO
            }
            else{
                reject("no navigator");
            }
        })
    }

    getUsersAddress(): Promise < any > {
        return new Promise((resolve, reject) => {

            this.getContactInfo().then((location) => {
                resolve(location);
            });

        });

    }

    getContactInfo(): Promise <any> {
        return new Promise((resolve, reject) => {

            if(this.contactSet){
                let address: string = `${this.contact.address}, ${this.contact.city}, ${this.contact.state}`;
                resolve({location: address, gps: false});
            }

        });

    }

    //CALL THIS FUNCTION IF SOMETHING SHOULD BE BLOCKED WITHOUT AN OCODE SET
    triggerNeedOcode(){
        this.ocodeBlockEmitter.emit();
    }

}
