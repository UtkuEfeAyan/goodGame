class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load player sprite atlas
        this.load.atlas("playerRed", "Players/playerRed.png", "Players/playerRed.json");
        // Load tilemap information
        this.load.image("tiles", "tileset.png");
        this.load.image("items_props", "Props_and_items/propsItems.png");
        this.load.tilemapTiledJSON("dungeon-map-1", "dungeon-map-1.tmj");   // Tilemap in JSON

        // Load particle effects if any
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Load audio
        this.load.audio("backgroundMusic", "audio/Tricky.mp3");
        this.load.audio("walkSound", "audio/walk.mp3");

        // Load enemy sprite atlas
        this.load.atlas("enemies", "Enemies/enemies.png", "Enemies/enemies.json");

        this.load.spritesheet("tilemap_sheet", "Props_and_items/propsItems.png", {
            frameWidth: 32,
            frameHeight: 32
        });
console.log();
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
            repeat: -1
        });

        // Enemy animations
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
            key: 'enemyShoot',
            frames: this.anims.generateFrameNames('enemies', {
                prefix: "shoot_",
                start: 0,
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

        // Pass to the next Scene
        this.scene.start("mainmenu");
    }

    update() {
        // Preload logic if needed
    }
}

       