import { CONFIG } from "./config.js";


// ============================================================
// Unknown Universe v0.5
// Particle / Scene Engine
//
// 当前负责：
// Canvas
// 时间循环
// 摄像机基础状态
// 场景对象更新与渲染
//
// 具体天体由 planet.js 自己负责。
// ============================================================


export class ParticleEngine {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d", {
                alpha: false
            });


        if (!this.ctx) {
            throw new Error(
                "Canvas 2D context unavailable."
            );
        }


        // ----------------------------------------------------
        // Canvas
        // ----------------------------------------------------

        this.width = 0;
        this.height = 0;


        // ----------------------------------------------------
        // 场景对象
        // ----------------------------------------------------

        this.objects = [];


        // ----------------------------------------------------
        // 兼容旧粒子系统
        //
        // 后面会逐渐移除。
        // ----------------------------------------------------

        this.particles = [];


        // ----------------------------------------------------
        // 摄像机基础状态
        // ----------------------------------------------------

        this.camera = {

            x: 0,

            y: 0,

            z: 0,

            centerX: 0,

            centerY: 0,

            focalLength: 700

        };


        // ----------------------------------------------------
        // 时间
        // ----------------------------------------------------

        this.time = 0;


        this.running = false;


        // ----------------------------------------------------
        // 初始化
        // ----------------------------------------------------

        this.resize();


        window.addEventListener(
            "resize",
            () => this.resize()
        );

    }



    // ========================================================
    // Canvas 尺寸
    // ========================================================

    resize() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        this.width =
            window.innerWidth;


        this.height =
            window.innerHeight;


        this.canvas.width =
            Math.floor(
                this.width * dpr
            );


        this.canvas.height =
            Math.floor(
                this.height * dpr
            );


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


        // ----------------------------------------------------
        // 通知场景对象
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.objects.length;
            i++
        ) {

            const object =
                this.objects[i];


            if (
                object &&
                typeof object.onResize ===
                "function"
            ) {

                object.onResize();

            }

        }

    }



    // ========================================================
    // 添加场景对象
    // ========================================================

    addObject(object) {

        if (!object) {
            return;
        }


        this.objects.push(
            object
        );

    }



    // ========================================================
    // 删除场景对象
    // ========================================================

    removeObject(object) {

        const index =
            this.objects.indexOf(
                object
            );


        if (index !== -1) {

            this.objects.splice(
                index,
                1
            );

        }

    }



    // ========================================================
    // 清除场景对象
    // ========================================================

    clearObjects() {

        this.objects.length = 0;

    }



    // ========================================================
    // 兼容旧粒子接口
    // ========================================================

    addParticle(particle) {

        this.particles.push(
            particle
        );

    }



    // ========================================================
    // 清除旧粒子
    // ========================================================

    clearParticles() {

        this.particles.length = 0;

    }



    // ========================================================
    // 更新
    // ========================================================

    update(time) {

        for (
            let i = 0;
            i < this.objects.length;
            i++
        ) {

            const object =
                this.objects[i];


            if (
                object &&
                typeof object.update ===
                "function"
            ) {

                object.update(
                    time
                );

            }

        }

    }



    // ========================================================
    // 清空画布
    // ========================================================

    clear() {

        this.ctx.fillStyle =
            CONFIG.background;


        this.ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

    }



    // ========================================================
    // 渲染场景
    // ========================================================

    render() {

        const ctx =
            this.ctx;


        ctx.save();


        // ----------------------------------------------------
        // 先渲染场景对象
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.objects.length;
            i++
        ) {

            const object =
                this.objects[i];


            if (
                object &&
                typeof object.render ===
                "function"
            ) {

                object.render(
                    ctx
                );

            }

        }


        // ----------------------------------------------------
        // 暂时保留旧粒子渲染接口
        //
        // 正式系统以后会移除。
        // ----------------------------------------------------

        if (
            this.particles.length > 0
        ) {

            this.renderLegacyParticles();

        }


        ctx.restore();

    }



    // ========================================================
    // 旧测试粒子渲染
    // ========================================================

    renderLegacyParticles() {

        const ctx =
            this.ctx;


        const color =
            CONFIG.particleColor;


        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            if (
                particle.screenSize <= 0
            ) {

                continue;

            }


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
                `rgba(
                    ${color.r},
                    ${color.g},
                    ${color.b},
                    ${alpha}
                )`;


            ctx.fill();

        }

    }



    // ========================================================
    // 单帧
    // ========================================================

    frame(time) {

        this.time =
            time;


        this.clear();


        this.update(
            time
        );


        this.render();

    }



    // ========================================================
    // 启动
    // ========================================================

    start() {

        if (this.running) {
            return;
        }


        this.running = true;


        const loop =
            (time) => {

                if (!this.running) {
                    return;
                }


                this.frame(
                    time
                );


                requestAnimationFrame(
                    loop
                );

            };


        requestAnimationFrame(
            loop
        );

    }



    // ========================================================
    // 停止
    // ========================================================

    stop() {

        this.running =
            false;

    }

}
