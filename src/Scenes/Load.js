


class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        
        this.load.setPath("./assets/");
        this.load.atlas("playerRed", "Players/playerRed.png", "Players/playerRed.json");
        this.load.image("tiles", "tileset.png");
        this.load.image("items_props", "Props_and_items/propsItems.png");
        this.load.tilemapTiledJSON("dungeon-map-1", "dungeon-map-1.tmj");

        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        this.load.audio("backgroundMusic", "audio/Tricky.mp3");
        
        this.load.audio("walkSound", "audio/walk.mp3");
        
        this.load.audio("deathSound", "audio/death.mp3");
        
        this.load.audio("shootSound", "audio/gun.mp3");

        this.load.image('bullet1', 'bullet1.png');
    
    // Load enemy bullet sprite
        this.load.image('bullet2', 'bullet2.png');




        this.load.atlas("enemies", "Enemies/enemies.png", "Enemies/enemies.json");

        this.load.spritesheet("tilemap_sheet", "Props_and_items/propsItems.png", {
            frameWidth: 32,
            frameHeight: 32
        });

    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('playerRed', {
                prefix: "run_",
                start: 1,
                end: 3,
                suffix: ".png",
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('playerRed', {
                prefix: "idle_",
                start: 1,
                end: 2,
                suffix: ".png"
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('playerRed', {
                prefix: "death_",
                start: 1,
                end: 5,
                suffix: ".png"
            }),
            frameRate: 30,
            repeat: 0
        });

        this.anims.create({
            key: 'enemyWalk',
            frames: this.anims.generateFrameNames('enemies', {
                prefix: "walk_",
                start: 1,
                end: 4,
                suffix: ".png"
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemyDeath',
            frames: this.anims.generateFrameNames('enemies', {
                prefix: "dead_",
                start: 1,
                end: 4,
                suffix: ".png"
            }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.start("mainMenu");
    }

    update() {
    }
}
