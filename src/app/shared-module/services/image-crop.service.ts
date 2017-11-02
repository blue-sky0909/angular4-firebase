import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';

import {Injectable, EventEmitter} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {CropperSettings} from 'ng2-img-cropper';

@Injectable()
export class ImageCropService {

    triggerUpload: EventEmitter<any> = new EventEmitter();
    file: File;
    cropperSettings: CropperSettings = new CropperSettings();
    test: any;

    constructor() {

    }

    setPorportions(width, height) {
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.canvasHeight = height;
        this.cropperSettings.canvasWidth = width;
        this.cropperSettings.height = height;
        this.cropperSettings.width = width;
    }

}
