import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {AuthService} from "../../auth/services/auth-service";

@Injectable()
export class EventBookmarkService {

    constructor(private af: AngularFireDatabase, private auth: AuthService) {

    }

    getMyBookmarks():FirebaseListObservable<any[]>{
        return this.af.list(`/bookmarks/${this.auth.id}`);
    }

    checkBookmark(id):FirebaseObjectObservable<any>{
        return this.af.object(`/bookmarks/${this.auth.id}/${id}`);
    }

    setBookmark(id){
        return this.af.object(`/bookmarks/${this.auth.id}/${id}`).set({"set": true});
    }

    removeBookmark(id){
        return this.af.object(`/bookmarks/${this.auth.id}/${id}`).remove();
    }

}
