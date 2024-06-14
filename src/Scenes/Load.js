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

        this.load.audio("backgroundMusic", "/audio/Tricky.mp3");

        this.load.spritesheet("tilemap_sheet", "Props_and_items/propsItems.png", {
            frameWidth: 32,
            frameHeight: 32
        });
console.log();


// Load sound effects
        this.load.audio("gunSound", "/audio/gun.mp3");
        this.load.audio("coinSound", "/audio/coin.mp3");
        this.load.audio("walkSound", "/audio/walk.mp3");


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

        this.anims.create({
            key: 'gun',
            frames: this.anims.generateFrameNames('playerRed', {
                prefix: "gun_",
                start: 3,
                end: 3,
                suffix: ".png"
            }),
            frameRate: 60,
            repeat: -1
        });
        
        
        // Pass to the next Scene
        this.scene.start("gameScene");


    }

    update() {
        // Preload logic if needed
    }
}
