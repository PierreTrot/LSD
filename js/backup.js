/* Standard Web */
window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || // Pour Chrome et Safari
           window.mozRequestAnimationFrame    || // Pour Firefox
           window.oRequestAnimationFrame      || // Pour Opera
           window.msRequestAnimationFrame     || // Pour Internet Explorer
           function(callback){                   
               window.setTimeout(callback, 1000 / 60);
           };
})();

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'), // permet de dessiner dans le canvas
	width = 1920,
    height = 176;

/* width and heigth canvas */
canvas.width = width;
canvas.height = height;
/* width and heigth bonus area */
bonusArea.width = 1220;
bonusArea.height = 100;
/* width and heigth ennemi area */
ennemiArea.width = 1280;
ennemiArea.height = 176;







function imageLoaded() {
    game.imagesLoaded ++;
}


/* Tileset, qui découpe le sprite en carré et les mets dans un tableau  qui corespond aux sx et sy*/
function Tileset(image, tileWidth, tileHeight) {
    this.image = new Image();
    game.images ++;
    this.image.onload = imageLoaded;
    this.image.src = image; // récupère le background
    this.tileWidth = tileWidth; // récupère la largeur x
    this.tileHeight = tileHeight; // récupère la hauteur y
}

/* Fonction animation où on stocke les valeurs pour savoir quels frame afficher, la vitesse de l'animation... */
function Animation(tileset, frames, frameDuration) {
    this.tileset = tileset;
    this.frames = frames;
    this.currentFrame = 0;
    this.frameTimer = Date.now();
    this.frameDuration = frameDuration;
}

/* Fonction qui contient les différentes partie de l'animation, avec l'état (left ou right), ses coordonnées x et y, sa taille (width et heigth) et la vitesse de l'animation*/
function Sprite(stateAnimations, startingState, x, y, width, height, speed) {
    this.stateAnimations = stateAnimations; 
    this.currentState = startingState;
    this.x = 20; // position du bonhomme sur x
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
	
}

function ennemi(stateAnimations, startingState, x, y, width, height, speed) {
    this.stateAnimations = stateAnimations; 
    this.currentState = startingState;
    this.x = 200; // position du bonhomme sur x
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
	
}

function Projectile(x, y, trajectory, size, color, speed) {
    this.x = x;
    this.y = y;
    this.trajectory = trajectory;
    this.size = size;
    this.color = color;
    this.speed = speed;
}

/* Trajectoire projectile */
function Trajectory(startX, startY, endX, endY) {
    this.length = Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2));
    this.x = (endX - startX) / this.length;
    this.y = (endY - startY) / this.length;
}

function drawSquare(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), size, size);
}
 
function updateProjectiles(mod) {
    for (var key in projectiles) {
        projectiles[key].x += projectiles[key].trajectory.x * projectiles[key].speed * mod;
        projectiles[key].y += projectiles[key].trajectory.y * projectiles[key].speed * mod;
        if (projectiles[key].x > canvas.width || projectiles[key].x < 0 || projectiles[key].y > canvas.height || projectiles[key].y < 0) {
            projectiles.splice(key, 1);
        }
    }
}

function drawSprite(sprite) {
    ctx.drawImage(
		// appelle l'image
        sprite.stateAnimations[sprite.currentState].tileset.image,
		
		// source x sur l'image
        sprite.stateAnimations[sprite.currentState].frames[sprite.stateAnimations[sprite.currentState].currentFrame].split(',')[0] * sprite.stateAnimations[sprite.currentState].tileset.tileWidth,
		
		// source y sur l'image
        sprite.stateAnimations[sprite.currentState].frames[sprite.stateAnimations[sprite.currentState].currentFrame].split(',')[1] * sprite.stateAnimations[sprite.currentState].tileset.tileHeight,
		
		// source width
        sprite.stateAnimations[sprite.currentState].tileset.tileWidth,
		
		// source height
        sprite.stateAnimations[sprite.currentState].tileset.tileHeight,
		
		// destination x sur le canvas
        Math.round(sprite.x),
		
		// destination y sur le canvas
        Math.round(sprite.y),
		
		// destination width
        sprite.width,
		
		// destination height
        sprite.height
    );
}

/* On compare le temps qui passe avec le temps d'affichage de l'animation 
et si 200 millisecondes sont passé, vaut true, puis on check la position de la frame dans le tableaux. Si ce n'est pas la dernière, on incrémente de 1 sinon on reset la frame à 0; Après le reset on attribue 200 ms avant de recommencer à la frame 0.
*/
function updateAnimation(anim) {
    if (Date.now() - anim.frameTimer > anim.frameDuration) {
        if (anim.currentFrame < anim.frames.length - 1) anim.currentFrame ++;
        else anim.currentFrame = 0;
        anim.frameTimer = Date.now();
    }

}
									/* Variables */

/* Contient les variables relatives aux jeux */
var game = {
    images: 0,
    imagesLoaded: 0
}

/* Déclarations Compteurs */
var itemCounter = 0; // compteur item Bonus
var itemCounterEnemie = 0; // compteur Ennemi

// déclaration item bonus
var item = {
    x: Math.random() * bonusArea.width, // coordonnée aléatoire en x dans la zone bonus
    y: Math.random() * bonusArea.height, // coordonnée aléatoire en y dans la zone bonus
    width: 10, // largeur du bonus
    height: 10, // hauteur du bonus
    color: '#c00' // couleur bonus
};

/* Compteur fps */
var fps = {
    current: 0,
    last: 0,
    lastUpdated: Date.now(),
    draw: function() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 305, 25);
        ctx.font = '12pt Arial';
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'top';
        ctx.fillText(fps.last + 'fps', 5, 5);
    },
    update: function() {
        fps.current ++;
        if (Date.now() - fps.lastUpdated >= 1000) {
            fps.last = fps.current;
            fps.current = 0;
            fps.lastUpdated = Date.now();
        }
    }
}

var spriteTiles = new Tileset('snoop_petit.png', 44, 130); // taille de la sprite

/* On utilise un tableau pour stocker les paramètre des frames, ce tableau sert à définir les coordonnées du Tileset. On connait la la width et la heigth de tile du coup on peut retrouver n'importe quel Tile que l'on veut */
var spriteLeftAnim = new Animation(spriteTiles, ['3,0', '2,0', '1,0', '0,0'], 200);
var spriteRightAnim = new Animation(spriteTiles, ['0,1', '1,1', '2,1', '3,1'], 200);

/* On donne respectivement le nom 'left' pour l'animation left et 'right' pour l'anim de right */
var player = new Sprite({'left': spriteLeftAnim, 'right': spriteRightAnim}, 'right', canvas.width / 2, canvas.height / 2, 44, 91, 100);





/* Detecte si une touche est pressé ou non :) quand une touche est pressé keysDown prend la valeur[touche pressé] pour true*/
var keysDown = {};
window.addEventListener('keydown', function(e) {
    keysDown[e.keyCode] = true;
});
window.addEventListener('keyup', function(e) {
    delete keysDown[e.keyCode];
});

var mouse = {
    x: 0,
    y: 0,
    down: false
}

player.projectileTimer = Date.now();
player.shootDelay = 200; // délai entre chaque balle
var projectiles = [];
 
window.addEventListener('mousedown', function(e) {
    mouse.down = true;
});
window.addEventListener('mouseup', function(e) {
    mouse.down = false;
});
window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX - canvas.offsetLeft;
    mouse.y = e.clientY - canvas.offsetTop;
});


 
/* check touches de clavier et les coordonnées du sprite */
function update(mod) {
	/* le si indique que Si une touché est pressé, le key code retourne true, si true il augmente/diminue la valeur des coordonnées x/y de notre sprite par la vitesse multiplier par le mod( qui permet de garder une framerate stable)*/
	
	 if (37 in keysDown) {
        player.currentState = 'right';
        player.x -= player.speed * mod;
        updateAnimation(player.stateAnimations[player.currentState]);
    }
    else if (39 in keysDown) {
        player.currentState = 'left';
        player.x += player.speed * mod;
        updateAnimation(player.stateAnimations[player.currentState]);
    }
	
	if (this.x >= width-this.width){
		this.x = width-this.width;
	} else if (this.x <= 0) {
		this.x = 0;
	}
	
	if (mouse.down && Date.now() - player.projectileTimer > player.shootDelay) {
        projectiles.push(
            new Projectile(
                player.x + player.width / 2,
                player.y + 15,
                new Trajectory(player.x + player.width / 2, player.y + 15, mouse.x, mouse.y),
                10,
                '#0f0', // couleur projectile
                1000
            )
        );
        player.projectileTimer = Date.now();
    }
 
    updateProjectiles(mod);
	
	/* item bonus qui apparait dans la zone bonus */
		if (
		player.x < item.x + item.width &&
		player.x + player.width > item.x &&
		player.y < item.y + item.height &&
		player.y + player.height > item.y
	) {
		item.x = Math.random() * bonusArea.width;
		item.y = Math.random() * bonusArea.height;
		itemCounter++;
	}
	
	fps.update(); // compteur fps
 
}

/* défini la zone où spawn les ennemis */
function ennemiArea(){
	ctx.fillStyle = 'rgba(255, 0, 0, 0.22)';
	ctx.fillRect(640,0, ennemiArea.width, ennemiArea.height);
}

/* défini la zone où spawn les bonus */
function bonusArea(){
	ctx.fillStyle = 'rgba(83, 167, 0, 0.48)';
	ctx.fillRect(0,0, bonusArea.width, bonusArea.height);
}
 
/* Affichage background */
function render() {
	
 	ctx.fillStyle = game.backgroundImage; // zone qui contient le bg	
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	
	ctx.drawImage(background,0,0); // affiche le background	
	
	fps.draw(); // affiche le compteur fps
	
	ennemiArea(); // affiche la zone enemi
	
	bonusArea(); // affiche la zone bonus
	
	ctx.fillStyle = item.color; // affiche l'item bonus
    ctx.fillRect(item.x, item.y, item.width, item.height);
	
	/* Compteurs */
	
	/* Compteur Pacman */
	ctx.font = '12pt Arial';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.fillText(itemCounter, 120, 5);
	ctx.fillText('Bonus', 135, 5);
	
	/* Compteur Enemie */
	ctx.font = '12pt Arial';
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.fillText(itemCounterEnemie, 240, 5);
	ctx.fillText('Points', 255, 5);
	
    drawSprite(player); // affiche le joueur
	
	/* affichage projectile */
	for (var key in projectiles) {
        drawSquare(projectiles[key].x, projectiles[key].y, projectiles[key].size, projectiles[key].color);
    }
	
	
}
 
function main() {
    update((Date.now() - then) / 1000); // calcul(mod) pour avoir une framerate stable
	
	if(game.images === game.imagesLoaded){ // check si les images sont chargées 
    render();
	}
	
    then = Date.now();
}

/*
function changeMap() {
    document.body.style.backgroundImage = "url('img/bg.jpg')";
}*/


/* Background game */
var background = new Image();
background.src = "img/bg.jpg";

background.onload = function(){
    ctx.drawImage(background,0,0);   
}
 
var then = Date.now();
setInterval(main, 10); // appelle la fonction main toutes les 10 millisecondes