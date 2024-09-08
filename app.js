// statics
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
//tools
const penColorInput = document.getElementById('penColor');
const bgColorInput = document.getElementById('bgColor');
const brushSizeInput = document.getElementById('brushSize');
const toolTypeSelect = document.getElementById('toolType');

// buttons
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// layers
const layerSelect = document.getElementById('layerSelect');
const layerVisibility = document.getElementById('layerVisibility');
const brushOpacityInput = document.getElementById('brushOpacity');
const opacityValueSpan = document.getElementById('opacityValue');
let brushOpacity = 1;

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    layers.forEach(layer => {
        layer.canvas.width = canvas.width;
        layer.canvas.height = canvas.height;
    });
    redrawCanvas();
}

let drawing = false;
let penColor = '#000000';
let bgColor = '#ffffff';
let brushSize = 5;
let toolType = 'pen';
const MAX_LAYERS = 6;
let layers = [];
let currentLayer = 0;

function createLayer() {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    return {
        canvas: layerCanvas,
        context: layerCanvas.getContext('2d'),
        visible: true
    };
}

function initializeLayers() {
    for (let i = 0; i < MAX_LAYERS; i++) {
        layers.push(createLayer());
    }
}

function redrawCanvas() {//perpetuates drwing 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground(bgColor);
    layers.forEach(layer => {
        if (layer.visible) {
            ctx.drawImage(layer.canvas, 0, 0);
        }
    });
}

function setCanvasBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    drawing = true;
    drawPoint(e); // Draw a single point when starting
}

function stopDrawing() {
    drawing = false;
    layers[currentLayer].context.beginPath(); // Start a new path when stopping
}

function drawPoint(e) {
    const layer = layers[currentLayer];
    layer.context.lineWidth = brushSize;
    layer.context.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolType === 'eraser') {
        layer.context.globalCompositeOperation = 'destination-out';
        layer.context.globalAlpha = 1; // Eraser should always be fully opaque
    } else {
        layer.context.globalCompositeOperation = 'source-over';//comosite op refers to order of drawing path
        layer.context.globalAlpha = brushOpacity;//global alpha refers to transparency
        layer.context.strokeStyle = penColor;
    }

    layer.context.beginPath();
    layer.context.moveTo(x, y);
    layer.context.lineTo(x, y);
    layer.context.stroke();

    redrawCanvas();
}

function draw(e) {
    if (!drawing) return;
    const layer = layers[currentLayer];
    layer.context.lineWidth = brushSize;
    layer.context.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolType === 'eraser') {
        layer.context.globalCompositeOperation = 'destination-out';
        layer.context.globalAlpha = 1; // Eraser should always be fully opaque
    } else {
        layer.context.globalCompositeOperation = 'source-over';
        layer.context.globalAlpha = brushOpacity;
        layer.context.strokeStyle = penColor;
    }

    layer.context.lineTo(x, y);
    layer.context.stroke();
    layer.context.beginPath();
    layer.context.moveTo(x, y);

    redrawCanvas();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('click', drawPoint); 

penColorInput.addEventListener('change', (e) => {
    penColor = e.target.value;
});

bgColorInput.addEventListener('change', (e) => {
    bgColor = e.target.value;
    setCanvasBackground(bgColor);
});

brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
});

toolTypeSelect.addEventListener('change', (e) => {
    toolType = e.target.value;
});

layerSelect.addEventListener('change', (e) => {
    currentLayer = parseInt(e.target.value);
    layerVisibility.checked = layers[currentLayer].visible;
});

layerVisibility.addEventListener('change', (e) => {
    layers[currentLayer].visible = e.target.checked;
    redrawCanvas();
});

resetBtn.addEventListener('click', () => {
    layers[currentLayer].context.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
});

saveBtn.addEventListener('click', () => {
    redrawCanvas(); // Ensure all visible layers are drawn
    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'drawing.png');

        fetch('/upload', {
            method: 'POST',
            body: formData,
        }).then(response => response.text())
            .then(text => alert(text))
            .catch(error => console.error('Error:', error));
    });
});

brushOpacityInput.addEventListener('input', (e) => {
    brushOpacity = e.target.value / 100;
    opacityValueSpan.textContent = `${e.target.value}%`;
});

// Initialize
initializeLayers();
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

