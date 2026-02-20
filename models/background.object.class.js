class BackgroundObject extends movableObject {

    width = 720;
    height = 480;

    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 0;
        this.width = 720;
        this.height = 480;

        this.parallaxFactor = this.getParallaxFactor(imagePath);
    }

    getParallaxFactor(path) {
    if (path.includes('air')) return 0.1;
    if (path.includes('3_third_layer')) return 0.3;
    if (path.includes('2_second_layer')) return 0.5;
    if (path.includes('1_first_layer')) return 0.8;
    return 1;
}
}