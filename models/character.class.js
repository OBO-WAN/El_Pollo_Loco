class Character extends movableObject{

    height = 240;
    width = 60;
    x = 120;
    y = 200;
    

    constructor(){
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.width = 180;
    }

    jump(){

    }
}