import {Component, ViewChild, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {ImageCropService} from '../../services/image-crop.service';
import {AuthService} from '../../../auth/services/auth-service';
import {AppService} from '../../../services/app-service';
import { Ng2ImgMaxService } from 'ng2-img-max';
import {dataURLtoBlob} from 'blueimp-canvas-to-blob';

@Component({
    selector: 'email-popup',
    styles: [
        `

        `
    ],
    template: `

            <div ngbModalContainer>
                <div class="modal-body" style="padding:8%;padding-bottom:30px;" >

                    <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()" style="margin:15px 3px;"><span aria-hidden="true">×</span></button>

                    <h3 class="line">
                        Crop Image
                    </h3>

                    <div class="modal-body">
                        <div class="row">
                            <!-- CONTENT -->
                            <div class="col-md-12">
                                <h5>Crop and resize:</h5>
                                <div style="width:100%">
                                    <img-cropper #cropper [image]="data" [settings]="cropperSettings"></img-cropper>
                                </div>
                            </div>
                        </div>
                        <div class="alert-text">
                            <p class='small-text' *ngIf="showAlertText">Image is too small</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" (click)="triggerUpload()"><i class="fa fa-check"></i> Upload Image</button>
                        <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
                    </div>

                    <img [src]="data.image" *ngIf="data.image" id="dimensions" style="width:0;height:0;"/>
                </div>
            </div>

    `
})
export class CropModalComponent implements OnInit {

    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;
    cropperSettings: CropperSettings;
    data: any;
    @ViewChild('image', undefined)
    image: any;
    showAlertText =  false;


    constructor(public activeModal: NgbActiveModal,
                private imageCropService: ImageCropService,
                private ng2ImgMax: Ng2ImgMaxService,
                private auth: AuthService,
                private appService: AppService) {

        this.data = {};
    }

    ngOnInit() {
        this.cropperSettings = this.imageCropService.cropperSettings;
        this.render(this.imageCropService.file);
    }

    render(file) {
        const image: any = new Image();
        const myReader: FileReader = new FileReader();
        const $this = this;
        // let longEnough = false;
        // this.appService.startLoadingBar();
        // setTimeout(() => { longEnough = true; }, 700);
        console.log('render start');
        myReader.onloadend = function (loadEvent: any) {
            image.src = loadEvent.target.result;
            $this.cropper.setImage(image);
            console.log('render end');
            // if (longEnough){
            //     $this.appService.stopLoadingBar();
            // } else{
            //     setTimeout(() => { $this.appService.stopLoadingBar(); }, 500);
            // }
        };

        myReader.readAsDataURL(file);
    }

    triggerUpload() {
        const $this = this;
        const image = document.getElementById('dimensions') as HTMLImageElement;
        const width = image.naturalWidth;
        const minWidth = 900;
        const maxWidth = 1200;

        if (minWidth < width && width < maxWidth ) {
            setTimeout(() => {
                this.imageCropService.triggerUpload.emit(this.data);
            }, 100);
            this.activeModal.dismiss();
        }else {
            if (minWidth > width) {
                this.showAlertText = true;
            }else {
                // ENFORCE IMAGE SIZES when the image is too large
                const randomFileName = new Date().getTime();
                const base64String = image.src;
                this.urltoFile(base64String, randomFileName, this.auth.imageContentType)
                .then(function(file){
                    $this.ng2ImgMax.resizeImage(file, 1200, 769).subscribe(
                        result => {
                            const reader = new FileReader();
                            reader.readAsDataURL(result);
                            reader.onloadend = function() {
                                const base64data = reader.result;
                                $this.data.image = base64data;
                                setTimeout(() => {
                                    $this.imageCropService.triggerUpload.emit($this.data);
                                }, 100);
                                $this.activeModal.dismiss();
                            };
                        },
                        error => {
                          console.log('Oh no!', error);
                        }
                    );
                });

            }
        }
    }

    urltoFile(url, filename, mimeType) {
        return (fetch(url)
            .then(function(res){return res.arrayBuffer(); })
            .then(function(buf){return new File([buf], filename, {type : mimeType}); })
        );
    }
}

