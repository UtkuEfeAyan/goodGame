class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 600;    // DRAG < ACCELERATION = icy slide
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 0;
        this.coinCounter = 0;
        this.TILESIZE = 32;
        this.TILEHEIGHT = 80;
        this.TILEWIDTH = 120;
    }

    create() {
        this.map = this.add.tilemap("dungeon-map-1");

        //Add a tileset to the map
        this.item_props = this.map.addTilesetImage("propsItems", "items_props");
        this.tilemap_tiles= this.map.addTilesetImage("tileset", "tiles");

        // create layers
        this.groundLayer = this.map.createLayer("Ground-n", this.tilemap_tiles, 0, 0);
        this.wallsLayer = this.map.createLayer("Walls-n", this.tilemap_tiles, 0, 0);

        //add colision
        this.wallsLayer.setCollisionByProperty({ collides: true });

        //debug
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        this.wallsLayer.renderDebug(debugGraphics,{
             tileColor: null,
             collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
             faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });

        //my.sprite.player = this.add.sprite(128, 128, "playerRed", "072.png");







        this.data = this.map.createFromObjects("Objects", {
            name: "data",
            key: "tilemap_sheet",
            frame: 199
        });
        // Convert coins to Arcade Physics sprites
        this.physics.world.enable(this.data, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        this.dataGroup = this.add.group(this.data);



          
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}