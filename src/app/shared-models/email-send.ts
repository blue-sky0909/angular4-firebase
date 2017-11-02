export class EmailSend{
    toEmail:string;
    toName:string;
    replyTo:string;
    fromName:string;
    subject:string;
    body:string;

    constructor(toEmail?, toName?, replyTo?, fromName?, subject?, body?){
        this.toEmail = toEmail;
        this.toName = toName;
        this.replyTo = replyTo;
        this.fromName = fromName;
        this.subject = subject;
        this.body = body;
    }
}