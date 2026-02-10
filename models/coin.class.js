class Coin extends movableObject {

  constructor(x, y) {
    super();
    this.loadImage('assets/img/8_coin/coin_1.png');
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 100;
  }
}
