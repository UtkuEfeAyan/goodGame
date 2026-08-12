
class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'mainMenu' });
        window.MENU = this;
    }
    preload ()
    {
        this.load.image('buttonBG', 'assets/button-bg.png');
        this.load.image('buttonText', 'assets/button-text.png');
    }

    create ()
    {
        console.log('%c MainMenu ', 'background: red; color: blue; display: block;');

        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        // Dark backdrop with a subtle gradient, instead of a flat black screen
        const bgGfx = this.add.graphics();
        bgGfx.fillGradientStyle(0x05060f, 0x05060f, 0x161233, 0x161233, 1);
        bgGfx.fillRect(0, 0, W, H);

        // Simple twinkling starfield
        this.stars = [];
        for (let i = 0; i < 160; i++)
        {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const r = Phaser.Math.FloatBetween(0.6, 2.2);
            const star = this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.35, 1));
            this.stars.push({
                gfx: star,
                twinkleSpeed: Phaser.Math.FloatBetween(0.02, 0.09),
                phase: Math.random() * Math.PI * 2,
            });
        }

        // Title
        this.add.text(W / 2, H * 0.3, 'DUNGEON LEVEL\nDESIGN PROTOTYPE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '46px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6,
            lineSpacing: 4,
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.3 + 74, 'WASD to move  |  F to shoot  |  Space to dash', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#aad4ff',
        }).setOrigin(0.5);

        const bg = this.add.image(0, 0, 'buttonBG');
        const text = this.add.image(0, 0, 'buttonText');

        const button = this.add.container(W / 2, H * 0.62, [ bg, text ]);

        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => button.setScale(1.06));
        bg.on('pointerout', () => button.setScale(1));

        bg.once('pointerup', function ()
        {
            this.scene.start('gameScene');
        }, this);
    }

    update (time)
    {
        for (const s of this.stars)
        {
            s.gfx.setAlpha(0.35 + 0.65 * Math.abs(Math.sin(time * 0.001 * s.twinkleSpeed + s.phase)));
        }
    }
}
