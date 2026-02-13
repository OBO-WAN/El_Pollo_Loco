class Coin extends movableObject {
  offset = { top: 15, right: 30, bottom: 100, left: 30 };

  constructor(x, y) {
    super();
    this.loadImage('assets/img/8_coin/coin_1.png');
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 80;
  }
}
