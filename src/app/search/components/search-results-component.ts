
import {Component, OnInit, AfterViewChecked, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../auth/services/auth-service';
import {SearchService} from '../../shared-module/services/search-service';
import {ISearchQuery, SearchQuery} from '../models/search-query';
import {AppService} from '../../services/app-service';
import * as moment from 'moment';
import {ToastyService} from 'ng2-toasty';
import {EventsearchService} from '../services/eventsearch.service';

@Component({
    templateUrl: './search-results.html',
    styleUrls: [
        './search-results.scss'
    ],
})

export class SearchResultsComponent implements OnInit, AfterViewChecked, OnDestroy {

    search: ISearchQuery = new SearchQuery();
    searchResults: any[];
    category: string;
    searchTerm: string;
    range: string;
    location: string;
    searchSet = false;
    params: any;
    creator: string;

    startDateNew;
    displayStartDate = '';

    endDateNew;
    displayEndDate = '';

    verticalCard = false;

    showNoResults = false;

    dateAttached = false;

    pagination: any;

    validStartDate = true;
    validEndDate = true;

    constructor(private auth: AuthService,
                private eventSearchService: EventsearchService,
                private router: Router,
                private route: ActivatedRoute,
                public searchService: SearchService,
                public appService: AppService,
                private toasty: ToastyService) {
        this.startDateNew = {year: 2017, month: 7, day: 20};
        this.initPagination();
    }

    initPagination() {
        this.pagination = {
            collectionSize: 0,
            results: false,
            pageSize: 10,
            currentPage: 1
        };
    }


    validateDate(): boolean {
        this.validEndDate = true;
        this.validStartDate = true;
        if (this.startDateNew.year ) {
            const startDate = `${this.startDateNew.year}-${this.startDateNew.month}-${this.startDateNew.day}`;
            const currentDate = new Date();
            if (moment(startDate).unix() < moment(currentDate).unix()){
                this.validStartDate = false;
                return false;
            }
        }
        if (this.startDateNew.year && this.endDateNew.year) {
            const startDate = `${this.startDateNew.year}-${this.startDateNew.month}-${this.startDateNew.day}`;
            const endDate = `${this.endDateNew.year}-${this.endDateNew.month}-${this.endDateNew.day}`;
            if (moment(startDate).unix() >= moment(endDate).unix()){
                this.validEndDate = false;
                return false;
            }
        }
        return true;
    }

    ngOnInit(): void {

        this.route.queryParams.subscribe((params: any) => {
            this.params = params;
            const length = Object.keys(params).length;

            this.appService.startLoadingBar();

            if (length > 0){
                this.getSearchURI();
            }
            else{
                this.searchService.getCurrentLocation().then((location) => {
                    this.search.location.address = location.location;
                    this.search.locationSet = true;
                    this.search.location.range = '40mi';
                    this.search.location.location = location.location;
                    this.setByReverse();
                });
            }

        });

    }

    runSearch(paging: boolean = false): void {
        if (!paging) {
            this.initPagination();
        }
        this.updateSearchURI();
        this.appService.startLoadingBar();
        this.eventSearchService.buildQuery(this.search, this.pagination.pageSize, this.pagination.currentPage).then((query) => {
            this.eventSearchService.search(query).then((data) => {
                this.searchResults = data.events;
                this.showNoResults = false;
                this.pagination.collectionSize = data.total;
                this.pagination.results = true;
                this.appService.stopLoadingBar();
            });
        });


    }

    runInit(): void {
        this.appService.startLoadingBar()

        this.searchService.results$.subscribe((data) => {
            this.parseResults(data);
        });

    }

    parseResults(data) {

        if (data.$exists()) {
            let cleanData: any;
            // TODO DROP THIS IF WHEN EVERYTHING IS THE SAME (RIGHT NOW THE NODE ONE AND C# ONE RETURN DIFFERENT TYPES)
            if (typeof data.$value === 'string') {
                cleanData = (JSON.parse(data.$value));
            } else {
                cleanData = data;
            }


            if (cleanData.data && cleanData.data.total > 0) {
                this.showNoResults = false;
                this.searchResults = cleanData.data.hits;
            } else {
                this.searchResults = [];
                this.showNoResults = true;
            }


            if (cleanData.data && cleanData.data.total > this.pagination.pageSize) {
                this.pagination.collectionSize = cleanData.data.total;
                this.pagination.results = true;
            } else {
                this.pagination.results = false;
            }
        }

        this.appService.stopLoadingBar();
    }

    getResults(): void {
        this.searchService.updateResults().then((data$) => {
            data$.subscribe((data) => {
                this.parseResults(data);
            });
        }, (err) => {
            console.log(err);
        });
    }

    changePage(page) {
        this.search.currentPage = page;
        this.searchResults = [];
        this.appService.scrollToTop();
        this.runSearch(true);
    }

    updateSearchURI() {

        let query = '';

        if (this.search.searchSet){
            query += '&q=' + encodeURI(this.search.search);
        }

        if (this.search.startDateSet){
            const date = moment.unix(this.search.startDate);
            const readableDate = moment(date).format('MM/DD/YY');
            query += '&startDate=' + encodeURI(readableDate);
        }

        if (this.search.endDateSet){
            const date = moment.unix(this.search.endDate);
            const readableDate = moment(date).format('MM/DD/YY');
            query += '&endDate=' + encodeURI(readableDate);
        }

        if (this.search.locationSet){
            query += '&location=' + encodeURI(this.search.location.address);
            query += '&range=' + encodeURI(this.search.location.range);
        }

        if (this.search.categories.length){

            // ONLY ONE FOR NOW
            for (const category of this.search.categories){
                query += '&category=' + encodeURI(category);
            }
        }

        query += '&page=' + encodeURI(this.search.currentPage.toString());

        // replace current page with updated data
        window.history.replaceState({}, '', '/search?' + query);

    }

    getSearchURI(): ISearchQuery {

            // IF NO PARAMS HOP OUT
            if (!Object.keys(this.params).length){
                return this.search;
            }

            this.URIcheckQ();
            this.URIcheckDates();
            this.URIcheckPage();
            this.URIcheckCategory();

            // THIS NEEDS TO BE AN IF ELSE SINCE IT WILL REQUIRE AN ASYNC CALL GO GET GPS COORDINATES
            if (typeof this.params.location !== 'undefined') {
                this.URICheckGeo().then(() => {
                    this.runSearch();
                });
            } else {
                this.runSearch();
            }
    }

    URIcheckPage() {
        if (typeof this.params.page !== 'undefined') {
            this.search.currentPage = parseInt(this.params.page);
        } else {
            this.search.currentPage = 1;
        }
    }

    URIcheckCategory() {
        if (this.params.category && this.params.category !== 'undefined') {
            this.category = this.params.category;
            /*let test = this.category.split(',');

            for(let test1 of test){
                this.search.categories.push(test1);
            }*/
            this.search.categories.push(this.category);

        }
    }

    URIcheckQ() {
        if (this.params.q && this.params.q !== 'undefined') {
            if (this.params.q !== '') {
                this.search.search = this.params.q;
                this.searchTerm = this.params.q;
                this.search.searchSet = true;
            }
        }
    }

    URIcheckDates() {
        if (typeof this.params.date !== 'undefined') {
            if (this.params.date !== '' || this.params.date !== 'all') {

                if (this.params.date === 'today') {
                    this.setToday();
                }else if (this.params.date === 'tomorrow') {
                    this.setTomorrow();

                }else if (this.params.date === 'next-week'){

                    this.setNextWeek();

                }else {
                    this.checkDatesDetailed();
                }
            }
        }else { // HAS TO BE EITHER OR
            this.checkDatesDetailed();
        }
    }

    checkDatesDetailed() {
        if (typeof this.params.startDate !== 'undefined') {

            const startDate = decodeURI(this.params.startDate + ' 12:00:00 AM');
            const momentStartDate = moment(startDate);
            const unixStartDate = moment(momentStartDate).unix();

            this.search.startDate = unixStartDate;
            this.startDateNew = moment(momentStartDate).format('YYYY-MM-DD');
            this.displayStartDate = moment(momentStartDate).format('MM/DD/YY');

            this.search.startDateSet = true;

        }

        if (typeof this.params.endDate !== 'undefined') {

            const endDate = decodeURI(this.params.endDate + ' 11:59:59 PM');
            const momentEndDate = moment(endDate);
            const unixEndDate = moment(momentEndDate).unix();

            this.search.endDate = unixEndDate;
            this.endDateNew = moment(momentEndDate).format('YYYY-MM-DD');
            this.displayEndDate = moment(momentEndDate).format('MM/DD/YY');

            this.search.endDateSet = true;
        }
    }

    // TEST IF VALID GPS
    validateGPS(splitLocation) {
        if (
            splitLocation[0] < 90.01 && splitLocation[0] > -90.01
            && splitLocation[1] < 180.01 && splitLocation[1] > -180.01
        ) {
            return true;
        }else {
            return false;
        }
    }

    URICheckGeo(): Promise<any> {

        const $this = this;
        return new Promise((resolve, reject) => {

            let gpsTest = false;
            const splitLocation = this.params.location.split(',');
            if (splitLocation.length === 2) {
                gpsTest = this.validateGPS(splitLocation);
            }

            if (!gpsTest) {
                this.search.location.text = this.params.location;
            } else {
                // reverse geocode
                this.setByReverse();
            }


            if (typeof this.params.range === 'undefined' || this.params.range === '' || this.params.location === '' || typeof this.params.location === 'undefined') {
                resolve();
            } else {

            }

            $this.search.location.range = $this.params.range;
            $this.search.locationSet = true;
            $this.search.location.address = this.params.location;

            $this.searchService.getGeoCode(this.params.location).subscribe((geo) => {
                const geocode = JSON.parse(geo._body);

                if (geocode.results.length){
                    $this.search.location.location = geocode.results[0].geometry.location;
                    resolve();
                } else{
                    $this.toasty.warning('Invalid location, please enter a city and state/province at minimum.');
                    resolve();
                }
            });
        });
    }

    setByReverse() {

      const $this = this;

      this.searchService.reverseGeoCode(this.search.location.location).subscribe((geo) => {

        const geocode = JSON.parse(geo._body);

        if (geocode.results.length){
          $this.search.location.location = geocode.results[0].geometry.location;
          $this.search.location.address = $this.search.location.text = geocode.results[0].formatted_address;
          $this.updateSearchURI();
          $this.runSearch();
        }else {
          $this.toasty.warning('Invalid location, please enter a city and state/province at minimum.');
        }
      });
    }

    setToday() {
        // SET START DATE
        const todayStart = moment().format('YYYY-MM-DD 12:00 AM');
        this.setBeginDate(todayStart);

        // SET END DATE
        const todayEnd = moment().format('YYYY-MM-DD 11:59 PM');
        this.setEndDate(todayEnd);
    }

    setTomorrow() {
        const tomorrow = moment().add(1, 'days');
        const start = moment(tomorrow).startOf('day');
        const end = moment(tomorrow).endOf('day');

        this.setBeginDate(start);
        this.setEndDate(end);

    }

    setNextWeek() {
        const nextWeek = moment().add('days', 7);
        const start = moment(moment().startOf('day'));
        const end = moment(nextWeek).endOf('day');

        this.setBeginDate(start);
        this.setEndDate(end);
    }

    ngAfterViewChecked() {
        if (!this.dateAttached){
            this.startDateNew = moment.unix(this.search.startDate).format('YYYY-MM-DD');
            if (this.search.endDate < 1999999999){
                this.endDateNew = moment.unix(this.search.endDate).format('YYYY-MM-DD');
            }
            setTimeout(() => this.attachDateTime(), 750);
            this.dateAttached = true;
        }
    }

    ngOnDestroy() {
        this.searchService.removeResults();
    }

    updateLocation() {

        this.search.location.range = `${this.search.location.rangeNum}${this.search.location.rangeType}`;

        this.searchService.getGeoCode(this.search.location.address).subscribe((geo) => {

            const geocode = JSON.parse(geo._body);

            if (geocode.results.length){
                this.search.locationSet = true;
                this.search.location.location = geocode.results[0].geometry.location;
                this.runSearch();
            }

        });

    }

    setEndDate(date) {
        const endDateNumber = moment(date).unix();
        this.endDateNew = moment(date).format('YYYY-MM-DD');
        this.search.endDate = endDateNumber;
        this.displayEndDate = moment(date).format('MM/DD/YY');
        this.search.endDateSet = true;
    }

    setBeginDate(date) {
        const startNumber = moment(date).unix();
        // let startDate:Date = moment(date).toDate;
        this.startDateNew = {year: date.year(), month: date.month(), day: date.day()};
        this.search.startDate = startNumber;
        this.displayStartDate = moment(date).format('MM/DD/YY');
        this.search.startDateSet = true;
    }

    updateDate(date) {
        // SET START DATE
        if (this.validateDate()) {
            const startDate = `${this.startDateNew.year}-${this.startDateNew.month}-${this.startDateNew.day}`;
            const endDate = `${this.endDateNew.year}-${this.endDateNew.month}-${this.endDateNew.day}`;
            this.search.startDate = moment(startDate).unix();

            if (this.search.startDate > 0) {
                this.search.startDateSet = true;
                this.displayStartDate = moment(startDate).format('MM/DD/YY');
            }

            // SET END DATE
            this.search.endDate = moment(endDate).unix();

            if (this.search.endDate > 0) {
                this.search.endDateSet = true;
                this.displayEndDate = moment(endDate).format('MM/DD/YY');
            }

            if (isNaN(this.search.startDate)) {
                this.search.resetStartDate();
            }

            if (isNaN(this.search.endDate)) {
                this.search.resetEndDate();
            }

            this.runSearch();
        }
    }

    removeSearch() {
        this.search.searchSet = false;
        this.search.search = '';
        this.runSearch();
    }

    addSearch() {
        this.search.search = this.searchTerm;
        this.search.searchSet = true;
        this.runSearch();
    }

    removeLocation() {
        this.search.locationSet = false;
        this.search.location.text = '';
        this.search.location.range = '';
        this.search.location.location.lat = 0;
        this.search.location.location.lng = 0;
        this.runSearch();
    }

    removeStartDate() {
        this.search.startDateSet = false;
        this.search.resetStartDate();
        this.startDateNew = '';
        this.runSearch();
    }

    removeEndDate() {
        this.search.endDateSet = false;
        this.search.resetEndDate();
        this.endDateNew = '';
        this.runSearch();
    }

    removeCategory(i) {
        this.search.categories.splice(i, 1);
        this.runSearch();
    }

    addCategory() {
        this.search.categories.push(this.category);
        this.runSearch();
    }

    addCreator() {
        this.search.creators = [];
        this.search.creators.push(this.creator);
        this.runSearch();
    }

    removeCreator(i) {
        this.search.creators.splice(i, 1);
    }

    removeEventType() {
        this.search.eventTypeSet = false;
        this.search.eventType = '';
    }

    removePrice() {
        this.search.priceSet = false;
        this.search.price = '';
    }

    attachDateTime() {
        const dateTimesCollection: HTMLCollectionOf<Element> = document.getElementsByClassName('datetimepicker');
        const datesCollection: HTMLCollectionOf<Element> = document.getElementsByClassName('datepicker');
        const timesCollection: HTMLCollectionOf<Element> = document.getElementsByClassName('timepicker');

        const dateTimes = Array.from(dateTimesCollection);
        const dates = Array.from(datesCollection);
        const times = Array.from(timesCollection);

    }

    makeVertical() {
        this.verticalCard = true;
    }

    makeHorizontal() {
        this.verticalCard = false;
    }

}

