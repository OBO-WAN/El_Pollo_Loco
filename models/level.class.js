class Level{

    enemies;
    clouds;
    backgroundObjects;
    coins;
    level_end_x = 2500;

    constructor(enemies,clouds,backgroundObjects,coins){ // (x, y, z,...)
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;

    }

}