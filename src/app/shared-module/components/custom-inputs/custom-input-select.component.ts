import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor} from "@angular/forms";

@Component({
    selector: 'custom-input-select',
    styles: [
        ``
    ],
    template: `
        <select class="form-control" [(ngModel)]="outputValue" required="required">
            <option></option>
            <option *ngFor="let value of values" [attr.value]="value.value">{{ value.label }}</option>
        </select>
    `
})

export class CustomInputSelectComponent implements OnInit{

    private outputValue:string;
    @Input() inputValue:string;
    @Input() required:boolean = false;
    @Input() values:any[] = [];

    public ngOnInit(){
        this.outputValue = this.inputValue;
    }

}
