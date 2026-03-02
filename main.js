import { Bird } from "./entities.js";

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


const CONFIG = {
    gravity: 3
};
let isRendering = false, canFly = true, lastFlyTime=0;
const bird = new Bird({position: {
        x: canvasWidth/3,
        y: canvasHeight/2
    },
    radius: 75
});

//user input
const keys = {
    ' ': false
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

const startGame = ()=>{
    isRendering = true;
    hideTitleScreen();
    showGameUi();
    animate();
};
const stopGame = ()=>{
    isRendering = false;
    hideGameUi();
    showTitleScreen();
};

//in-game ui
const showGameUi = ()=>{};
const hideGameUi = ()=>{};

//main game loop
const animate = ()=>{

    if(!isRendering){
        return;
    }

    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const updateBird = ()=>{
        if(keys[' ']){
            bird.position.y -= bird.flyForce;
        }
        else{
            bird.position.y += CONFIG.gravity;
        }
        
        bird.position.y = Math.max(bird.radius, Math.min(bird.position.y, canvasHeight - bird.radius));
    };
    const drawBird = ()=>{
        ctx.beginPath();
        ctx.arc(bird.position.x, bird.position.y, bird.radius, 0, 2*Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    };

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

    //for debug
    drawGridLines();

    if((Date.now() - lastFlyTime) > 200){
        canFly = true;
    }

    drawBird();
    updateBird();
    console.log(keys);
};

titleScreen();