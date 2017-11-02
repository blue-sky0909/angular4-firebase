import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database/database";
import {AuthService} from "../../auth/services/auth-service";
import {FirebaseListObservable, FirebaseOperation} from "angularfire2/database/firebase_list_observable";
import {Message} from "../../notifications/models/Message";

@Injectable()
export class InappNotificationService{


    constructor(private af: AngularFireDatabase, private auth: AuthService) {

    }

    public getActiveMessages(userId:string):FirebaseListObservable<any>{
        return this.af.list(`/notification/messages/${userId}`);
    }

    public addMessage(userId:string,message:Message):void{
        this.af.list(`/notification/messages/${userId}`).push(message);
    }

    public removeMessage(key:FirebaseOperation,userId:string){
        this.af.list(`/notification/messages/${userId}`).remove(key);
    }

}
