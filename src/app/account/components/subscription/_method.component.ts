import {Component} from '@angular/core';
import {AuthService} from "../../../auth/services/auth-service";
import {AccountSubscriptionService} from "./account-subscription-service";
import {HostedTransaction} from "../../../shared-module/models/hosted-transaction";
import {AccountContactService} from "../../../shared-module/services/account-contact-service";
import {IAccountContact} from "../contact/contact-model";
import {AppService} from "../../../services/app-service";
import {CONFIG} from "../../../../config/config";
import {PropayService} from "../../../shared-module/services/propay.service";

@Component({
             selector: 'account-subscription-method',
             styles: [`.iFrame { 
               text-align: center;
               width: 90%;
               height: 450px;
               overflow-y: scroll;
               padding: 10px;
             }`],
             template: `


               <div class="tab-pane" id="tab_1_2_content">
                 <div class="row">
                   <!--
                   <div class="col-md-4">
                     <div class="panel panel-default c-panel" style="min-height:230px">
                       <div class="panel-body c-panel-body">
                         <div class="row c-padding-20 text-center">
                           <h1 class="c-font-uppercase c-font-bold">Payment Method</h1>
                           <i class="fa fa-credit-card fa-2x c-theme-font c-margin-t-10 c-margin-b-10"></i>
                           <p class="c-font-uppercase c-font-bold">XXXX-XXXX-XXXX-5465</p>

                         </div>
                       </div>
                     </div>
                   </div>
                   -->
                   <div class="col-md-12">
                     <p>
                       <small>*This is the credit card information that will be used for your monthly subscription
                         payment. You can change this at anytime.
                       </small>
                     </p>
                     <br />
                     <button (click)="addNew()" class="btn btn-lg btn-primary c-margin-t-30">
                       Add new
                     </button>
                     <br />
                     <br>
                     <div *ngIf="displayHPP">
                       <iframe #hppFrame id="hppFrame" name="hppFrame" class="iFrame" [src]="propayService.hppUrl"></iframe>
                     </div>
                     <button *ngIf="displayPayment" (click)="makePayment()"  class="btn btn-lg btn-primary c-margin-t-30">
                       Process
                     </button>
                     
                   </div>
                 </div>
               </div>



             `
           })

export class AccountSubscriptionMethodComponent
{
  contact:IAccountContact;
  displayPayment:boolean;
  displayHPP:boolean;

  constructor(private auth: AuthService,
              private appSerivce:AppService,
              private accountContactService:AccountContactService,
              public propayService: PropayService,
              private subscriptionService: AccountSubscriptionService)
  {
    this.displayHPP = false;
    this.displayPayment = false;

    this.appSerivce.signalRPingEmitter.subscribe((data)=>{
      console.log(data);
       if(data && data.pingReceived){
         console.log("Ping Received");
         this.displayPayment = true;
       }
    });
    this.appSerivce.signalRInvalidEmitter.subscribe((data)=>{
      console.log(data);
      if(data && data.pingReceived){
        console.log("Invalid payment");
      }
    });
    this.appSerivce.signalRSuccessEmitter.subscribe((data)=>{
      console.log(data);
      if(data && data.successForm){
        console.log("Form Success");
        this.propayService.getAndSaveHostedTransactionResults(this.auth.id);
      }
    });
  }

  addNew():void
  {
    this.accountContactService.getContactRef(this.auth.id).subscribe((data)=> {
      this.contact = data;
      this.propayService.loadPayerId(this.auth.id, {
        "name": `${this.contact.first} ${this.contact.last}`,
        "EmailAddress": `${this.contact.email}`,
        "ExternalId1": this.auth.id
      }).then((payerId) => {
        let hostedTransactionRequest: HostedTransaction = this.propayService.hostedTransactionRequest;
        hostedTransactionRequest.PayerAccountId = payerId;
        hostedTransactionRequest.Amount = CONFIG.PRO_PAY.authAmmount;
        hostedTransactionRequest.InvoiceNumber = this.propayService.newInvoiceNumber();
        this.propayService.createHostedTransaction(hostedTransactionRequest).then((transid) => {
          if (transid) {
            this.displayHPP = true;
            this.propayService.connectPropaySignalR(transid);
          }
        });
      });
    });
  }


  /** This just submitted. Wait until you get the message from event emitter to give success message. **/
  makePayment():void{
    this.propayService.submitForm();
  }
}
