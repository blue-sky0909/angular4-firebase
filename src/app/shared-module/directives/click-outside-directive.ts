import {Directive, ElementRef, Input, Renderer, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[ClickTarget]',
    host: {
        "(document: click)": "handleClick( $event )"
    }
})

export class ClickTargetDirective {

    @Output() ClickOutside = new EventEmitter(false);
    @Input() Open;

    constructor(public el: ElementRef, renderer: Renderer) {
        renderer.setElementStyle(el.nativeElement, 'backgroundColor', 'yellow');
    }

    handleClick(event){
        if (this.Open == true && !this.el.nativeElement.contains(event.target)) {
            this.ClickOutside.emit();
        } // or some similar check
    }

}