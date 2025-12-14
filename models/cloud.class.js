class Cloud extends movableObject{

    y = 20;
    height = 250; 

 
       constructor(){
        super().loadImage('img/5_background/layers/4_clouds/1.png');
            this.x = Math.random() * 500;
            // this.y = 50;
            this.width = 490;
            // this.height = 150;


    }


}