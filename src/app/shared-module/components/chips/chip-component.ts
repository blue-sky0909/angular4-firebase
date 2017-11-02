import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'o-chip',
    styles: [

    ],
    template: `
        <span class="tag label label-info">
            <strong *ngIf="chipTitle.length">{{ chipTitle }}:</strong>
            {{ chipText }}
            <span data-role="remove" (click)="delete.emit(chipIndex)"></span>
        </span>
    `
})

export class OChipComponent {

    @Input() chipTitle:string = "";
    @Input() chipText:string;
    @Input() chipIndex:number;
    @Output() delete = new EventEmitter(false);

    constructor() {

    }

}
