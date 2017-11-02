import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'timezone-select',
  styles: ['body'],
  templateUrl: './timezone-select.component.html'
})

export class TimezoneSelectComponent  {
    @Input() timeZone:string;
    @Input() required:boolean = false;
    @Output() timeZoneChange:EventEmitter<String> = new EventEmitter<String>();

    constructor() {
    }

    onChange(select){
      this.timeZone = select.value;
      this.timeZoneChange.next(this.timeZone);
    }
}
