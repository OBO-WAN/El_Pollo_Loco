class Chicken extends movableObject{

    height = 100;
    width = 80;
    x = 120;
    y = 340;

      constructor(){
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
            this.x = 200 + Math.random() * 500;

    }

    
}