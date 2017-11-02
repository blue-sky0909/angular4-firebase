import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable, EventEmitter } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import {AuthService} from '../auth/services/auth-service';
import {Subject, Observable} from 'rxjs';

@Injectable()
export class OCodeService {

    public getOcodeObservable: EventEmitter<any> = new EventEmitter(true);
    public ocodeEmitter: EventEmitter<any> = new EventEmitter(true);
    ocodeSet = false;
    ocode: string;
    ocodeChecked = false;

    constructor(private af: AngularFireDatabase, private auth: AuthService) {

        // EMITTED FROM MAIN APP SERVICE AFTER AUTH
        this.getOcodeObservable.subscribe(() => {
            this.getOcodeById().then((ocode) => {
                this.ocodeEmitter.emit(ocode);
            }, (err) => {

            });
        });

    }

    // ---------------------------------------------------------------------|
    //               RETURNS OCODE USING AUTH ID                            |
    // ---------------------------------------------------------------------|
    getOcodeById(): Promise<any>{
        return new Promise((resolve, reject) => {
            this.af.object(`/ocodesById/${this.auth.id}`).subscribe((data) => {
                if (data.$exists()){
                    resolve(data.ocode);
                }
                else{
                    resolve('');
                }

            });
        });
    }

    // ---------------------------------------------------------------------|
    //               RETURNS OCODE USING KEY ATTR                           |
    // ---------------------------------------------------------------------|
    getOcodeWithKey(key): Promise<any>{
        return new Promise((resolve, reject) => {
            this.af.object(`/ocodesById/${key}`).subscribe((data) => {
                if (data.$exists()){
                    resolve(data.ocode);
                }
                else{
                    reject('no ocode present');
                }

            });
        });
    }

    // ---------------------------------------------------------------------|
    //    FIREBASE RULES WILL REJECT IF ALREADY TAKEN, OTHERWISE SET OCODE  |
    // ---------------------------------------------------------------------|
    setOcode(ocode): Promise<any>{

        ocode = ocode.toLowerCase();

        return new Promise((resolve, reject) => {

                this.af.object(`/ocodes/${ocode}`).set({uid: this.auth.id}).then((data) => {

                    this.af.object(`/ocodesById/${this.auth.id}`).set({ocode: ocode}).then(() => {
                        resolve();
                    }, (err) => {
                        reject(err);
                    }).catch((err) => {
                        reject(err);
                    });

                }).catch((err) => {
                    reject(err);
                });

        });
    }

    getOcode(ocode): Observable<any>{
        ocode = ocode.toLowerCase();
        return this.af.object(`/ocodes/${ocode}`);
    }

    getAllOcodes(): FirebaseListObservable<any[]>{
        return this.af.list(`/ocodes`);
    }



}
