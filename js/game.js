
var player;
var hit;
var floor;
var tile;
var tilesGroup;
var tileChild;
var breakTilesGroup;
var breakTileChild;
var DisTilesGroup
var DisTileChild;
var springGroup;
var springChild;
var particles;
var score = 0;
var scoreText;
var GameOverText;
var retryText;
var tn;
var td;
var tb;
var zoneL;
var zoneR;
var spring;

class Game extends Phaser.Scene {
	constructor() {
		super("Game");
	}

	preload() {
		this.load.image("player", "Sprites/rightPlayer.png", { scale: .8 });
		this.load.image("tile-n", "Sprites/black line.png", { scale: 1 });
		this.load.image("tile-d", "Sprites/blue line.png", { scale: 3 });
		this.load.image("spring", "Sprites/spring.png", {scale: 0.8});
	}

	create() {
		floor = this.physics.add.image(game.config.width/2, 830,'tile-d');
		floor.setImmovable();
		floor.scale = 6;

		this.createTiles();
		this.createDisTiles();
		this.createPlayer();
		this.createSpring();
		
		var source = {
			contains: function (x, y)
			{
				var hit = player.body.hitTest(x, y);
				return hit;
			}
		};
		
		scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: '"Montserrat"', fontSize: '32px', fill: '#a0f' }).setScrollFactor(0);
		scoreText.depth = 2;
		GameOverText = this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', { fontFamily: '"Montserrat"', fontSize: '90px', fill: '#333'}).setScrollFactor(0);
		GameOverText.setOrigin(0.5);
		GameOverText.depth = 2;
		GameOverText.visible = false;

		retryText = this.add.text(game.config.width/2, game.config.height/2 + 180, 'RETRY', { fontFamily: '"Montserrat"', fontSize: '32px', fill: '#00bfa9'}).setScrollFactor(0);
		retryText.setOrigin(0.5);
		retryText.depth = 2;
		retryText.visible = false;
	
		this.physics.add.collider(player, floor, this.GameOver, null, this);
		this.physics.add.collider(player, tilesGroup, this.bounceBack, null, this);
		this.physics.add.collider(player, DisTilesGroup, this.TileDisappear, null, this);
		this.physics.add.overlap(player, breakTilesGroup, this.TileBreak, null, this);
		this.physics.add.collider(player, springGroup, this.BigBounce, null, this);
		this.physics.add.overlap(player, this.particles, this.GameOver, null, this);

		this.cameraYMin = 99999;
		this.tileYMin = 99999;

		this.key_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.key_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.key_Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.input.mouse.disableContextMenu();
	}
	
	update() {
		player.yChange = Math.max( player.yChange, Math.abs( player.y - player.yOrig ) );
        this.physics.world.setBounds(0, -player.yChange, this.physics.world.bounds.width, this.game.config.height + player.yChange);
        this.cameras.main.setLerp(.5);
		this.cameras.main.centerOnY(player.y);

		if (this.key_right.isDown) player.body.velocity.x = 400;
		else if (this.key_left.isDown) player.body.velocity.x = -400;
		else player.body.velocity.x = 0;
		var pointer = this.input.activePointer;
		
		if (pointer.isDown){
			if (pointer.x > 300) {
				player.body.velocity.x = 400;
			} else  if (pointer.x < 301){
				player.body.velocity.x = -400;
			}
			else player.body.velocity.x = 0;
		};
		
		window.addEventListener("deviceorientation", this.handleOrientation, true);
		this.physics.world.wrap(player, player.width / 6, false);

		if( player.y > this.cameraYMin + this.game.config.height ) {
			this.GameOver();
		}

		tilesGroup.children.iterate(function( item ) {
			var chance = Phaser.Math.Between(1, 100);
			var chance2 = Phaser.Math.Between(1, 100);
			var chance3 = Phaser.Math.Between(1, 100);
			var xAxis;
			var yAxis = this.tileYMin - 200;
			this.tileYMin = Math.min( this.tileYMin, item.y );
			this.cameraYMin = Math.min( this.cameraYMin, player.y - this.game.config.height + 430 );
			
			if( item.y > this.cameraYMin + this.game.config.height ){
				item.destroy();
				if (chance > 75 && chance < 81)
				{
					xAxis = Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 );
					tn = this.spawnTile( xAxis, yAxis, 'tile-n');
					td = this.spawnTileDis( Phaser.Math.Between( 100, xAxis - 100 ) || Phaser.Math.Between( xAxis+100, this.physics.world.bounds.width - 100 ), Phaser.Math.Between(yAxis + 100 , yAxis - 100), 'tile-d');
				}
	
				else if (chance < 71)
					xAxis = Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 );
					tn = this.spawnTile( xAxis, yAxis, 'tile-n');
					
				if (chance2 > 60 && chance2 < 81) {
					this.spawnSpring(Phaser.Math.Between(xAxis - 50, xAxis + 50), yAxis - 5, 'spring')
				} 
				else if (chance2 < 61){
					
				}
			}
		}, this );
		
	}

	createPlayer() {
        player = this.physics.add.image(game.config.width/2, 3*game.config.height/4, "player");
		player.setVelocity(0, -500);
		player.setGravityY(360);
		player.setBounce(0.4);
		player.body.checkCollision.up = false;
		player.depth = 1;

		player.yOrig = player.y;
        player.yChange = 0;
    }
	
    createTiles(){
        tilesGroup = this.physics.add.staticGroup({runChildUpdate: true});
		tilesGroup.enableBody = true;
		tileChild = tilesGroup.getChildren();
		
		for( var i = 0; i< 10; i++){
			tn = this.spawnTile( Phaser.Math.Between( 25, this.physics.world.bounds.width - 25 ), this.physics.world.bounds.height - 200 - 200 * i, 'tile-n');
		}
	} 
	
	createDisTiles(){
		DisTilesGroup = this.physics.add.staticGroup({runChildUpdate: true});
		DisTilesGroup.enableBody = true;
		DisTileChild = DisTilesGroup.getChildren();
	}

	createSpring(){
		springGroup = this.physics.add.staticGroup({runChildUpdate: true});
		springGroup.enableBody = true;
		springChild = springGroup.getChildren();
	}

    spawnTile(x, y, type){
		tile = tilesGroup.create(x, y, type);
		tile.setImmovable();
		return tile;
	}
	
    spawnTileDis(x, y, type){
		tile = DisTilesGroup.create(x, y, type);
		tile.setImmovable();
		return tile;
	}

    spawnSpring(x, y, type){
		spring = springGroup.create(x, y, type);
		spring.setImmovable();
		return spring;
	}

	bounceBack(_player, _tilesGroup){
		if (_player.body.touching.down && _tilesGroup.body.touching.up)
            {
				score += 10;
				scoreText.setText('Score: ' + score);              
				player.body.velocity.y = -400;
            }
	}
		
	TileDisappear(_player, _DisTilesGroup){
		DisTilesGroup.children.each(function (e) {			
			if (_player.body.touching.down && e.body.touching.up)
			{
				DisTilesGroup.remove(e, true);        
				score = score + 10;
				player.body.velocity.y = -400;
				scoreText.setText('Score: ' + score);
				
			}            		
		},this);
	}

	BigBounce(_player, _springGroup){
			if (_player.body.touching.down && _springGroup.body.touching.up)
				{
					score += 100;
					scoreText.setText('Score: ' + score);              
					player.body.velocity.y = -1100;
				}     
	}

	GameOver(){
		GameOverText.visible = true;
		scoreText.setPosition(this.game.config.width/2, this.game.config.height/2 + 100);
		scoreText.setFontSize(45);
		scoreText.setOrigin(0.5);
		tilesGroup.setAlpha(0);
		tilesGroup.clear();
		DisTilesGroup.setAlpha(0);
		DisTilesGroup.clear();
		springGroup.setAlpha(0);
		springGroup.clear()
		player.setAlpha(.45);
	}

	handleOrientation (e) {
		var dx = e.gamma;
		var edx = (dx/3.5)**4;
		console.log(dx, edx);
		if (dx<0) {
			player.body.velocity.x = -edx;
		} else {
			player.body.velocity.x = edx;
			
		}
		if (player.body.velocity.x > 400) {
			player.body.velocity.x = 400;
		}
		else if (player.body.velocity.x < -400)
		player.body.velocity.x = -400;
	}
}
