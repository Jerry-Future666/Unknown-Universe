import { CONFIG } from "./config.js";

export class ParticleEngine {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx = canvas.getContext("2d");

        if (!this.ctx) {
            throw new Error("Canvas 2D context unavailable.");
        }

        this.width = 0;
        this.height = 0;

        this.particles = [];

        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            centerX: 0,
            centerY: 0,
            focalLength: 700
        };

        this.running = false;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }


    resize() {

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width =
            Math.floor(this.width * dpr);

        this.canvas.height =
            Math.floor(this.height * dpr);

        this.canvas.style.width =
            this.width + "px";

        this.canvas.style.height =
            this.height + "px";

        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        this.camera.centerX =
            this.width / 2;

        this.camera.centerY =
            this.height / 2;
    }


    addParticle(particle) {

        this.particles.push(particle);

    }


    update(time) {

        for (const particle of this.particles) {
            particle.update(time);
            particle.project(this.camera);
        }

    }


    clear() {

        this.ctx.fillStyle = "#000000";

        this.ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

    }


    render() {

        const ctx = this.ctx;

        ctx.save();

        for (const particle of this.particles) {

            const size =
                Math.max(
                    0.8,
                    particle.screenSize
                );

            const alpha =
                Math.max(
                    0.15,
                    Math.min(
                        particle.screenAlpha,
                        1
                    )
                );

            ctx.beginPath();

            ctx.arc(
                particle.screenX,
                particle.screenY,
                size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(235,238,240,${alpha})`;

            ctx.fill();
        }

        ctx.restore();

    }


    frame(time) {

        this.clear();

        this.update(time);

        this.render();

    }


    start() {

        if (this.running) {
            return;
        }

        this.running = true;

        const loop = (time) => {

            if (!this.running) {
                return;
            }

            this.frame(time);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);

    }


    stop() {

        this.running = false;

    }

}
