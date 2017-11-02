export class EmailInviteTemplate{
    subject:string;
    useSalutation:boolean = true;
    salutation:string = "Hello";
    name:string = "<first name>";
    messageDelta: any;
}