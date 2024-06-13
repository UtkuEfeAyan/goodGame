class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 600;    // DRAG < ACCELERATION = icy slide
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2;
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

        my.sprite.player = this.physics.add.sprite(128, 128, "playerRed", "072.png");



        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        // Convert coins to Arcade Physics sprites
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        this.coinGroup = this.add.group(this.coins);

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
        });

        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_2.png', 'spark_3.png'],
            scale: { start: 0.01, end: 0.04 },
            lifespan: 300,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();


        // Gun VFX (replacing jumping VFX)
        my.vfx.gun = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_02.png', 'muzzle_02.png'],
            scale: { start: 0.1, end: 0.3 },
            lifespan: 200,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.gun.stop();

        // Set world bounds to match the tilemap width only
        this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        // Ensure the player collides with the world bounds horizontally only
        my.sprite.player.body.setCollideWorldBounds(false, false, false, false);

        // Set camera bounds to match the tilemap size
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels/8, this.map.heightInPixels/8);
        this.cameras.main.startFollow(my.sprite.player, true, 0.35, 0.35);

        // Camera code
        this.cameras.main.setDeadzone(10, 10);
        this.cameras.main.setZoom(0.5);

        // Play background music
        this.backgroundMusic = this.sound.add("backgroundMusic", { volume: 0.5 }, { loop: true });
        this.backgroundMusic.play();

        // Load sound effects
        this.jumpSound = this.sound.add("gunSound", { volume: 0.3 });
        this.walkSound = this.sound.add("walkSound", { volume: 2.0 });





          
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        my.sprite.player.setVelocity(0);

        if (cursors.left.isDown) {
            my.sprite.player.setVelocityX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (cursors.right.isDown) {
            my.sprite.player.setVelocityX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (cursors.up.isDown) {
            my.sprite.player.setVelocityY(-this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(0, -this.PARTICLE_VELOCITY);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (cursors.down.isDown) {
            my.sprite.player.setVelocityY(this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(0, this.PARTICLE_VELOCITY);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else {
            my.sprite.player.anims.play('idle');
            this.walkSound.stop();
            this.walkingSoundPlaying = false;
            my.vfx.walking.stop();
        }

    }
}