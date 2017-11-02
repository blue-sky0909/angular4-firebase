import {Component, OnInit, Injectable} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {ToastyService} from 'ng2-toasty';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FirebaseApp} from 'angularfire2';
import {AngularFireDatabase} from "angularfire2/database";
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import {AppService} from '../../services/app-service';
import {AdminService} from '../services/admin-service';
import {AuthService} from '../../auth/services/auth-service';
import {ImageCropService} from '../../shared-module/services/image-crop.service';
import {CropModalComponent} from '../../shared-module/components/crop-modal/crop-modal.component';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: [
        './admin.scss'
    ],
})

export class AdminComponent implements OnInit {
    imgSrcs: any[];

    constructor(private auth: AuthService,
                private appService: AppService,
                private toasty: ToastyService,
                private modalService: NgbModal,
                private imageCropService: ImageCropService,
                private app: FirebaseApp,
                private af: AngularFireDatabase,
                private dragulaService: DragulaService,
                private adminService:AdminService,) {
        this.imgSrcs = [];
        this.dragulaService.setOptions('bag-items', {
            revertOnSpill: true
        });
        dragulaService.dropModel.subscribe((value:any) => {
            this.onDropModel(value.slice(1));
        });
        dragulaService.removeModel.subscribe((value:any) => {
            this.onRemoveModel(value.slice(1));
        });
    }

    // CHECK FOR AN ID, IF THERE IS NONE
    ngOnInit(): void {
        this.getImages();
    }

    private onDropModel(args:any):void {
        let [el, target, source] = args;
        let imgSrcs = this.imgSrcs
        imgSrcs.forEach((imgObj, index) => {
            this.app.database()
            .ref(`/defaultImages/${imgObj.key}`)
            .update({priority: index});
        })
    }
    
    private onRemoveModel(args:any):void {
        let [el, source] = args;
    }

    fileChangeListener(event) {
        const file: File = event.target.files[0];
        this.imageCropService.file = file;
        this.imageCropService.setPorportions(273, 175);
        this.auth.imageContentType = file.type

        setTimeout(() => {this.modalService.open(CropModalComponent); }, 100);

        this.imageCropService.triggerUpload.first().subscribe((file) => {
          this.uploadFileDirect(file);
        });
    }

    uploadFileDirect(file) {
        const $this = this;
        let longEnough = false;
        const randomFileName = new Date().getTime();
        const path = randomFileName
        this.appService.startLoadingBar();
        setTimeout(() => { longEnough = true; }, 300);

        this.auth.uploadDefaultImage(file, path).subscribe((data) => {
            if (longEnough){
                $this.appService.stopLoadingBar();
            } else{
                setTimeout(() => { $this.appService.stopLoadingBar(); }, 500);
            }

            let downloadUrl = data.downloadURL
            this.app.database().ref('defaultImages/' + randomFileName).set({
                key: randomFileName,
                url: downloadUrl
            });
            this.getImages();
        });
    }

    getImages() {
        let $this = this;
        this.imgSrcs = [];
        const query = this.app.database().ref("defaultImages").orderByChild('priority');
        query.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let key = childSnapshot.key;
                let childData = childSnapshot.val();
                let imgObj = {
                    key: "",
                    url: ""
                }
                imgObj.key = key;
                imgObj.url = childData.url
                $this.imgSrcs.push(imgObj)
            });
        });
    }
    
    deletePhoto(param) {
        let $this = this;
        this.app.database().ref(`/defaultImages/${param.key}`).remove().then(function(){
            $this.getImages();
        });;
    }
}
