import {Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {AppService} from '../../../services/app-service';
import {AuthService} from '../../../auth/services/auth-service';
import {ToastyService} from 'ng2-toasty';
import {CreateEventService} from '../../services/create-event.service';
import {CropperSettings, ImageCropperComponent} from 'ng2-img-cropper';
import {CropModalComponent} from '../../../shared-module/components/crop-modal/crop-modal.component';
import {ImageCropService} from '../../../shared-module/services/image-crop.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FirebaseApp} from 'angularfire2';

@Component({
    selector: 'event-image',

    template: `

        <!-- npm install ng2-file-upload --save  NEED TO TRY THIS NEXT -->

        <label>Event Image</label>

        <div class="form-group row">
            <div class="col-md-3">
                <div>
                    <span class="btn btn-primary btn-lg btn-file margin-vertical">
                        Upload Photo <i class="fa fa-camera"></i> <input (change)="fileChangeListener($event)" type="file">
                    </span>
                    <div *ngIf="!createService.isFieldValid('image')" class="validation-error-text">{{createService.fieldValidations.get("image").errorMessage}}</div>
                </div>
                <div>
                  <button class="btn default-button" (click)="defaultSelected()">use default image</button>
                </div>
            </div>
            <div class="col-md-9">
                <div style="min-height:50px;margin-top:15px;">
                    <img [src]="imageURL" class="img-fluid" *ngIf="imageSet">
                </div>
            </div>

        </div>
        <div *ngIf="defaultImageSelected">
            <label>Select Image</label>
            <div class="default-wrapper">
                <div *ngFor="let path of imgSrcs" class="image-row col-md-3">
                    <div class="padding-view">
                        <img id="default" class="image-item img-fluid" [src]="path" alt="" (click)="selectedDefault($event.target)"/>
                    </div>
                </div>
            </div>
        </div>
        <br /><br />
    `,
    styles: [
        `
            :host{
                display:block;
            }
            .default-button {
                background-color:transparent !important;
                border-color:transparent;
                background-image:none;
                box-shadow:none;
                color: #26C6DA;
                margin-left: 25px;
            }
            .image-row {
                display: inline-block;
            }
            .padding-view {
                padding-top: 10px;
            }
            .image-item{
              cursor:pointer;
            }
            .custom-border {
                border: 2px solid #26C6DA;
            }
            .default-wrapper{
              height: 370px;
              overflow: scroll;
              padding:25px 0;
            }
        `
    ]

})

export class EditImageComponent implements OnInit{

    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;
    imageSet = false;
    imageURL = '';
    cropperSettings: CropperSettings;
    defaultImageSelected = false;
    imgSrcs: any[];
    @Output() imagePath = new EventEmitter();

    constructor(private auth: AuthService,
                private appService: AppService,
                private toasty: ToastyService,
                private modalService: NgbModal,
                private imageCropService: ImageCropService,
                public createService: CreateEventService,
                private app: FirebaseApp ) {
        this.imgSrcs = [];
    }

    fileChangeListener($event) {
        this.imageSet = false;
        const file: File = $event.target.files[0];
        this.imageCropService.file = file;
        this.imageCropService.setPorportions(273, 175);
        this.auth.imageContentType = file.type;

        setTimeout(() => {this.modalService.open(CropModalComponent); }, 100);

        // tslint:disable-next-line:no-shadowed-variable
        this.imageCropService.triggerUpload.first().subscribe((file) => {
          this.uploadFileDirect(file);
        });

    }

    ngOnInit(){
        // this.getImage();
        this.getDefaultImages();
        if(this.createService.draft.imagePath != ''){
            this.imageURL = this.createService.draft.imagePath;
            this.imageSet = true;
        } else{
            this.imageURL = '';
            this.imageSet = false;
        }

        this.createService.saveChanges.subscribe(
            data => {
                this.getDefaultImages();
                if(this.createService.draft.imagePath != ''){
                    this.imageURL = this.createService.draft.imagePath;
                    this.imageSet = true;
                } else{
                    this.imageURL = '';
                    this.imageSet = false;
                }
            }
        )

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // HANDLE MAIN FILE UPLOAD AND SET IMAGESET PROPERTY TO TRUE AFTER UPLOAD
    // -----------------------------------------------------------------------------------------------------------------------
    uploadFileDirect(file) {
        const $this = this;
        let longEnough = false;
        const path = `eventImage/${this.createService.eventId}`;

        this.appService.startLoadingBar();
        setTimeout(() => { longEnough = true; }, 700);

        this.auth.uploadFileDirect(file, path).subscribe((data) => {
            $this.createService.draft.imagePath = $this.imageURL = data.downloadURL;
            // $this.createService.draftObject$.update({imagePath: data.downloadURL});
            this.imagePath.emit(data.downloadURL);
            $this.imageSet = true;
            $this.toasty.success({
                title: 'Image uploaded and saved',
                msg: 'Image uploaded and saved successfully!'
            });
        //     if(this.createService.validateLive()){
        //       if(this.createService.isLive()){
        //           this.createService.publish();
        //       }
        //   }

            $this.appService.updateProfile();

            if (longEnough) {
                $this.appService.stopLoadingBar();
            } else {
                setTimeout(() => { $this.appService.stopLoadingBar(); }, 500);
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // GET IMAGE PATH
    // -----------------------------------------------------------------------------------------------------------------------
    getImage() {
        const path = `eventImage/${this.createService.eventId}`;
        this.auth.getFile(path).then((success) => {
            this.imageURL = success;
            this.imageSet = true;
        }, (error) => {
            // BASICALLY NO IMAGE UPLOADED SO DO NOTHING
        });
    }

    getDefaultImages() {
        const $this = this;
        const query = this.app.database().ref('defaultImages').orderByChild('priority');
        query.once('value')
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                const key = childSnapshot.key;
                const childData = childSnapshot.val();
                $this.imgSrcs.push(childData.url);
            });
        });
    }

    defaultSelected() {
        this.imageSet = false;
        this.defaultImageSelected = !this.defaultImageSelected;
    }

    selectedDefault(event) {
        this.defaultImageSelected = false;
        this.imageSet = true;
        this.imageURL = event.src;
        // this.createService.draftObject$.update({imagePath: event.src});
        this.imagePath.emit(event.src);
    }

}
