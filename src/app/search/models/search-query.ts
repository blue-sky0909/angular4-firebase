import {IGPS, GPS} from '../../shared-models/gps';
import * as moment from 'moment';

export interface ISearchQueryLocation {
    range: string;
    setRange(): void;
    rangeNum: number;
    address: string;
    rangeType: string;
    location: IGPS;
    text: string;
}

export class SearchQueryLocation implements ISearchQueryLocation {
    range = '40mi';
    text = '';
    address = '';
    rangeNum = 40;
    rangeType = 'mi';
    location: IGPS = new GPS(0, 0);
    setRange(){
        this.range = `${this.rangeNum}${this.rangeType}`;
    }
}

export interface ISearchQuery {
    searchSet: boolean;
    search: string;
    locationSet: boolean;
    location: ISearchQueryLocation;
    startDateSet: boolean;
    startDate: any;
    endDateSet: boolean;
    endDate: any;
    categories: string[];
    creators: string[];
    eventTypeSet: boolean;
    eventType: string;
    priceSet: boolean;
    price: string;
    currentPage: number;
    getCurrentDate(): void;
    resetStartDate(): void;
    resetEndDate(): void;
    page?: number;

    $exists?();
    $key?;
    exists?();
    val?();


}

export class SearchQuery implements ISearchQuery {

    searchSet = false;
    search = '';

    locationSet = false;
    location: ISearchQueryLocation = new SearchQueryLocation();

    startDateSet = false;
    startDate: any = this.getCurrentDate();

    endDateSet = false;
    // DEFAULT IS SET TO THE FUTURE
    endDate: any = 1999999999;

    categories: string[] = [];

    creators: string[] = [];

    eventTypeSet = false;
    eventType = '';

    priceSet = false;
    price = '';
    currentPage = 1;

    constructor(data?: ISearchQuery) {
        if (typeof data !== 'undefined') {
            if (typeof data.searchSet !== 'undefined') {
                this.searchSet = data.searchSet;
            }

            if (typeof data.search !== 'undefined') {
                this.search = data.search;
            }

            if (typeof data.locationSet !== 'undefined') {
                this.locationSet = data.locationSet;
            }

            if (typeof data.location !== 'undefined') {
                this.location = data.location;
            }

            if (typeof data.startDateSet !== 'undefined') {
                this.startDateSet = data.startDateSet;
            }

            if (typeof data.startDate !== 'undefined') {
                this.startDate = data.startDate;
            }


            if (typeof data.endDateSet !== 'undefined') {
                this.endDateSet = data.endDateSet;
            }

            if (typeof data.endDate !== 'undefined') {
                this.endDate = data.endDate;
            }

            if (typeof data.categories !== 'undefined') {
                this.categories = data.categories;
            }

            if (typeof data.creators !== 'undefined') {
                this.creators = data.creators;
            }

            if (typeof data.eventTypeSet !== 'undefined') {
                this.eventTypeSet = data.eventTypeSet;
            }

            if (typeof data.eventType !== 'undefined') {
                this.eventType = data.eventType;
            }

            if (typeof data.priceSet !== 'undefined') {
                this.priceSet = data.priceSet;
            }

            if (typeof data.priceSet !== 'undefined') {
                this.priceSet = data.priceSet;
            }

            if (typeof data.currentPage !== 'undefined') {
                this.currentPage = data.currentPage;
            }

        }
    }

    getCurrentDate(): any {
        const currDate = moment().format('MM/DD/YY 0:00');
        const test =  moment(currDate).unix();
        return test;
    }

    resetStartDate(): void {
        this.startDate = this.getCurrentDate();
    }

    resetEndDate(): void {
        // DEFAULT IS SET INTO THE FUTURE
        this.endDate = 1999999999;
    }

}
