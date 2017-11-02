import * as firebase from 'firebase/app';

import {IGPS, GPS} from './gps';
export class IoEvent {

    // BOILERPLATE PROPERTIES FOR FIREBASE
    $key?: string;
    createdAt?: Object;

    // EVENT SPECIFIC PROPERTIES
    imageSet: boolean;
    imagePath: string;
    date: string;
    time: string;
    startDate: number;
    endDate: number;
    title: string;
    category: string;
    type: string;
    dateType: string;
    location?: string;
    locationSet: boolean;
    gps: IGPS;
    url?: string;
    organizer: string;
    description: string;
    descriptionText: string;
    // live, closed, cancelled
    liveStatus: string;
    // active, draft, history
    status: string;
    keywords: string[];
    totalTickets: number;
    ticketsUsed: number;
    ticketsLeft: number;
    visibility: string;
    showRemainingTickets: boolean;
    showRegisteredAttendees: boolean;
    promoters: number;
    registrations: number;
    creator: string;

    // EVENT OBJECT REFERENCES (USED PRINCIPALLY DURING EVENT CREATION AND EDITING TO DERIVE MAIN PROPERTIES)
    generalKey: string;
    dateKey: string;
    ticketsKey: string;
    templateKey: string;
    shareKey: string;
    customKey: string;
    childEventKeys: string[];
    parentKey: string;
}

export class OEvent implements IoEvent {

    // FIREBASE PROPERTIES
    createdAt = firebase.database.ServerValue.TIMESTAMP;

    // MAIN PROPERTIES
    imageSet = false;
    imagePath = '';
    date = '';
    time = '';
    category = '';
    startDate = 0;
    endDate = 0;
    title = '';
    type = 'local';
    dateType = '';
    locationSet = false;
    location = '';
    gps: IGPS = new GPS(-79.913718, -98.697340);
    url = '';
    organizer = '';
    description = '';
    descriptionText = '';
    status = 'blank';
    liveStatus = 'active';
    keywords: string[] = [];
    totalTickets = 0;
    ticketsUsed = 0;
    ticketsLeft = 0;
    visibility = 'public';
    showRemainingTickets = true;
    showRegisteredAttendees = true;
    promoters = 0;
    registrations = 0;
    creator = '';

    // REFERENCES
    generalKey = '';
    dateKey = '';
    ticketsKey = '';
    templateKey = '';
    shareKey = '';
    customKey = '';

    // REFERENCE FOR RECURRING TYPE EVENTS THAT SPAWN MULTIPLE EVENTS
    parentKey = '';
    childEventKeys: string[] = [];
}

export interface IoRef {
    $key?: string;
    createdAt: Object;
    ref: string;
    ocode: string;
    uid: string;
    data: IoEvent;
}


export class ORef implements IoRef {

    // FIREBASE PROPERTIES
    createdAt = firebase.database.ServerValue.TIMESTAMP;
    ref = '';
    ocode = '';
    uid = '';
    data: IoEvent;
}
