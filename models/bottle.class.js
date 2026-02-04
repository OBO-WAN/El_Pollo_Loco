class Bottle extends movableObject {
  IMAGES_BOTTLE = [
    'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  constructor(x, y) {
    super();
    this.loadImage(this.IMAGES_BOTTLE[0]);  
    this.loadImages(this.IMAGES_BOTTLE);    

    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 80;

    this.animate();
  }

  animate() {
  this.animationInterval = setInterval(() => {
    this.playAnimation(this.IMAGES_BOTTLE);
  }, 400);
}

}

