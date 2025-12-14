class BackgroundObject extends movableObject{

    width = 720;
    height = 200;

    constructor(imagePath, x, y){
        super().loadImage(imagePath);
        x = x; 
        y = y;
    }
}