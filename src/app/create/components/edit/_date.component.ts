import { Component, AfterContentInit, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {AppService} from "../../../services/app-service";
import {AuthService} from "../../../auth/services/auth-service";
import {ToastyService} from "ng2-toasty/index";
import {IDraftDate, DraftDate, IRecurring, Recurring, RecurringWeekly, DayTime, IMultiDay,MultiDay} from "../../models/date.models";
import * as moment from 'moment';
import {Route, Router, ActivatedRoute} from "@angular/router";
import {IGroomedDate, GroomedDate} from "../../models/date.models";
import {CreateEventDateService} from "../../services/create-date.service";
import {CreateEventService} from "../../services/create-event.service";
import {FieldValidation} from "../../../../assets/common/validation/field-validation";

@Component({
    selector: 'event-date',

    templateUrl: './_date.component.html',
    styles: [
        `
           .input-group .fa-calendar{
                cursor:pointer;
           }
        `
    ]


})

export class EditDateComponent{

    //INITIATE DATE OBJECT
    values: IDraftDate = new DraftDate();
    //INITIAL CUSTOM OBJECT THAT ADDS TO AN ARRAY OF TIMES
    custom: IMultiDay = new MultiDay();
    //KEEP TRACK OF NUMBER EVENTS TO BE CREATED
    events: number[] = [];
    showLength:boolean = false;
    //KEEP TRACK OF EVENT THIS MONTH
    monthEvents: number[] = [];

    @Output() draftDate = new EventEmitter();
    @Output() initial = new EventEmitter();
    initialDate = false;
    constructor(
                public auth: AuthService,
                public toasty: ToastyService,
                public appService: AppService,
                public dateService: CreateEventDateService,
                private createEventService: CreateEventService,
                private router: Router){


        //MOST OF THE TIME IT WILL BE SET SINCE THERE IS AN *ngIf FOR THE EVENT TO BE LOADED
        if(this.dateService.localDateObjectSet){
            this.dateService.dateObject$.subscribe((values:IDraftDate)=> {
                this.setValues(values);
                this.createEventService.draftObject$.subscribe(data => {
                    if(data.status == 'draft'){
                        this.saveTheDate();
                        this.initialDate = false;
                    } else if(data.status == 'active'){
                        this.saveTheDate();
                        this.initialDate = true;
                    } else{
                        this.initialDate = false;
                    }
                });
            });
        }
        else{
            //WAIT FOR THE SERVICE TO SET THE DATE OBJECT THEN SET VALUES WHEN THE SERVICE SAYS TO
            this.dateService.dateObjectSetEmitter.subscribe(()=>{
                this.dateService.dateObject$.subscribe((values:IDraftDate)=> {
                    this.setValues(values);
                    this.createEventService.draftObject$.subscribe(data => {
                        if(data.status == 'draft'){
                            this.saveTheDate();
                            this.initialDate = false;
                        } else if(data.status == 'active'){
                            this.saveTheDate();
                            this.initialDate = true;
                        } else{
                            this.initialDate = false;
                        }
                    });
                });
            });
        }

        this.createEventService.saveChanges.subscribe(
            data => {
                if(!data){
                    if(this.dateService.localDateObjectSet){
                        this.dateService.dateObject$.subscribe((values:IDraftDate)=> {
                            this.setValues(values);
                            this.saveTheDate();
                        });
                    }
                    else{
                        //WAIT FOR THE SERVICE TO SET THE DATE OBJECT THEN SET VALUES WHEN THE SERVICE SAYS TO
                        this.dateService.dateObjectSetEmitter.subscribe(()=>{
                            this.dateService.dateObject$.subscribe((values:IDraftDate)=> {
                                this.setValues(values);
                                this.saveTheDate();
                            });
                        });
                    }
                }
            }
        )

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // KEEP AS ITS OWN FUNCTION TO TRIGGER OTHER FUNCTIONS IF NEEDED
    // -----------------------------------------------------------------------------------------------------------------------
    setValues(values:IDraftDate){

        this.values = values;
        this.showEventsLength();

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // TRIGGER SAVE ON DATE TYPE SELECTED
    // -----------------------------------------------------------------------------------------------------------------------
    onSelectType(){

        setTimeout(()=> {//FOR SOME REASON THE PRIOR VALUE WAS LOADING SO A LITTLE TIME WAS ADDED
            let values:IDraftDate = new DraftDate();
            values.eventType = this.values.eventType;

            if(this.values.eventType === "singleDay"){
                values.single = this.values.single;
            }
            else if (this.values.eventType === "multiDay"){
                values.multi = this.values.multi;
            }
            else if (this.values.eventType === "recurring"){
                values.recurring = this.values.recurring;
            }
            else if (this.values.eventType === "course"){
                values.course = this.values.course;
            }
            else if (this.values.eventType === "custom"){
                values.custom = this.values.custom;
            }

        }, 200);
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // TRIGGER SAVE ON CHANGING RECURRING CYCLE TYPE
    // -----------------------------------------------------------------------------------------------------------------------
    onSelectCycle(){
        this.showEventsLength();
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // CUSTOM DATES FUNCTIONS
    // -----------------------------------------------------------------------------------------------------------------------
    addCustom(){

        if(typeof this.values.custom === "undefined"){
            this.values['custom'] = [new MultiDay()];
        }
        else{
            this.values.custom.push(new MultiDay());
        }

        let date = new Date();

        this.custom.start.date = {
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
        };

        this.custom.end.date = {
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
        };

        this.custom.end.time = {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: 0
        };

        this.custom.start.time = {
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: 0
        };

    }

    deleteCustom(index){
        this.values.custom.splice( index, 1 );
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // TOGGLE VALUES (FOR BUTTON GROUPS ON THE DATE PAGE)
    // -----------------------------------------------------------------------------------------------------------------------
    toggleDayValue(key, period = 'weekly'){

        if(period === 'weekly') {
            if(this.values.recurring.weekly.days[key]) {
                this.values.recurring.weekly.days[key] = false;
            } else {
                this.values.recurring.weekly.days[key] = true;
            }

            this.showEventsLength();
        }
        else if (period === 'biweekly'){
            if(this.values.recurring.biweekly.days[key]) {
                this.values.recurring.biweekly.days[key] = false;
            } else {
                this.values.recurring.biweekly.days[key] = true;
            }

            this.showEventsLength();
        }
        else if (period === 'courseWeekly'){
            if (this.values.course.weekly.days[key]) {
                this.values.course.weekly.days[key] = false;
            } else {
                this.values.course.weekly.days[key] = true;
            }
        }
        else if (period === 'courseBiweekly'){
            if (this.values.course.biweekly.days[key]) {
                this.values.course.biweekly.days[key] = false;
            } else {
                this.values.course.biweekly.days[key] = true;
            }
        }
        else if (period === 'monthDay'){

            if (this.values.recurring.monthlyDay.repeatOnDays[key]) {
                this.values.recurring.monthlyDay.repeatOnDays[key] = false;
            } else {
                this.values.recurring.monthlyDay.repeatOnDays[key] = true;
            }

            this.showEventsLength();

        }
        else if(period === 'monthlyWeek'){

            if (this.values.recurring.monthlyDay.repeatOnWeeks[key]) {
                this.values.recurring.monthlyDay.repeatOnWeeks[key] = false;
            } else {
                this.values.recurring.monthlyDay.repeatOnWeeks[key] = true;
            }

            this.showEventsLength();

        }
        else if(period === 'courseMonthDay'){
            if (this.values.course.monthlyDay.repeatOnDays[key]) {
                this.values.course.monthlyDay.repeatOnDays[key] = false;
            } else {
                this.values.course.monthlyDay.repeatOnDays[key] = true;
            }
        }
        else if(period === 'courseMonthlyWeek'){
            if (this.values.course.monthlyDay.repeatOnWeeks[key]) {
                this.values.course.monthlyDay.repeatOnWeeks[key] = false;
            } else {
                this.values.course.monthlyDay.repeatOnWeeks[key] = true;
            }
        }

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // MAIN ACTION WHEN SAVING // TRACK IF USER HITS SAVE AND CONTINUE WITH toNext bool
    // -----------------------------------------------------------------------------------------------------------------------
    saveTheDate(toNext?:boolean, exit:boolean = false, initial?){
        setTimeout(()=> {//FOR SOME REASON THE PRIOR VALUE WAS LOADING SO A LITTLE TIME WAS ADDED

            //STUB OUT A CLEAN VARIABLE WITHOUT THE FUNCTIONS ETC... THAT COME WITH FB OBJECT
            let values:IDraftDate = new DraftDate();

            //INIT OBJECT THAT WILL CONTAIN READABLE DATE AND TIME INFORMATION
            let groomedDate:IGroomedDate = new GroomedDate("", "", 0, 0);

            values.eventType = this.values.eventType;

            //----SINGLE DAY-----
            if(this.values.eventType === "singleDay"){
                values.single = this.values.single;
                groomedDate = this.dateService.groomDate(this.values.single, "single");
                let enddate = new Date(this.values.single.date.year + "-" + this.values.single.date.month + "-" + this.values.single.date.day + "T" + this.values.single.end.hour + ":0" + this.values.single.end.minute + ":00");
                console.log("this one", enddate.getTime());
                this.createEventService.setDateTime(groomedDate,this.values.eventType, enddate.getTime());
            }

            //----MULTI DAY-----
            else if (this.values.eventType === "multiDay"){
                values.multi = this.values.multi;
                groomedDate = this.dateService.groomDate(this.values.multi, "multi");
                let enddate = new Date(this.values.multi.end.date.year + "-" + this.values.multi.end.date.month + "-" + this.values.multi.end.date.day + "T" + this.values.multi.end.time.hour + ":0" + this.values.multi.end.time.minute + ":00");
                this.createEventService.setDateTime(groomedDate,this.values.eventType, enddate.getTime());
            }

            //----- SET OF RECURRING TYPES ----
            else if (this.values.eventType === "recurring"){
                values.recurring = this.values.recurring;

                //---- RECURRING WEEKLY ----

                if(this.values.recurring.type === 'weekly'){
                    groomedDate = this.dateService.groomDate(this.values.recurring.weekly, "weekly");
                }

                //---- RECURRING BIWEEKLY ----
                if(this.values.recurring.type === 'biweekly'){
                    groomedDate = this.dateService.groomDate(this.values.recurring.biweekly, "biweekly");
                }

                //---- RECURRING MONTHLY DATE ----
                else if (this.values.recurring.type === "monthly-date"){
                    groomedDate = this.dateService.groomDate(this.values.recurring.monthlyDate, "monthly-date");
                }

                //---- RECURRING MONTHLY DAY ----
                else if (this.values.recurring.type === 'monthly-day'){
                    groomedDate = this.dateService.groomDate(this.values.recurring.monthlyDay, "monthly-day");
                }

            }

            //---- COURSE (SIMILAR TO RECURRING) ----
            else if(this.values.eventType === "course"){
                values.course = this.values.course;

                //---- COURSE WEEKLY ----
                if(this.values.course.type === 'weekly'){
                    groomedDate = this.dateService.groomDate(this.values.course.weekly, "weekly");
                }

                //---- COURSE BIWEEKLY ----
                if(this.values.course.type === 'biweekly'){
                    groomedDate = this.dateService.groomDate(this.values.course.biweekly, "biweekly");
                }

                //---- COURSE MONTHLY DATE ----
                else if (this.values.course.type === "monthly-date"){
                    groomedDate = this.dateService.groomDate(this.values.course.monthlyDate, "monthly-date");
                }

                //---- COURSE MONTHLY DAY ----
                else if (this.values.course.type === 'monthly-day'){
                    groomedDate = this.dateService.groomDate(this.values.course.monthlyDay, "monthly-day");
                }
            }

            //----- CUSTOM ----
            else if(this.values.eventType == "custom"){
                values.custom = this.values.custom;
                groomedDate = this.dateService.groomDate(this.values.custom, "custom");
            }

            // To show error message
            this.createEventService.validateDate();
            this.createEventService.validateTime();
            
            // Exporting the date value
            this.draftDate.emit({date: groomedDate, value: this.values});
            this.initial.emit(this.initialDate);
            this.initialDate = false;
            // if(this.createEventService.validateLive()){
            //   if(this.createEventService.isDateValid()){
            //     this.createEventService.draftObject$.update({date: groomedDate.dateString, time:groomedDate.timeString, dateType:this.values.eventType, startDate:groomedDate.startDate, endDate:groomedDate.endDate}).then((data)=>{
            //       this.dateService.dateObject$.update(values)
            //       .then((data)=>
            //         {//USING SET HERE TO DELETE OLD DATA IF CHANGED
            //             this.createEventService.showSavedDraft();
            //         }, (err)=> {
            //             this.toasty.error("Error updating time: " + err);
            //         })
            //       }, (err)=>{
            //           this.toasty.error("Error updating time: " + err);
            //       });
            //       if(this.createEventService.isLive()){
            //           //this.createEventService.publish();
            //       }
            //   }
            // }

        }, 200);
    }

    //GET THE RESULTING NUMBER OF TOTAL EVENTS BEING CREATED
    showEventsLength(){

        //TODO FIGURE OUT HOW TO FIND THE DIGEST CYCLE WHEN THE INPUT HAS UPDATED THE MODEL
        setTimeout(()=>{

            this.events = this.dateService.getDates(this.values);
            this.monthEvents = this.dateService.eventsThisMonth(this.events);

            if(typeof this.events !== "undefined"){
                if(this.events.length > 1){
                    this.showLength = true;
                }
                else{
                    this.showLength = false;
                }
            }

        }, 100);



    }


}
