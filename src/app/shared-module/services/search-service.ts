import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable, EventEmitter} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {ISearchQuery} from '../../search/models/search-query';
import {Observable} from 'rxjs';
import {Http} from '@angular/http';
import {AppService} from '../../services/app-service';
import {IGPS, GPS} from '../../shared-models/gps';
import {IAccountContact} from '../../account/components/contact/contact-model';
import {AuthService} from '../../auth/services/auth-service';

@Injectable()
export class SearchService {

    queries$: FirebaseListObservable<any[]>;
    results$: FirebaseObjectObservable<any>;
    contact$: FirebaseObjectObservable<any>;
    sessionId: string;
    authSet = false;

    constructor(public af: AngularFireDatabase,
                public auth: AuthService,
                private http: Http,
                private appService: AppService) {
        this.queries$ = this.af.list(`/queries/search`);
        // USING SESSION ID SO MULTIPLE LOGINS

        if (this.auth.id) {
            this.setObjects();
        }
        else {
            this.auth.authObservable.first().subscribe(() => {
                this.setObjects();
            });
        }


    }

    setObjects() {
        this.contact$ = this.af.object(`contact/${this.auth.id}`);
        this.results$ = this.af.object(`/queries/results/${this.auth.id}/${this.appService.sessionId}`);
        console.log(this.auth.id);
        this.authSet = true;
    }

    initial(): Promise<any> {
        const $this = this;
        return new Promise((resolve, reject) => {
            $this.results$.first().subscribe((data) => {
                resolve(data);
            });
        });
    }

    getResults(): FirebaseObjectObservable<any> {
        return this.results$;
    }

    runUpdate(): Promise<any> {
        return new Promise((resolve, reject) => {
            let i = 0;
            const loop = setInterval(() => {
                if (this.authSet) {
                    this.results$.remove().then(() => {
                        clearInterval(loop);
                        resolve(this.getResults());
                    });
                    if (i > 100) {
                        clearInterval(loop);
                    }
                    i++;
                }
            }, 250);
        });
    }

    updateResults(): Promise<any> {
        return new Promise((resolve, reject) => {
            let i = 0;
            const loop = setInterval(() => {
                if (this.authSet) {
                    clearInterval(loop);
                    resolve(this.getResults());
                }
                if (i > 100) {
                    clearInterval(loop);
                }
                i++;

            }, 100);

        });
    }

    removeResults() {
        this.results$.remove();
    }

    // from is where in the results from
    buildQuery(search: ISearchQuery, size: number = 10, fromPage: number = 0, sortByGeo: boolean = false): any {

        console.log(JSON.stringify(search));

        const resultNum: number = (size * fromPage) - size;

        const query = {
            'query': {
                'bool': {
                    'must': {},
                    'must_not': [],
                    'filter': {
                        'bool': {
                            'must': [],
                            'should': []
                        }
                    }
                }
            },
            '_source': ['_id'],
            'size': size,
            'from': resultNum
        };

        if (!search.search || search.search.length == 0) {
            //use match all if there is no search term
            query.query.bool.must['match_all'] = {};
        }
        else {
            query.query.bool.must['multi_match'] = {
                'query': search.search,
                'fields': [
                    'title^2',
                    'description',
                    'keywords^3'
                ],
                'type': 'most_fields',
                'fuzziness': 'AUTO',
                'prefix_length': 3
            };
        }

        if (search.location.location.lat !== 0 && search.location.location.lng !== 0 && search.location.range !== '') {


            console.log(search.location.location);

            if (!sortByGeo) {
                const locationObject = {
                    'geo_distance': {
                        'distance': search.location.range,
                        'location': {
                            'lat': search.location.location.lat,
                            'lon': search.location.location.lng
                        }
                    }
                };
                query.query.bool.filter.bool.must.push(locationObject);
            }

            else {
                query['sort'] = [
                    {
                        'geo_distance': {
                            'location:': {
                                'lat': search.location.location.lat,
                                'lon': search.location.location.lng
                            },
                            'order': 'desc',
                            'unit': 'km',
                            'distance_type': 'plane'
                        }
                    }
                ];
            }

        }

        if (search.categories && search.categories.length > 0) {
            const categoryObj = {
                'terms': {
                    'category': []
                }
            };
            for (const category of search.categories) {
                categoryObj.terms.category.push(category);
            }
            query.query.bool.filter.bool.must.push(categoryObj);
        }

        if (search.creators && search.creators.length > 0) {
            const creatorObj = {
                'match': {
                    'creator': search.creators[0]
                }
            };

            query.query.bool.filter.bool.must.push(creatorObj);
        }

        const statusBool =  {
                'terms': {
                    'liveStatus': ['cancelled', 'closed']
                }
        };


        query.query.bool.must_not.push(statusBool);

        //BUILD DATE SECTION OF QUERY
        const startDateRange = {
            'range': {
                'startDate': {
                    'gte': search.startDate,
                    'lte': search.endDate
                }
            }
        };

        const endDateRange = {
            'range': {
                'endDate': {
                    'gte': search.startDate,
                    'lte': search.endDate
                }
            }
        };

        const middleDateRange = {
            'bool': {
                'should': [
                    {
                        'bool': {
                            'must': [
                                {
                                    'range': {
                                        'startDate': {
                                            'lte': search.startDate
                                        }
                                    }
                                },
                                {
                                    'range': {
                                        'endDate': {
                                            'gte': search.startDate
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        'bool': {
                            'must': [
                                {
                                    'range': {
                                        'startDate': {
                                            'lte': search.endDate
                                        }
                                    }
                                },
                                {
                                    'range': {
                                        'endDate': {
                                            'gte': search.endDate
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };

        query.query.bool.filter.bool.should.push(startDateRange);
        query.query.bool.filter.bool.should.push(endDateRange);
        query.query.bool.filter.bool.should.push(middleDateRange);

        const addQuery = {
            'query': query,
            'uid': this.auth.id,
            'sessionId': this.appService.sessionId
        };

        const queryStringified: string = JSON.stringify(addQuery);

        console.log(queryStringified);

        return this.queries$.push(queryStringified);

    }

    getGeoCode(address): Observable < any > {
        const key = 'AIzaSyCXlzLSm5F9D0W16PcX-FQQGi9W51E2SLM';
        let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&address=`;
        url = url + encodeURIComponent(address);
        return this.http.get(url);
    }

    reverseGeoCode(gps): Observable <any>{
      const key = 'AIzaSyCXlzLSm5F9D0W16PcX-FQQGi9W51E2SLM';
      let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&latlng=`;
      url = url + encodeURIComponent(gps);
      return this.http.get(url);
    }

    getCurrentLocation(): Promise <any>{
        return new Promise((resolve, reject) => {
            if (this.appService.locationSet){
                resolve(this.appService.location);
            }
            else{
                this.appService.locationEmitter.first().subscribe(() => {
                    resolve(this.appService.location);
                });
            }
        });
    }

}


//correct query
/*

 {
 "query": {
 "bool": {
 "must": {
 "match_all": {

 }
 },
 "filter": {
 "bool": {
 "must": [
 {
 "geo_distance": {
 "distance": "40mi",
 "location": {
 "lat": 44.52634219999999,
 "lon": -109.0565308
 }
 }
 }
 ],
 "should": [
 {
 "range": {
 "startDate": {
 "gte": 1484722800,
 "lte": 1999999999
 }
 }
 },
 {
 "range": {
 "endDate": {
 "gte": 1484722800,
 "lte": 1999999999
 }
 }
 },
 {
 "bool": {
 "should": [
 {
 "bool": {
 "must": [
 {
 "range": {
 "startDate": {
 "lte": 1484722800
 }
 }
 },
 {
 "range": {
 "endDate": {
 "gte": 1484722800
 }
 }
 }
 ]
 }
 },
 {
 "bool": {
 "must": [
 {
 "range": {
 "startDate": {
 "lte": 1999999999
 }
 }
 },
 {
 "range": {
 "endDate": {
 "gte": 1999999999
 }
 }
 }
 ]
 }
 }
 ]
 }
 }
 ]
 }
 }
 }
 },
 "_source": [
 "_id"
 ],
 "size": 10,
 "from": 0
 }


 */

