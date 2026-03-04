import { Bird, Wall } from "./entities.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

const titleScreenContainer = document.getElementById('title-screen');

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
    flyBuffer: 200,
    gravity: 800,
    wallWidth: isMobileDevice() ? 50 : 100,
    wallSpeed: 200,
    wallGap: isMobileDevice() ? 125 : 250, //gap between upper and lower walls
    wallDeleteBuffer: 50,
    wallDelay: Math.floor(Math.random() * (6000 - 1500) + 1500) //change ts
};
let isRendering = false, animateFrameId, wallIntervalId, canFly = true, lastFlyTime = 0, lastUpdateTime = null;
let walls = [];
const bird = new Bird({position: {
        x: canvasWidth/3,
        y: canvasHeight/2
    },
    radius: GAME_CONFIG.birdRadius
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
        lastFlyTime = Date.now();
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

const titleScreen = ()=>{
    showTitleScreen();
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
};

//helper functions
const startGame = ()=>{
    isRendering = true;
    wallIntervalId = setInterval(spawnWalls, GAME_CONFIG.wallDelay);
    resetValues();
    hideTitleScreen();
    showGameUi();
    requestAnimationFrame(animate);
};
const stopGame = ()=>{
    isRendering = false;
    clearInterval(wallIntervalId);
    cancelAnimationFrame(animateFrameId);
    hideGameUi();
    showTitleScreen();
};
const resetValues = ()=>{
    lastUpdateTime = null;
    bird.position = {
        x: canvasWidth/3,
        y: canvasHeight/2
    };
    bird.velocity = 0;
    walls = [];
};

//in-game ui
const showGameUi = ()=>{};
const hideGameUi = ()=>{};

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
        height: canvasHeight - (wallHeight - GAME_CONFIG.wallGap)
    }
    }));
};

//main game loop
const animate = (timestamp)=>{

    if(!isRendering){
        return;
    }
    if(lastUpdateTime == null){
        lastUpdateTime = timestamp;
    }
    const deltaTime = Math.min((timestamp - lastUpdateTime) / 1000, 0.05);
    lastUpdateTime = timestamp;

    animateFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //update and draw bird
    const updateBird = ()=>{
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

    //update and draw walls
    const updateWalls = ()=>{
        for(let i=0; i<walls.length; i++){
            walls[i].position.x -= GAME_CONFIG.wallSpeed * deltaTime;

            //optimize walls
            if(walls[i].right + GAME_CONFIG.wallDeleteBuffer <= 0){
                walls.splice(i, 1);
                i--;
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

    drawGridLines();

    
    updateWalls();
    drawWalls();
    
    updateBird();
    drawBird();
    
    //bird-border collision detection
    if(bird.position.y + bird.radius >= canvasHeight || bird.position.y - bird.radius <= 0){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        stopGame();
    }

    //flying logic
    if((Date.now() - lastFlyTime) > GAME_CONFIG.flyBuffer){
        canFly = true;
    }
};

titleScreen();