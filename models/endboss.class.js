class Endboss extends movableObject {
  height = 280;
  width = 270;
  energy = 100;
  dead = false;
  animationInterval = null;

  isHurt = false;
  hurtTimeout = null;

  IMAGES_WALKING = [
    'assets/img/4_enemie_boss_chicken/2_alert/G5.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G6.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G7.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G8.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G9.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G10.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G11.png',
    'assets/img/4_enemie_boss_chicken/2_alert/G12.png',
  ];

  IMAGES_HURT = [
    'assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
    'assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
    'assets/img/4_enemie_boss_chicken/4_hurt/G23.png',
  ];

  IMAGES_DEAD = [
    'assets/img/4_enemie_boss_chicken/5_dead/G24.png',
    'assets/img/4_enemie_boss_chicken/5_dead/G25.png',
    'assets/img/4_enemie_boss_chicken/5_dead/G26.png',
  ];

  constructor() {
    super();
    this.loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);

    this.x = 3000;
    this.y = 160;
    this.animate();
  }

  animate() {
    this.animationInterval = setInterval(() => {
      if (this.dead) return;

      if (this.isHurt) {
        this.playAnimation(this.IMAGES_HURT);
      } else {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 200);
  }

  hit() {
    if (this.dead) return;

    this.energy -= 20;
    this.energy = Math.max(0, this.energy);

    this.triggerHurtAnimation();

    if (this.energy === 0) {
      this.die();
    }
  }

  triggerHurtAnimation() {
    this.isHurt = true;

    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);

    // keep hurt visible for ~600ms (3 frames x 200ms)
    this.hurtTimeout = setTimeout(() => {
      this.isHurt = false;
    }, 600);
  }

  die() {
    this.dead = true;

    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);

    let i = 0;
    const deathInterval = setInterval(() => {
      this.img = this.imageCache[this.IMAGES_DEAD[i]];
      i++;

      if (i >= this.IMAGES_DEAD.length) {
        clearInterval(deathInterval);
      }
    }, 200);
  }
}
