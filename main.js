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

//game variables
const GAME_CONFIG = {
    gravity: 2.5,
    wallSpeed: 20,
    wallGap: 150
};
let isRendering = false, animateFrameId, wallIntervalId, canFly = true, lastFlyTime = 0;
let walls = [];
const bird = new Bird({position: {
        x: canvasWidth/3,
        y: canvasHeight/2
    },
    radius: 50
});

//user input
const keys = {
    ' ': false,
    click: false
};

window.addEventListener('keydown', (event)=>{
    if(event.key in keys && canFly){
        if (event.repeat){
            return;
        }
        keys[event.key] = true;
        canFly = false;
        lastFlyTime = Date.now();
        setTimeout(()=>{
            keys[event.key] = false;
        }, 50);
    }
});
window.addEventListener('keyup', (event)=>{
    if(event.key in keys){
        keys[event.key] = false;
    }
});
window.addEventListener('mousedown', (event)=>{
    if (event.repeat){
        return;
    }
    if(canFly){
        keys.click = true;
        canFly = false;
        lastFlyTime = Date.now();
        setTimeout(()=>{
            keys.click = false;
        }, 50);
    }
});
window.addEventListener('mouseup', (event)=>{
    keys.click = false;
});

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
    wallIntervalId = setInterval(spawnWalls, 2000);
    resetValues();
    hideTitleScreen();
    showGameUi();
    animate();
};
const stopGame = ()=>{
    isRendering = false;
    clearInterval(wallIntervalId);
    cancelAnimationFrame(animateFrameId);
    hideGameUi();
    showTitleScreen();
};
const resetValues = ()=>{
    bird.position = {
        x: canvasWidth/3,
        y: canvasHeight/2
    };
    walls = [];
};

//in-game ui
const showGameUi = ()=>{};
const hideGameUi = ()=>{};

//spawn walls
const spawnWalls = ()=>{
    walls.push(new Wall({position: {
        x: canvasWidth + 50,
        y: 0
    },
    size: {
        width: 100,
        height: 300
    }
    }));
    walls.push(new Wall({position: {
        x: canvasWidth + 50,
        y: 300 + GAME_CONFIG.wallGap
    },
    size: {
        width: 100,
        height: 300
    }
    }));
};

//main game loop
const animate = ()=>{

    if(!isRendering){
        return;
    }
    
    animateFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //update and draw bird
    const updateBird = ()=>{
        if(keys[' '] || keys.click){
            bird.position.y -= bird.flyForce;
        }
        else{
            bird.position.y += GAME_CONFIG.gravity;
        }
        
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
            walls[i].position.x--;
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
    if((Date.now() - lastFlyTime) > 200){
        canFly = true;
    }
};

titleScreen();