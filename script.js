// Obtén el elemento canvas y su contexto de dibujo 2D
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 400;

// Variables de animación y estado
let animationId = null;
let projectilePos = { x: 0, y: 0 };
let time = 0;
let isAnimating = false;
let isPaused = false;
let landingPoint = null;
let maxHeight = 0;
let trajectory = [];
let cannonTip = { x: 0, y: 0 };

// Parámetros de la simulación
const simulation = {
    initialVelocity: 18,
    angle: 20,
    mass: 24.35,
    gravity: 9.81,
    height: 1.75, 
    targetDistance: 15,
    airDensity: 1.225,
    dragCoefficient: 0.47
};

// Función para calcular la posición del proyectil
function calculateTrajectoryPoint(t, vx, vy) {
    const x = vx * t;
    const y = vy * t - 0.5 * simulation.gravity * t * t + simulation.height;
    return { x, y };
}

// Actualiza la posición de la punta del cañón
function updateCannonTip() {
    const cannonLength = 80;
    const cannonX = 40;
    const cannonY = canvas.height - 40;
    const angleRad = (simulation.angle * Math.PI) / 180;

    cannonTip.x = cannonX + cannonLength * Math.cos(angleRad);
    cannonTip.y = cannonY - cannonLength * Math.sin(angleRad);

    // Verifica si la punta del cañón se está moviendo
    console.log(Cannon tip position: x = ${cannonTip.x}, y = ${cannonTip.y});
}

// Dibuja la escena en el canvas
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo (cielo y suelo)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Cañón
    updateCannonTip();
    drawCannon();

    // Objetivo
    drawTarget();

    // Trayectoria
    drawTrajectory();

    // Proyectil
    if (isAnimating || landingPoint) drawProjectile();
}

function drawCannon() {
    const cannonLength = 80;
    const cannonWidth = 20;
    const cannonX = 40;
    const cannonY = canvas.height - 40;

    ctx.save();
    ctx.translate(cannonX, cannonY);
    ctx.rotate(-simulation.angle * Math.PI / 180);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(0, 0, cannonWidth, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawTarget() {
    const targetX = simulation.targetDistance * (canvas.width / 20);
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(targetX, canvas.height - 20, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawTrajectory() {
    if (trajectory.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#0000FF';
        ctx.lineWidth = 2;
        ctx.moveTo(cannonTip.x, cannonTip.y);
        trajectory.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
    }
}

function drawProjectile() {
    ctx.beginPath();
    ctx.arc(projectilePos.x, projectilePos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
}

// Función de animación para actualizar la posición del proyectil
function animate() {
    if (!isPaused && isAnimating) {
        const dt = 0.01; // Reducir el intervalo de tiempo para mayor precisión
        time += dt;

        // Componentes de la velocidad inicial
        const angleRad = (simulation.angle * Math.PI) / 180;
        const vx = simulation.initialVelocity * Math.cos(angleRad); // Velocidad horizontal
        const vy = simulation.initialVelocity * Math.sin(angleRad); // Velocidad vertical

        const pos = calculateTrajectoryPoint(time, vx, vy);

        // Escalar la distancia X correctamente basada en la distancia real (en metros) y el tamaño del canvas
        const scaleX = canvas.width / 30; // Ajuste de la escala basado en la distancia real del canvas
        projectilePos.x = cannonTip.x + pos.x * scaleX;

        // Corregir la escala Y y ajustar para la altura de la escena
        projectilePos.y = canvas.height - pos.y * (canvas.height / 10) - 20;

        trajectory.push({ x: projectilePos.x, y: projectilePos.y });

        // Comprobar si el proyectil toca el suelo (altura Y llega a 0)
        if (projectilePos.y >= canvas.height - 20) {
            isAnimating = false;
            landingPoint = {
                x: pos.x - 0.15, // Ajuste de la distancia restando 0.15
                y: 0
            };
            document.getElementById('distanceValue').textContent = landingPoint.x.toFixed(2); // Mostrar distancia
        }

        drawScene();
        animationId = requestAnimationFrame(animate);
    }
}

// Manejadores de eventos para los botones de control
document.getElementById('fireButton').addEventListener('click', () => {
    if (!isAnimating) {
        resetSimulation();
        isAnimating = true;
        animate();
    }
});

document.getElementById('pauseButton').addEventListener('click', () => isPaused = true);
document.getElementById('playButton').addEventListener('click', () => {
    isPaused = false;
    animate();
});
document.getElementById('resetButton').addEventListener('click', resetSimulation);

function resetSimulation() {
    isAnimating = false;
    isPaused = false;
    time = 0;
    landingPoint = null;
    trajectory = [];
    updateCannonTip();
    projectilePos = { ...cannonTip };
    drawScene();
}

// Función para actualizar los valores de los sliders y etiquetas
function updateSliderValue(sliderId, valueId, value) {
    document.getElementById(sliderId).value = value;
    document.getElementById(valueId).textContent = value;
}

document.getElementById('initialSpeed').addEventListener('input', function () {
    simulation.initialVelocity = parseFloat(this.value);
    updateSliderValue('initialSpeed', 'initialSpeedValue', simulation.initialVelocity);
    document.getElementById('speedValue').textContent = simulation.initialVelocity;
    drawScene();
});

document.getElementById('angle').addEventListener('input', function () {
    simulation.angle = parseFloat(this.value);
    updateSliderValue('angle', 'angleLabelValue', simulation.angle);
    document.getElementById('angleValue').textContent = simulation.angle;
    updateCannonTip(); // Actualizar la posición del cañón cuando cambie el ángulo
    drawScene();
});

document.getElementById('mass').addEventListener('input', function () {
    simulation.mass = parseFloat(this.value);
    updateSliderValue('mass', 'massValue', simulation.mass.toFixed(2));
});

document.getElementById('gravity').addEventListener('input', function () {
    simulation.gravity = parseFloat(this.value);
    updateSliderValue('gravity', 'gravityValue', simulation.gravity.toFixed(2));
});

document.getElementById('heightControl').addEventListener('input', function () {
    simulation.height = parseFloat(this.value);
    updateSliderValue('heightControl', 'heightControlValue', simulation.height.toFixed(2));
});

// Función para crear manejadores de botones de flecha para los sliders
function createArrowButtonListeners(sliderId, valueId, step, min, max) {
    document.getElementById(sliderId + 'DecreaseBtn').addEventListener('click', () => {
        const slider = document.getElementById(sliderId);
        slider.value = Math.max(parseFloat(slider.value) - step, min);
        slider.dispatchEvent(new Event('input'));
    });

    document.getElementById(sliderId + 'IncreaseBtn').addEventListener('click', () => {
        const slider = document.getElementById(sliderId);
        slider.value = Math.min(parseFloat(slider.value) + step, max);
        slider.dispatchEvent(new Event('input'));
    });
}


// Crear manejadores para los sliders de masa, gravedad, altura, ángulo y velocidad inicial
createArrowButtonListeners('mass', 'massValue', 0.01, 1, 31);
createArrowButtonListeners('gravity', 'gravityValue', 0.01, 0, 20);
createArrowButtonListeners('heightControl', 'heightControlValue', 0.01, 0, 5);
createArrowButtonListeners('angle', 'angleLabelValue', 1, 0, 90);
createArrowButtonListeners('initialSpeed', 'initialSpeedValue', 0.1, 0, 30);

// Configuración inicial
updateCannonTip();
projectilePos.x = cannonTip.x;
projectilePos.y = cannonTip.y;
drawScene();