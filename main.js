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

//user input
const keys = {
    ' ': false
};

window.addEventListener('keydown', (event)=>{
    if(event.key in keys){
        keys[event.key] = true;
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
                hideTitleScreen();
                gameUi();
                animate();
            case 'settings':
                //add settings later
                return;
            default:
                return;
        }
    });
};

//in-game ui
const gameUi = ()=>{};

//main game loop
const animate = ()=>{
    requestAnimationFrame(animate);

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

    console.log(keys);
};

titleScreen();