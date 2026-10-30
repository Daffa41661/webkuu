const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const healthText = document.getElementById("healthText");
const restartBtn = document.getElementById("restartBtn");

// Status Game
let score = 0;
let baseHealth = 100;
let isGameOver = false;

// Posisi Turret / Meriam
const turret = {
    x: 50,
    y: canvas.height / 2,
    angle: 0
};

// Array Objek Game
let bullets = [];
let enemies = [];
let particles = [];
let enemySpawnTimer = 0;

// Mouse Position Tracking
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Menembak Peluru saat Klik Mouse
canvas.addEventListener("click", () => {
    if (isGameOver) return;

    const angle = Math.atan2(mouse.y - turret.y, mouse.x - turret.x);
    bullets.push({
        x: turret.x,
        y: turret.y,
        dx: Math.cos(angle) * 8,
        dy: Math.sin(angle) * 8
    });
});

// Membuat Musuh (Tank)
function spawnEnemy() {
    const size = 30;
    const y = Math.random() * (canvas.height - size * 2) + size;
    enemies.push({
        x: canvas.width,
        y: y,
        size: size,
        speed: Math.random() * 1.5 + 1
    });
}

// Efek Ledakan
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 1,
            life: 20
        });
    }
}

// Update Logika Game
function update() {
    if (isGameOver) return;

    // Hitung sudut turrett mengarah ke mouse
    turret.angle = Math.atan2(mouse.y - turret.y, mouse.x - turret.x);

    // Update Peluru
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Hapus peluru luar layar
        if (bullet.x > canvas.width || bullet.x < 0 || bullet.y > canvas.height || bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Spawn Musuh Periodik
    enemySpawnTimer++;
    if (enemySpawnTimer % 60 === 0) {
        spawnEnemy();
    }

    // Update Musuh
    enemies.forEach((enemy, eIndex) => {
        enemy.x -= enemy.speed;

        // Deteksi tabrakan dengan benteng
        if (enemy.x <= turret.x + 20) {
            baseHealth -= 10;
            healthText.textContent = baseHealth;
            createExplosion(enemy.x, enemy.y);
            enemies.splice(eIndex, 1);

            if (baseHealth <= 0) {
                isGameOver = true;
                restartBtn.classList.remove("hidden");
            }
        }

        // Deteksi kena peluru
        bullets.forEach((bullet, bIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (dist < enemy.size / 2) {
                createExplosion(enemy.x, enemy.y);
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                scoreText.textContent = score;
            }
        });
    });

    // Update Partikel Ledakan
    particles.forEach((p, pIndex) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(pIndex, 1);
    });
}

// Render Gambar di Canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Garis Batas Benteng (Garis Merah)
    ctx.fillStyle = "#e53e3e";
    ctx.fillRect(0, 0, 20, canvas.height);

    // Gambar Turret
    ctx.save();
    ctx.translate(turret.x, turret.y);
    ctx.rotate(turret.angle);
    ctx.fillStyle = "#a0aec0";
    ctx.fillRect(0, -6, 30, 12); // Laras Meriam
    ctx.fillStyle = "#4a5568";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2); // Badan Meriam
    ctx.fill();
    ctx.restore();

    // Gambar Peluru
    ctx.fillStyle = "#f6e05e";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Gambar Musuh (Tank Merah)
    ctx.fillStyle = "#fc8181";
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2, enemy.size, enemy.size);
    });

    // Gambar Partikel Ledakan
    ctx.fillStyle = "#ed8936";
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Tampilan Game Over
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("BENTENG HANCUR! GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "20px Arial";
        ctx.fillText(`Skor Akhir: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
}

// Loop Utama Game
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Reset Game
restartBtn.addEventListener("click", () => {
    score = 0;
    baseHealth = 100;
    isGameOver = false;
    bullets = [];
    enemies = [];
    particles = [];
    scoreText.textContent = score;
    healthText.textContent = baseHealth;
    restartBtn.classList.add("hidden");
});

// Jalankan Loop Game
gameLoop();