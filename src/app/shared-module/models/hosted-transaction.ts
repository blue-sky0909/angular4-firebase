export class HostedTransaction{
    PayerAccountId:number;
    MerchantProfileId:number;
    Amount:number;
    CurrencyCode:string;
    InvoiceNumber:string;
    CardHolderNameRequirementType:number;
    SecurityCodeRequirementType:number;
    AvsRequirementType:number;
    AuthOnly:boolean;
    ProcessCard:boolean;
    StoreCard:boolean;
    OnlyStoreCardOnSuccessfulProcess:boolean;
    CssUrl:string;
    FraudDetectors:any;
    PaymentTypeId:number;
    Protected:boolean;
}
