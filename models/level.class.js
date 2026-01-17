class Level{

    enemies;
    clouds;
    backgroundObjects;
    level_end_x = 2400;

    constructor(enemies,clouds,backgroundObjects){ // (x, y, z)
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;

    }

}