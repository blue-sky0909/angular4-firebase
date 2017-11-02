import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'otime'})
export class OTimePipe implements PipeTransform {
    transform(value) {
        if(!value){
            return value;
        }
        else{
            let contrivedDate = '2012-12-12 '+value;
            return moment(contrivedDate).format('h:mmA');
        }
    }
}