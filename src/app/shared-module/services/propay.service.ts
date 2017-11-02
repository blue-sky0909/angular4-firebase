import {EventEmitter, Injectable} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Http, RequestOptions, Headers} from '@angular/http';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {CONFIG} from '../../../config/config';
import 'signalr/jquery.signalR.js';
import {HostedTransaction} from '../../shared-module/models/hosted-transaction';
import {AppService} from '../../services/app-service';


//declare let signalR:any;

declare var $: any;

@Injectable()
export class PropayService {
  public signalR: any;
  public hostedTransactionIdentifier: string;
  public hostedTransactionId: string;
  public hppUrl: SafeResourceUrl;
  public payerId: string;
  public hostedTransactionRequest: HostedTransaction;


  constructor(private http: Http, public af: AngularFireDatabase,
              public appService: AppService,
              private sanitizer: DomSanitizer){
    this.signalR = null;
    this.initHostedTransactionRequestWithDefaultValues();
  }

  private initHostedTransactionRequestWithDefaultValues(){
    this.hostedTransactionRequest = new HostedTransaction();
    this.hostedTransactionRequest.MerchantProfileId = 0;
    this.hostedTransactionRequest.CurrencyCode = 'USD';
    this.hostedTransactionRequest.InvoiceNumber = '';
    this.hostedTransactionRequest.CardHolderNameRequirementType = 1;
    this.hostedTransactionRequest.SecurityCodeRequirementType = 1;
    this.hostedTransactionRequest.AvsRequirementType = 1;
    this.hostedTransactionRequest.AuthOnly = true;
    this.hostedTransactionRequest.ProcessCard = false;
    this.hostedTransactionRequest.StoreCard = true;
    this.hostedTransactionRequest.OnlyStoreCardOnSuccessfulProcess = false;
    this.hostedTransactionRequest.CssUrl = 'https://epay.propay.com/App_Themes/default/Menu.css';
    this.hostedTransactionRequest.FraudDetectors = null;
    this.hostedTransactionRequest.PaymentTypeId = 0; //Credit Card
    this.hostedTransactionRequest.Protected = false;
  }

  getPaymentRef(id: string): FirebaseObjectObservable<any>{
    return this.af.object(`/payment/payer/${id}/`);
  }

  getHostedTransactionResultsRef(id: string): FirebaseListObservable<any>{
    return this.af.list(`/payment/hostedTransactionResults/${id}/`);
  }

  public getTempToken(): void{
    const headers = new Headers({ 'Accept': 'application/json' });
    headers.append('Authorization', `Basic Nzc2MzY5NTc2MDU0OTMzOToxNDU5NDllMy1kNmE2LTQ1ZjctODI5YS01NDgwYTJjYWEyOWM=`);
    const options = new RequestOptions({ headers: headers });
    const url = 'https://xmltestapi.propay.com/ProtectPay/TempTokens/?payerName=prakash&durationSeconds=600';
    this.http.get(url, options).subscribe((response) => {
      const tempToken = response.json();
      // console.log(tempToken);
    });
  }

  /*
   Use the payer id of the user already has one. Store that in the user's information in firebase
   If the payer id do not exist create that using this method and store in firebase.
   */

  public loadPayerId(uid: string, requestBody: any): Promise<any>{
    return new Promise((resolve, reject) => {
      this.getPaymentRef(uid).subscribe((paymentData) => {
        if (paymentData && paymentData.payerId){
          // console.log(paymentData);
          // console.log('Payer id in the database ');
          this.payerId = paymentData.payerId;
          resolve(this.payerId);
        }else {
          const headers = new Headers({ 'Content-Type': 'application/json' });
          headers.append('Authorization', `Basic MzU0ODM3MTU1NjQ4MjUwNzo0MTM4NjI1OS00NGY3LTQ4MjUtYWVjMi05ODY0MjkyMjY0N2U=`);
          const options = new RequestOptions({ headers: headers });
           const url = 'https://xmltestapi.propay.com/ProtectPay/Payers/';
          // let url:string = "http://localhost:8080/payer";
          this.http.put(url, requestBody, options).subscribe((response) => {
            // console.log('Payer id from protectpay.');
            const payerId = response.json().ExternalAccountID;
            this.getPaymentRef(uid).set({payerId: payerId});
            resolve(payerId);
          });
        }
      });
    });

  }


  public  createHostedTransaction(transactionDetail: HostedTransaction): Promise<any>{
    return new Promise((resolve, reject) => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      headers.append('Authorization', `Basic MzU0ODM3MTU1NjQ4MjUwNzo0MTM4NjI1OS00NGY3LTQ4MjUtYWVjMi05ODY0MjkyMjY0N2U=`);
      const options = new RequestOptions({ headers: headers });
      const url = 'https://xmltestapi.propay.com/ProtectPay/HostedTransactions/';
      //let url:string = "http://localhost:8080/hostedtransaction/";
      this.http.put(url, transactionDetail, options).subscribe((response) => {
        this.hostedTransactionIdentifier = response.json().HostedTransactionIdentifier;
        resolve(this.hostedTransactionIdentifier);
      });
    });

  }

  public getAndSaveHostedTransactionResults(uid: string): void{
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', `Basic MzU0ODM3MTU1NjQ4MjUwNzo0MTM4NjI1OS00NGY3LTQ4MjUtYWVjMi05ODY0MjkyMjY0N2U=`);
    const options = new RequestOptions({ headers: headers });
    const url = `https://xmltestapi.propay.com/ProtectPay/HostedTransactionResults/${this.hostedTransactionId}`;
    //let url:string = `http://localhost:8080/hostedtransactionresults?id=${this.hostedTransactionId}`;
    this.http.get(url, options).subscribe((response) => {
      this.getHostedTransactionResultsRef(uid).push(response.json());
    });

  }


  public connectPropaySignalR(hostedTransId: string): void{
    this.hostedTransactionId = hostedTransId;
    const connection = $.hubConnection();
    connection.url =  `${CONFIG.PRO_PAY.baseURI}${CONFIG.PRO_PAY.signalrURI}`;
    connection.qs =  { 'hid': this.hostedTransactionId, 'c': '0' };
    this.signalR = connection.createHubProxy('hostedTransaction');
    this.registerPing();
    this.registerSuccess();
    this.registerInvalid();


    connection.start({}, () => {console.log('Connection established'); })
      .done((data: any) => {
        this.hppUrl =  this.sanitizer.bypassSecurityTrustResourceUrl(`${CONFIG.PRO_PAY.baseURI}${CONFIG.PRO_PAY.hppURI}${this.hostedTransactionId}`);
      // console.log('Protocal: ' + data.protocol);
      // console.log('Host: '     + data.host);
      // console.log('URI : '     + data.appRelativeUrl);
      // console.log('Token : '   + data.token);
      // console.log('State : '   + data.state);
    }).fail((error: any) => {
      // console.log('Could not connect ' + error);
    });
  }

  public submitForm(): void {
    // console.log('Submit form');
    this.signalR.invoke('submitForm');
  }



  private registerPing(): void {
    this.signalR.on('ping', (data) => {
      this.signalR.invoke('pong');
      this.appService.signalRPingEmitter.emit({pingReceived: true});
    });
  }
  private registerSuccess(): void {
    this.signalR.on('formSubmitSucceeded', (data) => {
      // console.log('Received Success and emitting ');
      this.appService.signalRSuccessEmitter.emit({successForm: true});
    });
  }
  private registerInvalid(): void {
    this.signalR.on('formSubmitWasInvalid', (data: any) => {
      // console.log('Received Invalid and emitting' );
      this.appService.signalRInvalidEmitter.emit({invalidForm: true});
    });
  }

  public newInvoiceNumber(): any {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

  }



}
