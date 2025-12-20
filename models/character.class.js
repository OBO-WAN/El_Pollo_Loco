class Character extends movableObject{

    height = 200;
    width = 60;
    x = 120;
    y = 260;
    

    constructor(){
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.width = 180;
    }

    jump(){

    }
}