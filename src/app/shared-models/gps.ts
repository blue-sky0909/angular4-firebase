export interface IGPS {
    lat: number;
    lng: number;
}

export class GPS implements IGPS{

    lat: number;
    lng: number;

    constructor(latitude?: number, longitude?: number) {
        this.lat = latitude;
        this.lng = longitude;
    }

}
