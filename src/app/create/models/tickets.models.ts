export class ITicket {
    $key?: string;
    $exists?();
    open?: boolean;
    ticketType: string;
    ticketTitle: string;
    ticketDescription: string;
    ticketQuantity: number;
    ticketPrice?: number;
    buyMultiple?: boolean;
    refundable?: boolean;
    maxPer: number;
    payPal?: string;
    ticketsUsed: number;
    ticketsLeft: number;
    multiRegistrant: boolean;
}

export class Ticket implements ITicket{
    open = false;
    ticketType = 'free';
    ticketTitle = '';
    ticketDescription = '';
    ticketPrice = 0;
    buyMultiple = false;
    maxPer = 1;
    multiRegistrant = false;
    refundable = true;
    payPal = '';
    ticketQuantity = 0;
    ticketsUsed = 0;
    ticketsLeft = 0;
    eventRef: string;

    // make sure and get event ref
    constructor(eventRef){
        this.eventRef = eventRef;
    }
}

export interface IDraftTickets{
    $key?: string;
    tickets: ITicket[];
}

export class DraftTickets implements IDraftTickets{
    tickets: ITicket[];
    constructor(tickets: ITicket[] = []){
        this.tickets = tickets;
    }
}
