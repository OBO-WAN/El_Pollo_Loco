class Level{

    enemies;
    clouds;
    backgroundObjects;
    coins;
    bottles;
    level_end_x = 2500;

    constructor(enemies,clouds,backgroundObjects,coins, bottles){ // (x, y, z,...)
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;

    }

}