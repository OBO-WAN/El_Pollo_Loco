function createRandomBottles(amount, minX, maxX) {
    const bottles = [];
    const minDistance = 250; // prevent boring clusters

    let lastX = minX - minDistance;

    for (let i = 0; i < amount; i++) {
        let x;

        do {
            x = minX + Math.random() * (maxX - minX);
        } while (Math.abs(x - lastX) < minDistance);

        bottles.push(new Bottle(x, 350));
        lastX = x;
    }

    return bottles;
}

function initLevel1() {
    return new Level(
        [
            new Chicken(),
            new Chicken2(),
            new Chicken(),
            new Chicken2(),
            new Chicken(),
            new Endboss(),
        ],

        [
            new Cloud()
        ],

        [
            new BackgroundObject('assets/img/5_background/layers/air.png', -720),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', -720),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', -720),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', -720),

            new BackgroundObject('assets/img/5_background/layers/air.png', 0),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 0),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 0),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 0),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', 720),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', 720),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', 720),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 720 * 2),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 720 * 2),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/2.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/2.png', 720 * 3),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/1.png', 720 * 3),

            new BackgroundObject('assets/img/5_background/layers/air.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/3_third_layer/1.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/2_second_layer/1.png', 720 * 4),
            new BackgroundObject('assets/img/5_background/layers/1_first_layer/2.png', 720 * 4),
        ],


        [
            new Coin(300, 200),
            new Coin(600, 150),
            new Coin(900, 180),
            new Coin(1200, 140),
            new Coin(1500, 170),
        ],


        createRandomBottles(5, 200, 1800),

    )
}