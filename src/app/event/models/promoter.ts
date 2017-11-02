export interface IPromoter{
    name:string;
    ocode:string;
    val?();
    exists?();
    createdAt?;
}

export class Promoter implements IPromoter{
    name:string = "";
    ocode:string = "";

    constructor(name?, ocode?){
        this.name = name;
        this.ocode = ocode;
    }

}