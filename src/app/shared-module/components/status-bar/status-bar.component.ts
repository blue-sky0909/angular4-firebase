import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';

@Component({
    selector: 'status-bar',
    styles: [
        `
            
            div{border:1px solid #d7d7d7;border-radius:2px;}
            
            table{
                width:100%;
                border:1px solid #fff;
                padding:0;
                margin:0;
                height:8px;
            }
            
            table td.first{            
                background-color:#32c5d2;                
            }
            
        `
    ],
    template: `
        <div>
            <table>
                <tbody>
                    <tr>
                        <td [width]="percentage*100+'%'" class="first"></td>
                        <td [width]="opposite*100+'%'"></td>
                    </tr>                
                </tbody>
            </table>
        </div>
        
    `
})

export class StatusBarComponent implements OnInit{

    @Input() percentage:number;
    opposite:number;

    constructor() {

    }

    ngOnInit(){
        this.opposite = 1-this.percentage;
    }

}
