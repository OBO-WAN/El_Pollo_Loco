class Character extends movableObject{

    height = 240;
    width = 140;
    x = 120;
    y = 200;
    

    constructor(){
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadMainCharacter([
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'  
    
    ]);
        
    }

    jump(){

    }
}