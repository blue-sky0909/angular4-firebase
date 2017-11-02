import {Component, Input, OnInit, Renderer, ElementRef, EventEmitter, Output} from '@angular/core';
import {ControlValueAccessor, CheckboxControlValueAccessor} from "@angular/forms";
import {CHECKBOX_VALUE_ACCESSOR} from "@angular/forms/src/directives/checkbox_value_accessor";

@Component({
    selector: 'custom-input-checkbox',
    styles: [
        ``
    ],
    template: `
        <input type="checkbox" [ngModel]="outputValue" (ngModelChange)="update()" />
    `
})

export class CustomInputCheckboxComponent implements OnInit{

    private outputValue:boolean;
    @Input() inputValue:boolean = false;
    @Output() inputValueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    public ngOnInit(){
        this.outputValue = this.inputValue;
    }

    update(){
        this.inputValueChange.emit(this.inputValue);
    }

}
