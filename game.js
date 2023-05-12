// var Jumper = function() {};
// Jumper.Play = function() {};

class Play extends Phaser.Scene {
  constructor(){
    super('play');
  }

  preload() {
    this.load.image( 'player', 'Sprites/rightPlayer.png' );
    this.load.image( 'pixel', 'Sprites/pixel.png' );
  }

  create(){
   // this.stage.backgroundColor = '#6bf';
  // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.maxWidth = this.game.width;
    this.scale.maxHeight = this.game.height;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    //this.scale.setScreenSize( true );
    //this.physics.startSystem( Phaser.Physics.ARCADE );

    this.cameraYMin = 99999;
    this.platformYMin = 99999;

    this.platformsCreate();
    this.playerCreate();

    this.cursor = this.input.keyboard.createCursorKeys();
  }

  update() {
    this.world.setBounds( 0, -this.player.yChange, this.world.width, this.game.height + this.player.yChange );

    this.cameraYMin = Math.min( this.cameraYMin, this.player.y - this.game.height + 130 );
    this.camera.y = this.cameraYMin;

    this.physics.arcade.collide( this.player, this.platforms );
    this.playerMove();

    this.platforms.forEachAlive( function( elem ) {
      this.platformYMin = Math.min( this.platformYMin, elem.y );
      if( elem.y > this.camera.y + this.game.height ) {
        elem.kill();
        this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.platformYMin - 140, 50 );
      }
    }, this );
  }

  shutdown() {
    this.world.setBounds( 0, 0, this.game.width, this.game.height );
    this.cursor = null;
    this.player.destroy();
    this.player = null;
    this.platforms.destroy();
    this.platforms = null;
  }

  platformsCreate(){
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
    this.platforms.createMultiple( 80, 'pixel' );
    this.platformsCreateOne( -16, this.world.height - 26, this.world.width + 50 );
    for( var i = 0; i < 50; i++ ) {
      this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.world.height - 100 - 100 * i,100 );
    }
  }

  platformsCreateOne( x, y, width ) {
    var platform = this.platforms.getFirstDead();
    platform.reset( x, y );
    platform.scale.x = width;
    platform.scale.y = 25;
    platform.body.immovable = true;
    return platform;
  }

  playerCreate() {
    this.player = game.add.sprite( this.world.centerX, this.world.height - 45, 'player' );
    this.player.anchor.set( 1 );
    
    this.player.yOrig = this.player.y;
    this.player.yChange = 0;

    this.physics.arcade.enable( this.player );
    this.player.body.gravity.y = 400;
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
  }

  playerMove() {
    if( this.cursor.left.isDown ) {
      this.player.body.velocity.x = -200;
    } else if( this.cursor.right.isDown ) {
      this.player.body.velocity.x = 200;
    } else {
      this.player.body.velocity.x = 0;
    }

    if( this.cursor.up.isDown && this.player.body.touching.down ) {
      this.player.body.velocity.y = -500;
    } 
    
    this.world.wrap( this.player, this.player.width / 2, false );
    this.player.yChange = Math.max( this.player.yChange, Math.abs( this.player.y - this.player.yOrig ) );
    
    if( this.player.y > this.cameraYMin + this.game.height && this.player.alive ) {
      this.state.start( 'play' );
    }
  }
}

new Phaser.Game({
  width: 600,
  height: 900,
  scene: [Play]
});
