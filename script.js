const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================
// GAME VARIABLES
// =======================

let gameRunning = true;


let keys = {};


let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

let score = 0;

let level = 1;

let xp = 0;

let xpToLevel = 100;

let levelUp = false;

let upgradeChoices = [];

let maxHealth = 100;

let health = maxHealth;

let playerDamage = 25;

let damageMultiplier = 1;

let fireRate = 300;

let canShoot = true;

let shooting = false;

let weaponLevel = 1;

let maxWeaponLevel = 5;

let bulletCount = 1;

let wave = 1;

let zombiesToSpawn = 10;

let zombiesSpawned = 0;

let waveCleared = false;

let coins = 0;

let killStreak = 0;

let streakTimer = 0;

let shopOpen = false;

// BOSS SYSTEM

let bossActive = false;

let bossSpawnedThisWave = false;

let bossWarning = false;

let bossWarningTimer = 0;

// SCREEN SHAKE

let damageFlash = 0;

let shake = 0;

let lowHealthPulse = 0;

let playerDamageCooldown = false;

// =======================
// WEAPON SYSTEM
// =======================

let maxAmmo = 12;

let ammo = 12;

let reloading = false;

let reloadTime = 1500;

// =======================
// UPGRADE SHOP SYSTEM
// =======================

function buyUpgrade(choice){

if(choice === "5"){

if(coins >= 200 && weaponLevel < maxWeaponLevel){

coins -= 200;

weaponLevel++;

bulletCount++;

playerDamage += 5;

console.log(
"Weapon Level: " + weaponLevel
);

}

}

if(choice === "2"){

if(coins >= 75){

coins -= 75;

maxHealth += 20;

health = maxHealth;

console.log("Health upgraded!");

}

}

if(choice === "3"){

if(coins >= 100){

coins -= 100;

player.speed += 1;

console.log("Speed upgraded!");

}

}

if(choice === "4"){

if(coins >= 150){

coins -= 150;

reloadTime -= 200;

console.log("Reload upgraded!");

}

}

if(choice === "5"){

if(coins >= 200){

coins -= 200;

weaponLevel++;

bulletCount++;

console.log("Weapon upgraded!");

}

}

updateHUD();

}

function reload(){

    if(reloading)
        return;

    if(ammo === maxAmmo)
        return;

    reloading = true;

    setTimeout(()=>{

        ammo = maxAmmo;

        reloading = false;

        updateHUD();

    }, reloadTime);

}

function shoot(){

if(!gameRunning)
return;

if(!shooting)
return;

if(!canShoot)
return;

if(reloading)
return;

if(ammo <=0)
return;

let speed = 10;

for(let i = 0; i < Math.min(bulletCount,7); i++){

let spread = 0;

if(bulletCount > 1){

spread = (i - (bulletCount-1)/2) * 0.15;

}

bullets.push({

x:player.x,

y:player.y,

dx:Math.cos(player.angle + spread)*speed,

dy:Math.sin(player.angle + spread)*speed,

size:5

});

// MUZZLE FLASH

createParticle(

player.x + Math.cos(player.angle) * 35,

player.y + Math.sin(player.angle) * 35,

"orange"

);

ammo--;

updateHUD();

canShoot = false;

setTimeout(()=>{

canShoot = true;

},fireRate);

}

}
// =======================
// DASH SYSTEM
// =======================

let canDash = true;

let dashPower = 80;

let dashCooldown = 3000;

// =======================
// PLAYER
// =======================

const player = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    size:25,

    speed:5,

    color:"#00ff99",

    angle:0

};

// =======================
// OBJECTS
// =======================

let bullets = [];

let zombies = [];

let particles = [];

let damageTexts = [];

let drops = [];

// =======================
// INPUT SYSTEM
// =======================

window.addEventListener(
"keydown",
(e)=>{

let key = e.key.toLowerCase();

if(levelUp){


if(key === "1"){

playerDamage += 5;

}


if(key === "2"){

player.speed += 1;

}


if(key === "3"){

fireRate -= 50;

}


levelUp = false;

upgradeChoices = [];


return;

}
    
if(key === " "){

keys["space"] = true;

}else{

keys[key] = true;

}

if(key === "r"){

reload();

}

if(key=="r"){

reload();

}
    
if(key=="b"){

shopOpen = !shopOpen;

}

if(key=="1"){

buyUpgrade("1");

}

if(key=="2"){

buyUpgrade("2");

}

if(key=="3"){

buyUpgrade("3");

}

if(key=="4"){

buyUpgrade("4");

}

if(key=="5"){

buyUpgrade("5");

}
    
});

window.addEventListener(
"keyup",
(e)=>{

let key = e.key.toLowerCase();
    
if(key === " "){

keys["space"] = false;

}else{

keys[key] = false;

}

});

canvas.addEventListener(
"mousedown",
()=>{

shooting = true;

});

canvas.addEventListener(
"mouseup",
()=>{

shooting = false;

});

canvas.addEventListener(
"mousemove",
(e)=>{

let rect = canvas.getBoundingClientRect();

mouse.x = e.clientX - rect.left;

mouse.y = e.clientY - rect.top;

player.angle = Math.atan2(

mouse.y-player.y,

mouse.x-player.x

);

});

// =======================
// PLAYER MOVEMENT
// =======================

function movePlayer(){

let moving = false;

if(keys["w"]){

player.y -= player.speed;

moving = true;

}

if(keys["s"]){

player.y += player.speed;

moving = true;

}

if(keys["a"]){

player.x -= player.speed;

moving = true;

}

if(keys["d"]){

player.x += player.speed;

moving = true;

}

// DASH

if(keys["space"] && canDash && moving){

let dx = 0;

let dy = 0;

if(keys["w"])
dy = -1;

if(keys["s"])
dy = 1;

if(keys["a"])
dx = -1;

if(keys["d"])
dx = 1;

player.x += dx * dashPower;

player.y += dy * dashPower;

canDash = false;

setTimeout(()=>{

canDash = true;

}, dashCooldown);

}

// BOUNDARIES

player.x = Math.max(

0,

Math.min(canvas.width,player.x)

);

player.y = Math.max(

0,

Math.min(canvas.height,player.y)

);

}

// =======================
// BULLET UPDATE
// =======================

function updateBullets(){

bullets.forEach((bullet,index)=>{

bullet.x += bullet.dx;

bullet.y += bullet.dy;

// BULLET TRAIL

createParticle(

bullet.x,

bullet.y,

"lightblue"

);

if(

bullet.x < 0 ||

bullet.x > canvas.width ||

bullet.y < 0 ||

bullet.y > canvas.height

){

bullets.splice(index,1);

}

});

}

function updateParticles(){

particles.forEach((p,index)=>{

p.x += p.speedX;

p.y += p.speedY;

p.life--;

// SHRINK EFFECT

p.size *= 0.95;

if(p.life <=0 || p.size < 0.5){

particles.splice(index,1);

}

});

}

// DAMAGE TEXT SYSTEM

function updateDamageTexts(){


damageTexts.forEach((d,index)=>{


d.y += d.speedY;


d.life--;


if(d.life <= 0){

damageTexts.splice(index,1);

}


});


}

// DROP UPDATE SYSTEM

function updateDrops(){


drops.forEach((d,index)=>{


let distance = Math.hypot(

player.x - d.x,

player.y - d.y

);

if(distance < 120){

d.x += (player.x - d.x) * 0.05;

d.y += (player.y - d.y) * 0.05;

}

if(distance < player.size + d.size){


if(d.type === "coin"){

coins += 5;

}


if(d.type === "health"){

health += 25;


if(health > maxHealth){

health = maxHealth;

}

}


drops.splice(index,1);


updateHUD();


}


});


}

function createParticle(x,y,color){

if(particles.length > 200){

return;

}
    

particles.push({

x:x,

y:y,

size:Math.random()*5+2,

color:color,

life:30,

maxLife:30,

speedX:(Math.random()-0.5)*5,

speedY:(Math.random()-0.5)*5

});

}

// DAMAGE TEXT SYSTEM

function createDamageText(x,y,damage){

damageTexts.push({

x:x,

y:y,

text:"-"+damage,

life:40,

speedY:-1

});

}

function createDrop(x,y,type){


drops.push({

x:x,

y:y,

type:type,

size:12

});

}

function gainXP(amount){

xp += amount;

if(xp >= xpToLevel){

level++;

xp = 0;

xpToLevel += 50;

levelUp = true;

upgradeChoices = [

"Damage +5",

"Speed +1",

"Fire Rate +10%"

];

}

}

// =======================
// SPAWN ZOMBIE SYSTEM
// =======================

function spawnZombie(){

console.log("SPAWNING ZOMBIE");

let side = Math.floor(Math.random()*4);

let x,y;

if(side===0){

x=0;

y=Math.random()*canvas.height;

}

if(side===1){

x=canvas.width;

y=Math.random()*canvas.height;

}

if(side===2){

x=Math.random()*canvas.width;

y=0;

}

if(side===3){

x=Math.random()*canvas.width;

y=canvas.height;

}
// =======================
// BOSS CHECK
// =======================

if(
wave % 5 === 0 &&
bossActive === false &&
bossSpawnedThisWave === false
){

bossActive = true;

bossSpawnedThisWave = true;

bossWarning = true;

bossWarningTimer = 180;

let boss = {

type:"boss",

x:x,

y:y,

size:70,

speed:1,

hp:1000,

maxHp:1000,

color:"purple",

hitFlash:0

};

zombies.push(boss);

return;

}

// =======================
// RANDOM ZOMBIE TYPE
// =======================

let typeRoll = Math.random();

let zombie;

// WALKER

if(typeRoll < 0.7){

zombie = {

type:"walker",

x:x,

y:y,

size:25,

speed:1.5,

hp:50,

color:"green",

hitFlash:0
    
};

}

// RUNNER

else if(typeRoll < 0.9){

zombie = {

type:"runner",

x:x,

y:y,

size:20,

speed:3,

hp:30,

color:"orange",

hitFlash:0 

};

}
// TANK

else{

zombie = {

type:"tank",

x:x,

y:y,

size:40,

speed:0.8,

hp:200,

color:"#555",

hitFlash:0
    
};

}

zombies.push(zombie);

}

// =======================
// ZOMBIE AI
// =======================

function updateZombies(){

zombies.forEach((zombie,index)=>{

let angle = Math.atan2(

player.y-zombie.y,

player.x-zombie.x

);

zombie.x += Math.cos(angle)*zombie.speed;

zombie.y += Math.sin(angle)*zombie.speed;

// =======================
// PLAYER DAMAGE
// =======================

let distance = Math.hypot(

player.x-zombie.x,

player.y-zombie.y

);

if(distance < player.size + zombie.size){

if(!playerDamageCooldown){

if(zombie.type === "boss"){

health -= 10;

}else{

health -= 5;

}

damageFlash = 10;

shake = 10;
    
updateHUD();

playerDamageCooldown = true;

setTimeout(()=>{

playerDamageCooldown = false;

},800);

if(health <= 0){

endGame();

}

}

}

// =======================
// BULLET DAMAGE
// =======================

bullets.forEach((bullet,bIndex)=>{

let hit = Math.hypot(

bullet.x-zombie.x,

bullet.y-zombie.y

);

if(hit < zombie.size){

zombie.hp -= playerDamage * damageMultiplier;

createDamageText(

zombie.x,

zombie.y,

playerDamage

);

zombie.hitFlash = 5;

// HIT EFFECT

createParticle(

bullet.x,

bullet.y,

"red"

);
    
bullets.splice(bIndex,1);

if(zombie.type === "boss"){

shake = 10;

}

if(zombie.hp <= 0){

let burstAmount = 8;


if(zombie.type === "boss"){

burstAmount = 25;

}

for(let i = 0; i < burstAmount; i++){

createParticle(

zombie.x,

zombie.y,

"red"

);


}

if(Math.random() < 0.3){

createDrop(

zombie.x,

zombie.y,

"coin"

);

}

if(Math.random() < 0.1){

createDrop(

zombie.x,

zombie.y,

"health"

);

}
    
if(zombie.type === "boss"){

bossActive = false;

score += 10;

coins += 100;

}else{

score++;

coins += 10;

killStreak++;

streakTimer = 180;

if(killStreak === 5){

damageMultiplier = 1.5;

}

}


zombies.splice(index,1);

updateHUD();

            }

        }

    }

    });

});

// =======================
// WAVE CHECK
// =======================

if(

zombies.length === 0 &&

zombiesSpawned >= zombiesToSpawn &&

waveCleared === false

){

waveCleared = true;

nextWave();

}

}

// =======================
// NEXT WAVE
// =======================

function nextWave(){

wave++;

zombiesSpawned = 0;

zombiesToSpawn += 5;

waveCleared = false;

updateHUD();

}

// =======================
// DRAW
// =======================

function draw(){

ctx.clearRect(

0,

0,

canvas.width,

canvas.height

);

// KILL STREAK TEXT

if(killStreak > 1){

ctx.fillStyle = "orange";

ctx.font = "30px Arial";

ctx.fillText(

"KILL STREAK x" + killStreak,

canvas.width/2 - 100,

50

);

}

// SCREEN SHAKE

if(shake > 0){

ctx.translate(

Math.random()*shake-shake/2,

Math.random()*shake-shake/2

);

shake--;

}

ctx.setTransform(1,0,0,1,0,0);
  
// DAMAGE FLASH

if(damageFlash > 0){

ctx.fillStyle = "rgba(255,0,0,0.3)";

ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);

damageFlash--;

}

// LOW HEALTH WARNING

if(health <= 25){

lowHealthPulse += 0.05;


ctx.fillStyle = 
"rgba(255,0,0," + 
(0.2 + Math.sin(lowHealthPulse)*0.2) +
")";


ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);

}

// PLAYER

ctx.fillStyle = player.color;

ctx.beginPath();

ctx.arc(

player.x,

player.y,

player.size,

0,

Math.PI*2

);

ctx.fill();

// AIM LINE

ctx.strokeStyle="white";

ctx.beginPath();

ctx.moveTo(

player.x,

player.y

);

ctx.lineTo(

mouse.x,

mouse.y

);

ctx.stroke();

// BULLETS

ctx.fillStyle="yellow";

bullets.forEach(b=>{

ctx.beginPath();

ctx.arc(

b.x,

b.y,

b.size,

0,

Math.PI*2

);

ctx.fill();

});

// PARTICLES

particles.forEach(p=>{

ctx.fillStyle = p.color;

ctx.beginPath();

ctx.arc(

p.x,

p.y,

p.size,

0,

Math.PI*2

);

ctx.fill();

});

// DAMAGE TEXT

ctx.fillStyle = "white";

ctx.font = "20px Arial";

damageTexts.forEach(d=>{

ctx.fillText(

d.text,

d.x,

d.y

);

});

// DROPS

drops.forEach(d=>{


if(d.type === "coin"){

ctx.fillStyle="yellow";

}else if(d.type === "health"){

ctx.fillStyle="lime";

}else{

ctx.fillStyle="red";

}


ctx.beginPath();

ctx.arc(

d.x,

d.y,

d.size,

0,

Math.PI*2

);

ctx.fill();


});
    
// ZOMBIES

zombies.forEach(z=>{

if(z.hitFlash > 0){

ctx.fillStyle = "white";

z.hitFlash--;

}else{

ctx.fillStyle = z.color;

}

ctx.beginPath();

ctx.arc(

z.x,

z.y,

z.size,

0,

Math.PI*2

);

ctx.fill();

});

// =======================
// BOSS HP BAR
// =======================

zombies.forEach(z=>{

if(z.type === "boss"){

let barWidth = 400;

let hpPercent = z.hp / z.maxHp;

ctx.fillStyle="gray";

ctx.fillRect(

canvas.width/2-barWidth/2,

20,

barWidth,

25

);

ctx.fillStyle="red";

ctx.fillRect(

canvas.width/2-barWidth/2,

20,

barWidth*hpPercent,

25

);

ctx.fillStyle="white";

ctx.font="20px Arial";

ctx.fillText(

"BOSS",

canvas.width/2-30,

65

);

}

});

// BOSS WARNING

if(bossWarning){

ctx.fillStyle="red";

ctx.font="40px Arial";

ctx.fillText(

"⚠️ BOSS INCOMING ⚠️",

canvas.width/2-220,

canvas.height/2

);

bossWarningTimer--;

if(bossWarningTimer <= 0){

bossWarning=false;

}

}

// =======================
// SHOP UI
// =======================

if(shopOpen){

ctx.fillStyle="rgba(0,0,0,0.8)";

ctx.fillRect(

100,

50,

canvas.width-200,

canvas.height-100

);

ctx.fillStyle="white";


ctx.font="30px Arial";


ctx.fillText(

"UPGRADE SHOP",

canvas.width/2-120,

120

);

ctx.font="20px Arial";

ctx.fillText(

"Coins: "+coins,

150,

170

);

ctx.fillText(

"1. Damage +5  (50 Coins)",

150,

220

);

ctx.fillText(

"2. Health +20 (75 Coins)",

150,

260

);

ctx.fillText(

"3. Speed +1 (100 Coins)",

150,

300

);

ctx.fillText(

"4. Reload Faster (150 Coins)",

150,

340

);
    
ctx.fillText(

"5. Weapon Upgrade (200 Coins) LVL "+weaponLevel,

150,

380

);
    
ctx.fillText(

"Press B to Close",

150,

400

);

}

// LEVEL UP MENU

if(levelUp){

ctx.fillStyle="rgba(0,0,0,0.8)";

ctx.fillRect(

100,

100,

canvas.width-200,

300

);

ctx.fillStyle="white";

ctx.font="30px Arial";

ctx.fillText(

"LEVEL UP!",

canvas.width/2-80,

160

);

ctx.font="20px Arial";

upgradeChoices.forEach((u,index)=>{

ctx.fillText(

(index+1)+". "+u,

180,

220+(index*40)

);

});

}
    
// RESET SHAKE

ctx.setTransform(

1,

0,

0,

1,

0,

0

);

}
    
// =======================
// HUD
// =======================

function updateHUD(){

document.getElementById("health").innerHTML =
Math.floor(health);

document.getElementById("kills").innerHTML =
score;

document.getElementById("coins").innerHTML =
coins;

document.getElementById("ammo").innerHTML =
ammo+" / "+maxAmmo;

document.getElementById("wave").innerHTML =
wave;

}

// =======================
// GAME OVER
// =======================

function endGame(){

gameRunning = false;

document

.getElementById("gameOver")

.classList.remove("hidden");

}

document

.getElementById("restartBtn")

.addEventListener(

"click",

()=>{

location.reload();

});

// =======================
// GAME LOOP
// =======================

function gameLoop(){

if(gameRunning){

if(!shopOpen && !levelUp){

movePlayer();

shoot();

updateBullets();

updateParticles();

updateDamageTexts();

updateDrops();
    
updateZombies();

if(streakTimer > 0){

streakTimer--;

}else{

killStreak = 0;

damageMultiplier = 1;

}
    
}

draw();

}

requestAnimationFrame(gameLoop);

}

// =======================
// BOSS MINION SPAWN
// =======================

function spawnNormalMinion(){

let side = Math.floor(Math.random()*4);

let x,y;

if(side===0){

x=0;

y=Math.random()*canvas.height;

}

if(side===1){

x=canvas.width;

y=Math.random()*canvas.height;

}

if(side===2){

x=Math.random()*canvas.width;

y=0;

}

if(side===3){

x=Math.random()*canvas.width;

y=canvas.height;

}

let minion = {

type:"walker",

x:x,

y:y,

size:25,

speed:1.5,

hp:50,

color:"green",

};

zombies.push(minion);

}

// =======================
// SPAWN TIMER
// =======================

setInterval(()=>{

if(gameRunning){

if(
zombiesSpawned < zombiesToSpawn
){

spawnZombie();

zombiesSpawned++;

}

// BOSS MINIONS

if(
bossActive &&
Math.random() < 0.02
){

spawnNormalMinion();

}

}

},1200);

// =======================
// START GAME
// =======================

updateHUD();

gameLoop();
