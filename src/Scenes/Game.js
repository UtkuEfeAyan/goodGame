class Game extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 400;    // DRAG < ACCELERATION = icy slide
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2;
        this.coinCounter = 0;
        this.TILESIZE = 32;
        this.TILEHEIGHT = 80;
        this.TILEWIDTH = 120;
        this.dashing = false; // Add a flag to check if the dash key is held down
        this.lastDirection = 'right'; // Add a variable to track the last direction
        this.isPlayerAlive = true; // Add a flag to check if the player is alive
    }

    create() {
        this.map = this.add.tilemap("dungeon-map-1");

        // Add a tileset to the map
        this.item_props = this.map.addTilesetImage("propsItems", "items_props");
        this.tilemap_tiles = this.map.addTilesetImage("tileset", "tiles");

        // Create layers
        this.groundLayer = this.map.createLayer("Ground-n", this.tilemap_tiles, 0, 0);
        this.wallsLayer = this.map.createLayer("Walls-n", this.tilemap_tiles, 0, 0);

        // Add collision
        this.wallsLayer.setCollisionByProperty({ collides: true });

        // Debug
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        this.wallsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 199
        });

        my.sprite.player = this.physics.add.sprite(128, 128, "playerRed", "idle_1.png");
        my.sprite.player.body.setSize(my.sprite.player.width * 0.5, my.sprite.player.height * 0.7);
        my.sprite.player.body.offset.y = 8;

        // Convert coins to Arcade Physics sprites
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        this.coinGroup = this.add.group(this.coins);

        this.physics.add.collider(my.sprite.player, this.wallsLayer);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.updateCoinCounter(); // update coin counter
        });

        // Set world bounds to match the tilemap width only
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Set camera bounds to match the tilemap size
        this.cameras.main.startFollow(my.sprite.player, true, 0.5, 0.5);

        // Camera code
        this.cameras.main.setDeadzone(30, 30);
        this.cameras.main.setZoom(1);

        // Play background music
        this.backgroundMusic = this.sound.add("backgroundMusic", { volume: 0.5 }, { loop: true });
        this.backgroundMusic.play();

        // Load sound effects
        this.walkSound = this.sound.add("walkSound", { volume: 2.0 });
        this.deathSound = this.sound.add("deathSound", { volume: 1.0 });

        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey('R');

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_02.png', 'spark_03.png'],
            scale: { start: 0.01, end: 0.04 },
            lifespan: 300,
            alpha: { start: 1, end: 0.1 },
        });

        // Add an enemy sprite and make it move in random directions
        this.enemy = this.physics.add.sprite(256, 256, 'enemies', 'walk_1.png');
        this.enemy.anims.play('enemyWalk', true);
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.moveEnemyRandomly(this.enemy);
            },
            loop: true
        });

        this.physics.add.collider(this.enemy, this.wallsLayer);
        this.physics.add.collider(my.sprite.player, this.enemy, this.handlePlayerEnemyCollision, null, this);

        // Add coin counter text
        this.coinText = this.add.text(this.cameras.main.width - 192, 16, `Coins: ${this.coinCounter}`, { fontSize: '32px', fill: '#fff' });
        this.coinText.setScrollFactor(0);
    }

    update() {
        if (!this.isPlayerAlive) {
            return; // Stop update logic if the player is dead
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
            this.backgroundMusic.stop();
        }

        my.sprite.player.setVelocity(0);

        if (this.aKey.isDown) {
            my.sprite.player.setVelocityX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            this.lastDirection = 'left';
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (this.dKey.isDown) {
            my.sprite.player.setVelocityX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            this.lastDirection = 'right';
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (this.wKey.isDown) {
            my.sprite.player.setVelocityY(-this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);
            this.lastDirection = 'up';
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(0, -this.PARTICLE_VELOCITY);
            if (!this.walkingSoundPlaying) {
                this.walkSound.play();
                this.walkingSoundPlaying = true;
            }
            my.vfx.walking.start();
        } else if (this.sKey.isDown) {
            my.sprite.player.setVelocityY(this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);
            this.lastDirection = 'down';
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

        // Handle dashing with the space bar
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.dash();
        }

        // Check if player is standing on a tile
        this.checkPlayerPosition();
    }

    dash() {
        const dashDistance = 128;
        switch (this.lastDirection) {
            case 'left':
                my.sprite.player.x -= dashDistance;
                break;
            case 'right':
                my.sprite.player.x += dashDistance;
                break;
            case 'up':
                my.sprite.player.y -= dashDistance;
                break;
            case 'down':
                my.sprite.player.y += dashDistance;
                break;
        }
    }

    checkPlayerPosition() {
        const playerTile = this.groundLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y);
        if (!playerTile) {
            this.killPlayer();
        }
    }

    killPlayer() {
        this.isPlayerAlive = false; // Set the player alive flag to false
        my.sprite.player.setTint(0xff0000);
        my.sprite.player.setVelocity(0, 0); // Stop player movement
        my.sprite.player.anims.play('death');
        this.deathSound.play(); // Play death sound
        this.add.text(this.cameras.main.worldView.x + this.cameras.main.width / 2, this.cameras.main.worldView.y + this.cameras.main.height / 2, 'Game Over', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            this.scene.restart();
            this.backgroundMusic.stop();
            this.walkSound.stop();
        }, [], this);
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (!this.isPlayerAlive) {
            return;
        }
        player.setTint(0xff0000); // Change color to indicate collision
        this.killPlayer();
    }

    moveEnemyRandomly(enemy) {
        const directions = [
            { x: 0, y: -1 },  // up
            { x: 0, y: 1 },   // down
            { x: -1, y: 0 },  // left
            { x: 1, y: 0 }    // right
        ];

        const direction = Phaser.Math.RND.pick(directions);
        const speed = 100;

        enemy.setVelocity(direction.x * speed, direction.y * speed);
    }

    updateCoinCounter() {
        this.coinCounter++;
        this.coinText.setText(`Coins: ${this.coinCounter}`);
    }
}
