var Jumper = function() {};
Jumper.Play = function() {};

Jumper.Play.prototype = {

  preload: function() {
    this.load.image( 'player', 'Sprites/rightPlayer.png' );
    this.load.image( 'pixel', 'Sprites/pixel.png' );
  },

  create: function() {
    // background color
    this.stage.backgroundColor = '#6bf';

    // scaling
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.maxWidth = this.game.width;
    this.scale.maxHeight = this.game.height;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.setScreenSize( true );

    // physics
    this.physics.startSystem( Phaser.Physics.ARCADE );

    // camera and platform tracking vars
    this.cameraYMin = 99999;
    this.platformYMin = 99999;

    // create platforms
    this.platformsCreate();

    // create player
    this.playerCreate();

    // cursor controls
    this.cursor = this.input.keyboard.createCursorKeys();
  },

  update: function() {
    // this is where the main magic happens
    // the y offset and the height of the world are adjusted
    // to match the highest point the hero has reached
    this.world.setBounds( 0, -this.player.yChange, this.world.width, this.game.height + this.player.yChange );

    // the built in camera follow methods won't work for our needs
    // this is a custom follow style that will not ever move down, it only moves up
    this.cameraYMin = Math.min( this.cameraYMin, this.player.y - this.game.height + 130 );
    this.camera.y = this.cameraYMin;

    // player collisions and movement
    this.physics.arcade.collide( this.player, this.platforms );
    this.playerMove();

    // for each plat form, find out which is the highest
    // if one goes below the camera view, then create a new one at a distance from the highest one
    // these are pooled so they are very performant
    this.platforms.forEachAlive( function( elem ) {
      this.platformYMin = Math.min( this.platformYMin, elem.y );
      if( elem.y > this.camera.y + this.game.height ) {
        elem.kill();
        this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.platformYMin - 100, 50 );
      }
    }, this );
  },

  shutdown: function() {
    // reset everything, or the world will be messed up
    this.world.setBounds( 0, 0, this.game.width, this.game.height );
    this.cursor = null;
    this.player.destroy();
    this.player = null;
    this.platforms.destroy();
    this.platforms = null;
  },

  platformsCreate: function() {
    // platform basic setup
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
    this.platforms.createMultiple( 50, 'pixel' );

    // create the base platform, with buffer on either side so that the player doesn't fall through
    this.platformsCreateOne( -16, this.world.height - 26, this.world.width + 50 );
    // create a batch of platforms that start to move up the level
    for( var i = 0; i < 20; i++ ) {
      this.platformsCreateOne( this.rnd.integerInRange( 0, this.world.width - 50 ), this.world.height - 100 - 100 * i,100 );
    }
  },

  platformsCreateOne: function( x, y, width ) {
    // this is a helper function since writing all of this out can get verbose elsewhere
    var platform = this.platforms.getFirstDead();
    platform.reset( x, y );
    platform.scale.x = width;
    platform.scale.y = 25;
    platform.body.immovable = true;
    return platform;
  },

  playerCreate: function() {
    // basic player setup
    this.player = game.add.sprite( this.world.centerX, this.world.height - 45, 'player' );
    this.player.anchor.set( 1 );
    
    // track where the player started and how much the distance has changed from that point
    this.player.yOrig = this.player.y;
    this.player.yChange = 0;

    // player collision setup
    // disable all collisions except for down
    this.physics.arcade.enable( this.player );
    this.player.body.gravity.y = 400;
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
  },

  playerMove: function() {
    // handle the left and right movement of the player
    if( this.cursor.left.isDown ) {
      this.player.body.velocity.x = -200;
    } else if( this.cursor.right.isDown ) {
      this.player.body.velocity.x = 200;
    } else {
      this.player.body.velocity.x = 0;
    }

    // handle player jumping
    if( this.cursor.up.isDown && this.player.body.touching.down ) {
      this.player.body.velocity.y = -500;
    } 
    
    // wrap world coordinated so that you can warp from left to right and right to left
    this.world.wrap( this.player, this.player.width / 2, false );

    // track the maximum amount that the player has travelled
    this.player.yChange = Math.max( this.player.yChange, Math.abs( this.player.y - this.player.yOrig ) );
    
    // if the player falls below the camera view, gameover
    if( this.player.y > this.cameraYMin + this.game.height && this.player.alive ) {
      this.state.start( 'Play' );
    }
  }
}

var game = new Phaser.Game( 600, 900, Phaser.CANVAS, '' );
game.state.add( 'Play', Jumper.Play );
game.state.start( 'Play' ); 