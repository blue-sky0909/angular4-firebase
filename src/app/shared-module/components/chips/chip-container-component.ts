import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'o-chip-container',
    styles: [

    ],
    template: `
        <div class="bootstrap-tagsinput no-input">
            <ng-content></ng-content>
        </div>        
    `
})

export class OChipContainerComponent {

    @Input() text: boolean;
    @Output() delete = new EventEmitter(false);

    constructor() {

    }

}
