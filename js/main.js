import { ParticleEngine } from "./engine.js";
import { Particle } from "./particle.js";

const canvas = document.getElementById("universe");

if (!canvas) {
    throw new Error("Canvas #universe not found.");
}

const engine = new ParticleEngine(canvas);

// 创建测试粒子
for (let i = 0; i < 300; i++) {

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    const particle = new Particle(
        x - window.innerWidth / 2,
        y - window.innerHeight / 2,
        Math.random() * 600 - 300
    );

    engine.addParticle(particle);
}

engine.start();

window.UnknownUniverse = engine;
