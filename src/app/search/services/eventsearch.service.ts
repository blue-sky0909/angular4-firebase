import {Client} from 'elasticsearch';
import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs';
import {AppService} from '../../services/app-service';
import {EventService} from '../../shared-module/services/event-service';
import {OEvent, IoEvent} from '../../shared-models/oevent';
import {ISearchQuery} from '../models/search-query';


@Injectable()
export class EventsearchService
{
    private _client: Client;

    constructor(private eventService: EventService,
                private http: Http,
                private appService: AppService
    ) {
        if (!this._client) {
            this._connect();
        }
    }
    private _connect() {
        this._client = new Client({
            host: `https://${this.appService.environment.SEARCH_LIVE_EVENTS.access_key_name}:${this.appService.environment.SEARCH_LIVE_EVENTS.key}@${this.appService.environment.SEARCH_LIVE_EVENTS.url}/${this.appService.environment.SEARCH_LIVE_EVENTS.index}`
        });
    }

    search(query: any): Promise<any> {
        const self = this;
        return new Promise((resolve, reject) => {
            const events: Array<IoEvent> = new Array<OEvent>();
            self._client.search(query).then(function (body) {
                if (body && body.hits && body.hits.hits) {
                    const hits = body.hits.hits;
                    hits.forEach((item, index) => {
                        self.eventService.getLiveEventById(item._id).subscribe((data) => {
                            const event: IoEvent = data;
                            events.push(event);
                        });
                    });
                    const searchResult = {
                        events: events,
                        total: body.hits.total
                    };
                    resolve(searchResult);
                }
            }, function (error) {
                console.trace(error.message);
            });
        });
    }

    buildQuery(search: ISearchQuery, size: number = 10, fromPage: number = 0, sortByGeo: boolean = false): Promise<any> {
        const resultNum: number = (size * fromPage) - size;
        const query = {
            'query': {
                'bool': {
                    'must': {},

                    'filter': {
                        'bool': {
                            'must': [],
                            'should': []
                        }
                    }
                }
            },
        };

        if (!search.search || search.search.length == 0) {
            // use match all if there is no search term
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


        //query.query.bool.must_not.push(statusBool);

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


        const queryWithPagination = {
            'from': resultNum,
            'size': size,
            'body': query
        };

        return new Promise((resolve, reject) =>
        {
            resolve(queryWithPagination);
        });

    }

    getGeoCode(address): Observable < any > {
        const key = 'AIzaSyCXlzLSm5F9D0W16PcX-FQQGi9W51E2SLM';
        let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${key}&address=`;
        url = url + encodeURIComponent(address);
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
