var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });


function preload() {
    game.load.image('ship', 'assets/player.png');
    game.load.image('starfield', 'assets/starfield.png')
    game.load.image('laser', 'assets/vegetaLaser.png')
    game.load.spritesheet('goten', 'assets/goten.png', 36, 54);
    game.load.spritesheet('gotenfly', 'assets/gotenfly.png', 65, 47);
    game.load.spritesheet('gotenreal', 'assets/gotenReal.png',60, 60);
    game.load.image('monster', 'assets/dbzEnemy.png')
    game.load.spritesheet('enemyExplosion', 'assets/explosion.png', 65, 60)
    game.load.audio('mysticGohan', 'assets/mysticGohan.mp3')
    game.load.audio('vegetasacrifice1', 'assets/vegetasacrifice1.mp3')
    game.load.image('monsterInsect', 'assets/monster2.png')
    game.load.image('monster3', 'assets/monster3.png')
    game.load.image('monster4', 'assets/monster4.png')
    game.load.image('monster5', 'assets/monster5.png')
    game.load.image('monsterFire', 'assets/enemyBullets.png')
    game.load.audio('gokuSS3', 'assets/gokuSS3.mp3')
    game.load.spritesheet('ghost', 'assets/ghost.png', 40, 50);
    game.load.image('menu', 'assets/mainMenu.png')
}

var themeSong;
var deathSong;
var sounds;
var current
var speakers;
var loopCount = 0;
var menu;
var player;
var cursors; 
var bank;
var shipTrail;
var weapon;
var bullets;
var bulletTime = 0;
var fireButton;
var monsters;
var monster;
var enemyExplosions;
var enemyExplosion;
var enemyKilled = 0;
var score = 0;
var scoreText;
var healthText;
var healthBar;
var rectangle;
var health;
var playerHit = 0;
var powerfulMonsterCollidesWithPlayer = 0;
var playerHealth;
var monsterTimer;
var gameOver;
var powerfulMonsters;
var powerfulMonsterTimer;
var monsterFire;
var powerfulMonsterFires;
var powerfulMonsterLaunched = false;
var monsterFireCollidesWithPlayer = 0;
var monsterFiringSpeed = 400;
var monsterInWave;
var fireSpeed;
var monsterAppearanceSpeed = 2000;
var monsterSpacing = 100;
var playerDeath;
var pauseButton;

var ACCLERATION = 600;
var DRAG = 400;
var MAXSPEED = 400;

var tornado;

function create() {

    //  Enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.paused = true;

    //  Scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
    starfield.fixedCamera = true;

    // pause button for the main menu & menu initialized
    pauseButton = game.add.sprite(-50, -50, 'pauseButton');
    pauseButton.inputEnabled = true;
    pauseButton.events.onInputUp.add( function () {this.game.paused = true;});
    game.input.onDown.add(function () {
        if(game.paused) {
            game.paused = false;
        }
    })
    menu = game.add.sprite(200, 220, 'menu')

    // theme song and death song initialized. death song not triggered in this version of the game.
    themeSong = game.add.audio('gokuSS3', 1, true)
    deathSong = game.add.audio('vegetasacrifice1',1,true)
    themeSong.play()
    deathSong.play()
    themeSong.volume = 5;
    deathSong.volume = 0;


    // Hero initialized
    player = game.add.sprite(50, 300, 'gotenreal');
    game.physics.arcade.enable(player);
    player.anchor.setTo(0.5, 0.5);
    player.body.bounce.y = 0.3;     
    // player.body.gravity.y = 300;
    // player.body.angularVelocity = 100; 
    // no need for angularVelocity. I wish..
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.body.collideWorldBounds = true;
    player.health = 100;
    player.weaponLVL = 1;
    player.animations.add('right', [1,2], 10);
    player.animations.add('superspeed', [3,4], 10);
    player.animations.add('jump', [6], 5);
    player.animations.add('backflip', [8,9,10,11,12], 10);
    player.animations.add('attack', [14], 10)
    player.animations.add('crouch', [7], 10)

    // Ghost sprite initialized when game starts. 
    playerDeath = game.add.sprite(game.width+200, game.height-100, 'ghost');
    game.physics.arcade.enable(playerDeath)
    playerDeath.anchor.setTo(0.5,0.5)

    // Bullets for player initialized. # of bullets in group can vary here.
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.createMultiple(30, 'laser');
    bullets.setAll('anchor.x', -0.9);
    bullets.setAll('anchor.y', -0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // Green Monsters initialized. Also, # can be modified here to increase number
    // Green monsters appear 2 secs after start of game.
    monsters = game.add.group();
    monsters.enableBody = true;
    monsters.createMultiple(40, 'monster');
    monsters.setAll('anchor.x', 0.5);
    monsters.setAll('anchor.y', 0.5);
    monsters.setAll('outOfBoundsKill', true);
    monsters.setAll('checkWorldBounds', true);
    game.time.events.add(2000, createMonsters)

    // Powerful Monsters initialized. 
    powerfulMonsters = game.add.group()
    powerfulMonsters.enableBody = true;
    powerfulMonsters.createMultiple(20, 'monsterInsect')
    powerfulMonsters.setAll('anchor.x', 0.5);
    powerfulMonsters.setAll('anchor.y', 0.5);
    powerfulMonsters.setAll('outOfBoundsKill', true);
    powerfulMonsters.setAll('checkWorldBounds', true);

    // Bullets of Powerful Monster initialized
    powerfulMonsterFires = game.add.group();
    powerfulMonsterFires.enableBody = true;
    powerfulMonsterFires.createMultiple(40, 'monsterFire');
    powerfulMonsterFires.setAll('alpha', 0.9);
    powerfulMonsterFires.setAll('anchor.x', 0.5);
    powerfulMonsterFires.setAll('anchor.y', 0.5);
    powerfulMonsterFires.setAll('outOfBoundsKill', true);
    powerfulMonsterFires.setAll('checkWorldBounds', true);
    powerfulMonsterFires.forEach(function(monster){
        monster.body.setSize(20,20);
    })


    // Green monster explosion sprite initialized
    enemyExplosions = game.add.group();
    enemyExplosions.enableBody = true;
    enemyExplosions.physicsBodyType = Phaser.Physics.ARCADE;
    enemyExplosions.createMultiple(30, 'enemyExplosion');
    enemyExplosions.setAll('anchor.x', 0.5);
    enemyExplosions.setAll('anchor.y', 0.5);
    enemyExplosions.forEach(function(enemyExplosion){
        enemyExplosion.animations.add('explode', [0,1,2], 10, false, true)
    })

    // Spacebar for fire and text rendering score initialized
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '30px ', fill: 'white' });

    // Health Bar initialized
    createHealthBar()

     gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER', { fontSize: "60px", fill: 'white'} );
     gameOver.anchor.setTo(0.5, 0.5);
     gameOver.visible = false;

}




function update() {

    if (game.paused === false){
        menu.destroy()
    }

    // Check for collision between  two parameters in the update loop. 
    game.physics.arcade.overlap(player, monsters, playerDamage, null, this);
    game.physics.arcade.overlap(bullets, monsters, monsterKill, null, this);
    game.physics.arcade.overlap(player, powerfulMonsters, playerDamage, null, this);
    game.physics.arcade.overlap(bullets, powerfulMonsters, monsterKill, null, this);
    game.physics.arcade.collide(powerfulMonsterFires, player, monsterFiresPlayer, null, this)


    // Change in Music here
    // if (player.health <= 0) {
    //     themeSong.volume = 0;
    //     deathSong.volume = 5;  
    // }

    // Moving background
    starfield.tilePosition.x -= 15;
    player.body.acceleration.x = 0;


    // Initializing cursors that will be caught
    cursors = game.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.body.acceleration.x = -ACCLERATION-500;
        player.animations.play('backflip')
    }

    else if (cursors.right.isDown) {
        player.body.acceleration.x = ACCLERATION;
        player.animations.play('right')

    }
    else {
        player.animations.stop();
        player.frame = 4;
    }

    if (fireButton.isDown){
        player.animations.play('attack')
        fireBullet()
    }

    if (cursors.up.isDown){
        player.body.velocity.y = -500;
        player.animations.play('jump')
    }

    if (cursors.down.isDown) {
        player.body.velocity.y = 500;
        player.animations.play('crouch')
    }
    // velocity used instead of acceleration


    // Game over function rendered when player not olive
    if (!player.alive && gameOver.visible === false) {
        gameOver.visible = true;
        var fadeInGameOver = game.add.tween(gameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        // fadeInGameOver.onComplete.add(setResetHandlers);
        // fadeInGameOver.start();
        // function setResetHandlers() {
        //     //  The "click to restart" handler
        //     tapRestart = game.input.onTap.addOnce(_restart,this);
        //     spaceRestart = fireButton.onDown.addOnce(_restart,this);           
         // function _restart() {
        //       tapRestart.detach();
        //       spaceRestart.detach();
        //       restart();
        //     }
        // }
    }

    // When player dead, destroy health bar and render ghost sprite
    if (player.health <= 0){
            health.destroy()
            playerDeath.reset(player.x, player.y)
            playerDeath.body.velocity.y = 200;
    }

    // Progressive difficulty rendered in terms of score
    if (!powerfulMonsterLaunched && score>200){
        powerfulMonsterLaunched = true;
        createPowerfulMonster()
        monsterSpacing *= 2;
    }

    if (powerfulMonsterLaunched && score > 400) {
      player.weaponLVL = 2;
      monsterFiringSpeed = 600;
    }


    if (powerfulMonsterLaunched && score > 600){
        monsterFiringSpeed = 800
        monsterSpacing *= 0.10;
    }

}


function fireBullet () {
    console.log(player.weaponLVL, 'weapon lvl')

    switch (player.weaponLVL) {
        case 1:
        if (game.time.now > bulletTime) {
            var bulletSpeed = -400;
            var firingRate = 100;
            // Grab the bullet from the group. If it exists, it will create a bullet at location specified.
            bullet = bullets.getFirstExists(false);
            if (bullet) {
                bullet.reset(player.x, player.y - 20); 
                bullet.body.velocity.x = -bulletSpeed;
                // bullet.scale.setTo(10,10); 
                // play with this. you can create a mega-attack.
                bullet.angle = player.angle
                bulletTime = game.time.now + firingRate;
            }
        }
        break;

        case 2:
        if (game.time.now > bulletTime) {
            var bulletSpeed = -600;
            var firingRate = 200;

            for (var i=0; i<3; i++) {
                bullet = bullets.getFirstExists(false);

                if (bullet) {
                    bullet.reset(player.x+10, player.y + 30);
                    var spreadAngle;
                    if (i===0) spreadAngle = -100;
                    if (i===1) spreadAngle = -90;
                    if (i===2) spreadAngle = -80;
                    bullet.angle = spreadAngle;
                    game.physics.arcade.velocityFromAngle(spreadAngle-90, bulletSpeed, bullet.body.velocity);
                    bullet.body.velocity.x = -bulletSpeed;                }
            }
            bulletTime = game.time.now + firingRate;
        }
        break;
    }
}

function createMonsters(){

    monster = monsters.getFirstExists(false);
    if (monster) {
        var randomNum = Math.floor(Math.random()*10);
        monster.reset(game.width-20, Math.random()*game.height)
        monster.body.velocity.x = -200;
        monster.body.velocity.y = randomNum%2 === 0 ? Math.random() * 400: Math.random()*(-400);
        monster.body.drag.y = 100;
    }

    //  Monsters created a randomized time, to prevent the player from expecting them.
    monsterTimer = game.time.events.add(game.rnd.integerInRange(monsterSpacing, monsterSpacing+1000), createMonsters);
}

function createPowerfulMonster(){
    var startingY = Math.floor(Math.random()*game.height)
    var horizontalSpeed = -150;
    var spread = 60;
    var frequency = 30;
    var horizontalSpacing = 70;
    var timeBetweenWave = 3000;

        var powerfulMonster = powerfulMonsters.getFirstExists(false);
        if (powerfulMonster){
            powerfulMonster.startingY = startingY;
            powerfulMonster.reset(game.width-20, -horizontalSpacing);
            powerfulMonster.body.velocity.x = horizontalSpeed;
           
            // Powerful monster is given 4 bullets that he can throw.
            var firingDelay = 2000;
            powerfulMonster.bullets = 4;
            powerfulMonster.lastShot = 0;

            powerfulMonster.update = function(){
                this.body.y = this.startingY + Math.sin((this.x) / frequency)*spread;
                monsterInWave = 1
                fireSpeed = monsterFiringSpeed;
                console.log(fireSpeed, 'monster firing speed')
                monsterFire = powerfulMonsterFires.getFirstExists(false);
                if (monsterFire && this.alive && this.bullets && this.y > game.height / 8
                 && game.time.now > firingDelay + this.lastShot){
                    this.lastShot = game.time.now;
                this.bullets--;
                monsterFire.reset(this.x, this.y+this.height/2);
                monsterFire.damageAmount = this.damageAmount;
                var angle = game.physics.arcade.moveToObject(monsterFire, player, fireSpeed);
                monsterFire.angle = game.math.radToDeg(angle);
                }

                if (this.x < 0) {
                    this.kill();
                } 
            }
        }
    powerfulMonsterTimer = game.time.events.add(game.rnd.integerInRange(timeBetweenWave-2000,timeBetweenWave+4000), createPowerfulMonster)
}


function monsterKill(bullet, monster){
    enemyExplosion = enemyExplosions.getFirstExists(false);
    enemyExplosion.reset(monster.body.x, monster.body.y);
    enemyExplosion.body.velocity.x = monster.body.velocity.x;
    enemyExplosion.alpha = 0.7;
    enemyExplosion.animations.play('explode', 10, false, true)
    monster.kill();
    bullet.kill()
    enemyKilled++;
    score += 10;
    monsterSpacing *= 0.9
    console.log(monsterSpacing)
    scoreText.text = "Score:" + enemyKilled*10;
}

// Damage incured if player collides with one type of monster or the other
function playerDamage(player, monster) {
    health.destroy(); 
    // wow. this healthBar FINALLY WORKS. - i'm keeping this comment
    // Health bar is destroyed and re-created every time the player is damaged. Kind of a hack?

        if (monster.key === "monster") {
            if (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer) > 0) {
                rectangle = new Phaser.Rectangle(550, 16, 200, 27); // create rectangle
                healthBar = game.add.bitmapData(game.width, game.height);
                playerHit++;
                monster.kill();
                console.log(playerHit, 'playerhit by green')
                healthBar.rect(rectangle.x, rectangle.y, 
                               (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer)) , 
                               rectangle.height, '#66FF00');
                health = game.add.sprite(0,0, healthBar)
                player.damage(5) 
                console.log('player hit', playerHit, 'health', player.health) 
            }
        }
        if (monster.key === "monsterInsect"){
            if (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer) > 0){
            rectangle = new Phaser.Rectangle(550, 16, 200, 27); // create rectangle
            healthBar = game.add.bitmapData(game.width, game.height);
                powerfulMonsterCollidesWithPlayer++;
                monster.kill();
                console.log(powerfulMonsterCollidesWithPlayer, 'powerful monster collides with player #')
                healthBar.rect(rectangle.x, rectangle.y, 
                               (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer)) , 
                               rectangle.height, '#66FF00');
                health = game.add.sprite(0,0, healthBar)
                player.damage(15) 
                console.log('player hit', powerfulMonsterCollidesWithPlayer, 'health', player.health) 

            }
        }
}

// Damage incured if player collides with monster bullets
function monsterFiresPlayer(player, powerfulMonsterFire){
    powerfulMonsterFire.kill();
    health.destroy();

    if (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer) > 0) {
            rectangle = new Phaser.Rectangle(550, 16, 200, 27); // create rectangle
            healthBar = game.add.bitmapData(game.width, game.height); 
            monsterFireCollidesWithPlayer++;
            console.log(monsterFireCollidesWithPlayer, 'monster fire collides #')
            healthBar.rect(rectangle.x, rectangle.y, 
                               (rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer-30*monsterFireCollidesWithPlayer)) , 
                               rectangle.height, '#66FF00');
            health = game.add.sprite(0,0, healthBar)
            player.damage(30) 
            console.log('player hit', monsterFireCollidesWithPlayer, 'health', player.health) 
    }
}

function createHealthBar() {
    rectangle = new Phaser.Rectangle(550, 16, 200, 27); // create rectangle
    healthBar = game.add.bitmapData(game.width, game.height); 
    healthBar.rect(rectangle.x, rectangle.y,
                   rectangle.width-2*(5*playerHit-15*powerfulMonsterCollidesWithPlayer - monsterFireCollidesWithPlayer*30) 
                   ,rectangle.height, '#66FF00');
    health = game.add.sprite(0,0, healthBar)
}

// Beautiful backflip attack. 
function backFlipAttack() {
    tornado = game.add.emitter(player.x, player.y, 250);
    tornado.makeParticles('laser', 0, 60, false, false); 
    tornado.minParticleSpeed.setTo(-400, -400);
    tornado.maxParticleSpeed.setTo(400, 400);
    tornado.gravity = 0;
    tornado.start(true, 1000, 15, 60, false);
}

function restart(){
    monsters.callAll('kill');
    game.time.events.remove(monsterTimer);
    game.time.events.add(1000, monsterTimer);

    powerfulMonsters.callAll('kill');
    game.time.events.remove(powerfulMonsterTimer);
    powerfulMonsterFires.callAll('kill')

    player.weaponLVL = 1;
    player.revive();
    player.health = 200;
    score = 0;
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: 'white' });
    bulletTime = 0; 
    enemyKilled = 0;
    score = 0;
    playerHit = 0;
    gameOver.visible = false;

    monsterSpacing = 1000;
    powerfulMonsterLaunched = false;
}
