import {Component, Input, OnInit, EventEmitter, Output, OnChanges, SimpleChange} from '@angular/core';


@Component({
    selector: 'o-page',
    styles: [
        `
            .c-content-pagination>li{margin-left:4px;}
        `
    ],
    template: `
        <ul class="c-content-pagination c-square c-theme pull-right">
            
            <li class="c-prev"  [style.opacity]="getPrevOpacity()">
                <a (click)="prevPage()">
                    <i class="fa fa-angle-left"></i>
                </a>
            </li>
            
            <li *ngFor="let page of pages; let i = index" [hidden]="i==0" [ngClass]="{'c-active' : page == currentPage}">
                <a (click)="pageClick(page)">{{page}}</a>
            </li>
            
            <li class="c-next">
                <a (click)="nextPage()" [style.opacity]="getNextOpacity()">
                    <i class="fa fa-angle-right"></i>
                </a>
            </li>
        </ul>
    `
})

export class OPageComponent implements OnInit, OnChanges{

    @Input() page:number;
    @Input() pageSize:number;
    @Input() collectionSize:number;
    @Input() currentPage:number;

    @Output() pageChange = new EventEmitter();
    pages:number[] = [];
    pageTotal:number;

    constructor() {

    }

    ngOnInit(){
        this.calculateValues();
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        this.calculateValues();
    }

    calculateValues(){
        this.pageTotal = Math.ceil(this.collectionSize / this.pageSize);

        for(let i=0;i<=this.pageTotal;i++){
            if(i!=0){
                this.pages[i] = i;
            }

        }
    }

    pageClick(page){
        if(page !== this.currentPage){
            this.currentPage = page;
            this.pageChange.emit(page);
        }
    }

    nextPage(){
        if(this.currentPage < this.pageTotal){
            this.pageChange.emit(this.currentPage + 1);
        }
    }

    prevPage(){
        if(this.currentPage > 1){
            this.pageChange.emit(this.currentPage - 1);
        }
    }

    getNextOpacity(){
        let opacity = 1;
        if(!(this.currentPage < this.pageTotal)){
            opacity = .25;
        }
        return opacity;
    }

    getPrevOpacity(){
        let opacity = 1;
        if(this.currentPage < 2){
            opacity = .25;
        }
        return opacity;
    }

}
