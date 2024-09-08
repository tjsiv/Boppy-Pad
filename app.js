const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');



// Set canvas size
canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight - 200;

let drawing = false;
let penColor = '#000000';
let bgColor = '#ffffff';

function setCanvasBackground(color) {
    canvas.style.backgroundColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = penColor;

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

setCanvasBackground(bgColor);