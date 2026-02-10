class ThrowableObject extends movableObject {

  IMAGES_THROW = [
    'assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
    'assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
  ];

  constructor(x, y, direction = 1) {
    super();

    this.loadImage(this.IMAGES_THROW[0]);
    this.loadImages(this.IMAGES_THROW);

    this.width = 60;
    this.height = 80;

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speedX = 12 * direction;

    this.throw();
  }

  throw() {
    this.speedY = 20;
    this.applyGravity();

    this.moveInterval = setInterval(() => {
      this.x += this.speedX;
    }, 25);
  }

  stop() {
    clearInterval(this.moveInterval);
  }
}
