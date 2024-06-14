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
    
        // Set up tilemap and layers
        this.map = this.add.tilemap("dungeon-map-1");
        this.item_props = this.map.addTilesetImage("propsItems", "items_props");
        this.tilemap_tiles = this.map.addTilesetImage("tileset", "tiles");
        this.groundLayer = this.map.createLayer("Ground-n", this.tilemap_tiles, 0, 0);
        this.wallsLayer = this.map.createLayer("Walls-n", this.tilemap_tiles, 0, 0);
        this.wallsLayer.setCollisionByProperty({ collides: true });
    
        // Create coins from objects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 199
        });
    
        // Set up player sprite
        my.sprite.player = this.physics.add.sprite(128, 128, "playerRed", "idle_1.png");
        my.sprite.player.body.setSize(my.sprite.player.width * 0.5, my.sprite.player.height * 0.7);
        my.sprite.player.body.offset.y = 8;
    
        // Enable physics for coins and create group
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
    
        // Collision handling
        this.physics.add.collider(my.sprite.player, this.wallsLayer);
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            coin.destroy();
            this.updateCoinCounter();
        });
    
        // Set world bounds and camera bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.5, 0.5);
        this.cameras.main.setDeadzone(30, 30);
        this.cameras.main.setZoom(2);
    
        // Background music
        this.backgroundMusic = this.sound.add("backgroundMusic", { volume: 0.5 }, { loop: true });
        this.backgroundMusic.play();
    
        // Load sound effects
        this.walkSound = this.sound.add("walkSound", { volume: 2.0 });
        this.deathSound = this.sound.add("deathSound", { volume: 1.0 });
        this.shootSound = this.sound.add("shootSound", { volume: 0.2 });
    
        // Input keys
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey('R');
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    
        // Particle effects for walking
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_02.png', 'spark_03.png'],
            scale: { start: 0.01, end: 0.04 },
            lifespan: 300,
            alpha: { start: 1, end: 0.1 },
        });


    
        // Add enemies at specified locations
        const enemySpawnLocations = [
            [1964, 1077], [1144, 996], [787, 888], [344, 956],
            [668, 324], [1000, 400], [1453, 544], [1673, 352],
            [3300, 250], [3300, 850], [3400, 1380], [3430, 1817],
            [2820, 1174], [2217, 1476], [420, 384], [1000, 533]
        ];
    
        this.enemies = this.add.group();
    
        enemySpawnLocations.forEach(location => {
            const enemy = this.physics.add.sprite(location[0], location[1], 'enemies', 'walk_1.png');
            enemy.anims.play('enemyWalk', true);
            this.physics.add.collider(enemy, this.wallsLayer);
            this.physics.add.collider(my.sprite.player, enemy, this.handlePlayerEnemyCollision, null, this);
            this.enemies.add(enemy);
    
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.moveEnemyRandomly(enemy);
                },
                loop: true
            });
        });
    
        // Add coin counter text
        this.coinText = this.add.text(this.cameras.main.width - 192, 16, `Coins: ${this.coinCounter}`, { fontSize: '32px', fill: '#fff' });
        this.coinText.setScrollFactor(0);
    
        // Create player bullets group
        my.sprite.playerBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: true,
            maxSize: 10
        });
    
        // Create enemy bullets group
        this.enemyBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: true,
            maxSize: 10
        });
    
        // Set smaller size for bullets and adjust collision box
        my.sprite.playerBullets.getChildren().forEach(bullet => {
            bullet.setScale(0.1);
            bullet.body.setSize(8, 8);
            bullet.body.offset.set(4, 4);
        });
    
        this.enemyBullets.getChildren().forEach(bullet => {
            bullet.setScale(0.1);
            bullet.body.setSize(8, 8);
            bullet.body.offset.set(4, 4);
        });
    
        // Add collision detection for bullets
        this.physics.add.collider(my.sprite.playerBullets, this.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.collider(this.enemyBullets, my.sprite.player, this.handleBulletPlayerCollision, null, this);
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

        // Handle shooting with the attack key
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.shootBullet(my.sprite.player, my.sprite.playerBullets);
        }

        // Check if player is standing on a tile
        this.checkPlayerPosition();
    }

    dash() {
        const dashDistance = 64;
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

    handleBulletEnemyCollision(bullet, enemy) {
        bullet.destroy(); // Destroy bullet on impact
        // Tint enemy sprite and destroy after a delay
        enemy.setTint(0xff0000);
        this.time.delayedCall(2000, () => {
            enemy.destroy();
        });
    }
    

    handleBulletPlayerCollision(player, bullet) {
        bullet.destroy(); // Destroy bullet on impact
        this.killPlayer();
    }

    moveEnemyRandomly(enemy) {
        // Check if the enemy still exists
        if (!enemy || !enemy.body) {
            return;
        }
    
        const directions = [
            { x: 0, y: -1 },  // up
            { x: 0, y: 1 },   // down
            { x: -1, y: 0 },  // left
            { x: 1, y: 0 }    // right
        ];
    
        const direction = Phaser.Math.RND.pick(directions);
        const speed = 100;
    
        // Check if the enemy body exists before setting velocity
        if (enemy.body) {
            enemy.setVelocity(direction.x * speed, direction.y * speed);
    
            if (direction.x === -1) {
                enemy.setFlipX(true);
            } else if (direction.x === 1) {
                enemy.setFlipX(false);
            }
    
            // Enemy shooting logic
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    // Check if the enemy and its body still exist before shooting
                    if (enemy && enemy.body) {
                        this.shootBullet(enemy, this.enemyBullets);
                    }
                },
                loop: true
            });
        }
    }
    

    shootBullet(shooter, bulletsGroup) {
        const bulletKey = (shooter === my.sprite.player) ? 'bullet1' : 'bullet2'; // Select bullet sprite based on shooter
    
        const bullet = bulletsGroup.get(shooter.x, shooter.y, bulletKey); // Use bulletKey to get correct sprite
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            this.physics.world.enable(bullet);
            bullet.body.velocity.set(0); // Reset velocity
    
            if (shooter === my.sprite.player) {
                this.shootSound.play(); // Play shoot sound for player
                switch (this.lastDirection) {
                    case 'left':
                        bullet.body.velocity.x = -300;
                        break;
                    case 'right':
                        bullet.body.velocity.x = 300;
                        break;
                    case 'up':
                        bullet.body.velocity.y = -300;
                        break;
                    case 'down':
                        bullet.body.velocity.y = 300;
                        break;
                }
            } else {
                const directions = [
                    { x: 0, y: -1 },  // up
                    { x: 0, y: 1 },   // down
                    { x: -1, y: 0 },  // left
                    { x: 1, y: 0 }    // right
                ];
                const direction = Phaser.Math.RND.pick(directions);
                bullet.body.velocity.x = direction.x * 300;
                bullet.body.velocity.y = direction.y * 300;
            }
        }
    }
    

    updateCoinCounter() {
        this.coinCounter++;
        this.coinText.setText(`Coins: ${this.coinCounter}`);
    }
}
