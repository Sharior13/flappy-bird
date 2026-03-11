import { Bird, Wall } from "./entities.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

const titleScreenContainer = document.getElementById('title-screen');
const gameUiContainer = document.getElementById('game-ui');
const currentScoreContainer = document.getElementById('current-score');
const highScoreContainer = document.getElementById('high-score');

//resize canvas acc to user viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let canvasWidth = canvas.width; 
let canvasHeight = canvas.height;

window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
});

const isMobileDevice = ()=>{
    return Math.min(window.screen.width, window.screen.height) < 768;
};

//game variables
const GAME_CONFIG = {
    birdRadius: isMobileDevice() ? 25 : 50,
    flyBuffer: isMobileDevice() ? 0.15 : 0.2,
    gravity: isMobileDevice() ? 600 : 800,
    wallWidth: isMobileDevice() ? 60 : 100,
    wallGap: isMobileDevice() ? 190 : 230, //gap between upper and lower walls
    wallDeleteBuffer: 50,
};
const ORIGINAL_BIRD_POSITION = {
    x: canvasWidth/6,
    y: canvasHeight/2
};
const ORIGINAL_WALL_CONFIG = {
    speed: isMobileDevice() ? 80 : 200,
    delay: [isMobileDevice() ? 2.2 : 1.5, isMobileDevice() ? 5.5 : 4.0], //min/max wall delay value
    timer: 0,
    nextDelay: 0

};

let wall_config = ORIGINAL_WALL_CONFIG;
let isRendering = false, animateFrameId, canFly = true, lastFlyTime = 0, lastUpdateTime = 0, highScore = 0;
let walls = [];
const bird = new Bird({position: ORIGINAL_BIRD_POSITION,
    radius: GAME_CONFIG.birdRadius,
    flyForce: isMobileDevice()? -320 :-350
});

//user input handlers
const keys = {
    ' ': false,
    click: false
};

const handleKeyDown = (event)=>{
    if (event.repeat){
            return;
    }
    if(canFly){
        if(event.key in keys){
            keys[event.key] = true;
            setTimeout(()=>{
                keys[event.key] = false;
            }, 50);
        }
        else if(event.type  == "mousedown" || event.type == "touchstart"){
            keys.click = true;
            setTimeout(()=>{
                keys.click = false;
            }, 50);
        }
        canFly = false;
        lastFlyTime = lastUpdateTime/1000;
    }
};

const handleKeyUp = (event)=>{
    if(event.key in keys){
        keys[event.key] = false;
    }
    else if(event.type  == "mouseup" || event.type == "touchend"){
        keys.click = false;
    }
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('mousedown', handleKeyDown);
window.addEventListener('mouseup', handleKeyUp);
window.addEventListener('touchstart', handleKeyDown);
window.addEventListener('touchend', handleKeyUp);


//title screen ui
const showTitleScreen = ()=>{
    titleScreenContainer.classList.remove('hidden');
};
const hideTitleScreen = ()=>{
    titleScreenContainer.classList.add('hidden');
};

titleScreenContainer.addEventListener('click', (event)=>{
    if(event.target.nodeName != "BUTTON"){
        return;
    }
    switch(event.target.id){
        case 'play':
            startGame();
            break;
        case 'settings':
            //add settings later
            break;
    }
});

//helper functions
const startGame = ()=>{
    isRendering = true;
    highScore = getHighScore() || 0;
    resetValues();
    hideTitleScreen();
    showGameUi();
    requestAnimationFrame(animate);
};
const stopGame = ()=>{
    isRendering = false;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    cancelAnimationFrame(animateFrameId);
    hideGameUi();
    showTitleScreen();
};
const resetValues = ()=>{
    lastUpdateTime = 0;
    lastFlyTime = 0;
    bird.position = ORIGINAL_BIRD_POSITION;
    bird.velocity = 0;
    bird.score = 0;
    currentScoreContainer.innerHTML = `Score: ${bird.score}`;
    highScoreContainer.innerHTML = `High Score: ${highScore}`;
    walls = [];
    wall_config = ORIGINAL_WALL_CONFIG;
};
const getRandomDelay = ()=>{
    return Math.random() * (wall_config.delay[1] - wall_config.delay[0]) + wall_config.delay[0];
};
const getHighScore = ()=>{
    return localStorage.getItem('highScore');
};
const setHighScore = (score)=>{
    localStorage.setItem('highScore', score);
};

//in-game ui
const showGameUi = ()=>{
    gameUiContainer.classList.remove('hidden');
};
const hideGameUi = ()=>{
    gameUiContainer.classList.add('hidden');
};
const updateUi = ()=>{
    currentScoreContainer.innerHTML = `Score: ${bird.score}`;
    if(bird.score > highScore){
        setHighScore(bird.score);
    }
    highScore = getHighScore();
    highScoreContainer.innerHTML = `High Score: ${highScore}`;
};


//check for collision
const isBirdWallColliding = (bird, wall)=>{
    const closestX = Math.max(wall.position.x, Math.min(bird.position.x, wall.position.x + wall.size.width));
    const closestY = Math.max(wall.position.y, Math.min(bird.position.y, wall.position.y + wall.size.height));
    
    const distanceX = bird.position.x - closestX;
    const distanceY = bird.position.y - closestY;
    
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    const radiusSquared = bird.radius * bird.radius;
    
    return distanceSquared < radiusSquared;
};

//update and draw bird
const updateBird = (deltaTime)=>{
    bird.velocity += GAME_CONFIG.gravity * deltaTime;
    
    if(keys[' '] || keys.click){
        bird.velocity = bird.flyForce;
    }
    
    bird.position.y += bird.velocity * deltaTime;
    bird.position.y = Math.max(bird.radius, Math.min(bird.position.y, canvasHeight - bird.radius));
};
const drawBird = ()=>{
    ctx.beginPath();
    ctx.arc(bird.position.x, bird.position.y, bird.radius, 0, 2*Math.PI);
    ctx.fillStyle = bird.color;
    ctx.fill();
    ctx.closePath();
};

//spawn walls
const spawnWalls = ()=>{
    let wallHeight = Math.floor(Math.random() * ((canvasHeight - GAME_CONFIG.wallGap) - 0) + 0);
    walls.push(new Wall({position: {
        x: canvasWidth,
        y: 0
    },
    size: {
        width: GAME_CONFIG.wallWidth,
        height: wallHeight
    }
    }));
    walls.push(new Wall({position: {
        x: canvasWidth,
        y: wallHeight + GAME_CONFIG.wallGap
    },
    size: {
        width: GAME_CONFIG.wallWidth,
        height: canvasHeight - (wallHeight + GAME_CONFIG.wallGap)
    }
    }));
};

//update and draw walls
const updateWalls = (deltaTime)=>{
    for(let i=0; i<walls.length; i++){
        walls[i].position.x -= wall_config.speed * deltaTime;

        //bird-wall collision
        if(isBirdWallColliding(bird, walls[i])){
            stopGame();
            return;
        }

        //scoring logic
        if(bird.position.x - bird.radius > walls[i].right && !walls[i].hasPassed){
            bird.score++;
            updateUi();
            walls[i].hasPassed = true;
            walls[i+1].hasPassed = true;
            wall_config.speed = Math.min(wall_config.speed + (isMobileDevice() ? bird.score * 1 : bird.score * 2), isMobileDevice() ? 450 : 800);
            const minDelay = isMobileDevice() ? 2.2 : 1.5;
            const maxDelay = isMobileDevice() ? 5.5 : 4.0;
            wall_config.delay = [minDelay, Math.max(maxDelay - bird.score / 10, minDelay)];
        }
    }
};
const drawWalls = ()=>{
    for(let i=0; i<walls.length; i++){
        ctx.beginPath();
        ctx.fillStyle = walls[i].color;
        ctx.fillRect(walls[i].position.x, walls[i].position.y, walls[i].size.width, walls[i].size.height);
        ctx.closePath();
    }
};

//for debug
const drawGridLines = ()=>{
    ctx.beginPath();
    ctx.strokeStyle = "red";
    
    ctx.moveTo(canvasWidth/2, 0);
    ctx.lineTo(canvasWidth/2, canvasHeight);
    ctx.stroke();
    
    ctx.moveTo(0, canvasHeight/2);
    ctx.lineTo(canvasWidth, canvasHeight/2);
    ctx.stroke();
    
    ctx.closePath();
};

//main game loop
const animate = (timestamp)=>{
    
    if(!isRendering){
        return;
    }
    if(lastUpdateTime == 0){
        lastUpdateTime = timestamp;
    }
    const deltaTime = Math.min((timestamp - lastUpdateTime) / 1000, 0.05);
    lastUpdateTime = timestamp;
    
    animateFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    //optimize wall
    walls = walls.filter(wall => wall.right + GAME_CONFIG.wallDeleteBuffer > 0);
    
    drawGridLines();
    
    updateWalls(deltaTime);
    
    if(!isRendering){
        return;
    }
    
    drawWalls();
    
    updateBird(deltaTime);
    drawBird();
    
    //bird-border collision detection
    if(bird.position.y + bird.radius >= canvasHeight || bird.position.y - bird.radius <= 0){
        stopGame();
        return;
    }

    //wall spawn time logic
    wall_config.timer += deltaTime;
    if(wall_config.timer > wall_config.nextDelay){
        spawnWalls();
        wall_config.timer = 0;
        wall_config.nextDelay = getRandomDelay();
    }

    //flying logic
    if((lastUpdateTime/1000) - lastFlyTime > GAME_CONFIG.flyBuffer){
        canFly = true;
    }
};

showTitleScreen();