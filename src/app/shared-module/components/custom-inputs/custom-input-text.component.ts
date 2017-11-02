import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'custom-input-text',
    styles: [
        ``
    ],
    template: `
        <input type="text" class="form-control" [(ngModel)]="outputValue" required="required">
    `
})

export class CustomInputTextComponent implements OnInit{

    private outputValue:string;
    @Input() inputValue:string;
    @Input() required:boolean = false;

    public ngOnInit(){
        this.outputValue = this.inputValue;
    }

}
