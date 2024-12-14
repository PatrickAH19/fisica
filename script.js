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
let trajectory = [];
let cannonTip = { x: 0, y: 0 };

// Parámetros de la simulación
const simulation = {
    initialVelocity: parseFloat(document.getElementById("initialVelocity").value),
    angle: parseFloat(document.getElementById("angle").value),
    mass: parseFloat(document.getElementById("mass").value),
    gravity: parseFloat(document.getElementById("gravity").value),
    height: parseFloat(document.getElementById("height").value),
    targetDistance: 15
};

// Actualiza los valores en tiempo real al mover los sliders
document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', updateSimulationParams);
});

function updateSimulationParams() {
    simulation.initialVelocity = parseFloat(document.getElementById("initialVelocity").value);
    simulation.angle = parseFloat(document.getElementById("angle").value);
    simulation.mass = parseFloat(document.getElementById("mass").value);
    simulation.gravity = parseFloat(document.getElementById("gravity").value);
    simulation.height = parseFloat(document.getElementById("height").value);

    // Actualiza los valores mostrados en la interfaz
    document.getElementById("angleLabelValue").textContent = simulation.angle;
    document.getElementById("initialSpeedValue").textContent = simulation.initialVelocity.toFixed(2);
    document.getElementById("heightControlValue").textContent = simulation.height.toFixed(2);
    document.getElementById("massValue").textContent = simulation.mass.toFixed(2);
    document.getElementById("gravityValue").textContent = simulation.gravity.toFixed(2);

    drawScene();
}

// Función para calcular la posición del proyectil
function calculateTrajectoryPoint(t, vx, vy) {
    const x = vx * t;
    const y = vy * t - 0.5 * simulation.gravity * t * t + simulation.height;
    return { x, y };
}

// Actualiza la posición de la punta del cañón
function updateCannonTip() {
    const cannonLength = 80;
    const baseX = 40;
    const baseY = canvas.height - 40;
    const angleRad = (simulation.angle * Math.PI) / 180;

    cannonTip.x = baseX + cannonLength * Math.cos(angleRad);
    cannonTip.y = baseY - cannonLength * Math.sin(angleRad);

    projectilePos.x = cannonTip.x;
    projectilePos.y = cannonTip.y;
}

// Dibuja la escena en el canvas
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    updateCannonTip();
    drawCannon();
    drawTarget();
    drawTrajectory();
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

// Animación
function animate() {
    if (!isPaused && isAnimating) {
        const dt = 0.02;
        time += dt;

        const angleRad = (simulation.angle * Math.PI) / 180;
        const vx = simulation.initialVelocity * Math.cos(angleRad);
        const vy = simulation.initialVelocity * Math.sin(angleRad);

        const pos = calculateTrajectoryPoint(time, vx, vy);
        const scaleX = canvas.width / 30;
        const scaleY = canvas.height / 20;

        projectilePos.x = cannonTip.x + pos.x * scaleX;
        projectilePos.y = canvas.height - pos.y * scaleY - 20;

        trajectory.push({ x: projectilePos.x, y: projectilePos.y });

        if (projectilePos.y >= canvas.height - 20) {
            isAnimating = false;
            landingPoint = { x: pos.x - 0.15, y: 0 };
            document.getElementById('distanceValue').textContent = landingPoint.x.toFixed(2);
        }

        drawScene();
        animationId = requestAnimationFrame(animate);
    }
}

// Botones de control
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
    trajectory = [];
    landingPoint = null;
    updateCannonTip();
    drawScene();
}

// Inicialización
updateSimulationParams();
drawScene();
