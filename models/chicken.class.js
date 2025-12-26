class Chicken extends movableObject{

    height = 80;
    width = 80;
    x = 120;
    y = 360;


    animatedChickens = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png',
    

    ];

    currentImage = 0;


      constructor(){
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadMainCharacter(this.animatedChickens); //fill imageChache={}
            this.x = 200 + Math.random() * 500; // spread spawn position
            this.speed = 0.15 + Math.random() * 0.5;
            this.animate();

    }

     animate() {
        this.moveLeft();

        setInterval(() => {
            let path = this.animatedChickens[this.currentImage];
            this.img = this.imageCache[path];
            this.currentImage = (this.currentImage + 1) % this.animatedChickens.length; // let i = 0+1 % 6

        }, 1000);
    }

    
}