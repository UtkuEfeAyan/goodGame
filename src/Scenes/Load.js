
class Load extends Phaser.Scene {
    constructor() {
        super("loaScene");
    }

    preload() {
        this.load.setPath("./assets/")

        // Load tilemap information
        this.load.image("tiles", "tileset.png");
        console.log();
        this.load.image("items_props","Props_and_items/propsItems.png" );
        console.log();      


        this.load.tilemapTiledJSON("dungeon-map-1", "dungeon-map-1.tmj");   // Tilemap in JSON
        
        
        
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.atlas("playerRed", "Players/playerRed.png", "Players/playerRed,json")

        // Load the tilemap as a spritesheet
    


        // Load background music
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
        

         // ...and pass to the next Scene
         this.scene.start("gameScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}