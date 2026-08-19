// ============================================================
// Unknown Universe v0.6
// Unified Renderer
//
// 所有天体进入同一个渲染队列。
//
// Planet
// Ring
// Future Objects
//      ↓
// Unified Particle Queue
//      ↓
// Camera Projection
//      ↓
// Z Depth Sort
//      ↓
// Canvas
//
// 这是解决“星环与星球没有真实遮挡”的核心。
// ============================================================


import { CONFIG } from "./config.js";



export class Renderer {

    constructor(
        ctx,
        camera
    ) {

        this.ctx =
            ctx;

        this.camera =
            camera;


        // ====================================================
        // 统一粒子队列
        // ====================================================

        this.particles = [];


        // ====================================================
        // 临时排序数组
        //
        // 避免每帧重新创建大量对象。
        // ====================================================

        this.sortedParticles = [];


        // ====================================================
        // 渲染统计
        //
        // 调试阶段使用。
        // ====================================================

        this.stats = {

            total: 0,

            visible: 0

        };

    }



    // ========================================================
    // 收集场景粒子
    // ========================================================

    collect(
        objects
    ) {

        this.particles.length = 0;


        for (
            let i = 0;
            i < objects.length;
            i++
        ) {

            const object =
                objects[i];


            if (
                !object ||
                !Array.isArray(
                    object.particles
                )
            ) {

                continue;

            }


            const particles =
                object.particles;


            for (
                let j = 0;
                j < particles.length;
                j++
            ) {

                const particle =
                    particles[j];


                if (!particle) {

                    continue;

                }


                this.particles.push(
                    particle
                );

            }

        }


        this.stats.total =
            this.particles.length;

    }



    // ========================================================
    // 投影
    // ========================================================

    project() {

        let visibleCount = 0;


        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            this.camera.project(
                particle
            );


            if (
                particle.visible
            ) {

                visibleCount++;

            }

        }


        this.stats.visible =
            visibleCount;

    }



    // ========================================================
    // 深度排序
    //
    // 当前 Camera 坐标约定：
    //
    // depth 越大 = 越远
    //
    // 因此：
    //
    // 远 → 近
    //
    // 使用：
    //
    // b.depth - a.depth
    //
    // ========================================================

    sortByDepth() {

        this.sortedParticles =
            this.particles.slice();


        this.sortedParticles.sort(
            (
                a,
                b
            ) => {

                return (
                    b.depth -
                    a.depth
                );

            }
        );

    }



    // ========================================================
    // 绘制
    // ========================================================

    render() {

        const ctx =
            this.ctx;


        const color =
            CONFIG.particleColor;


        for (
            let i = 0;
            i <
            this.sortedParticles.length;
            i++
        ) {

            const particle =
                this.sortedParticles[i];


            if (
                !particle.visible
            ) {

                continue;

            }


            // ------------------------------------------------
            // 基础尺寸
            // ------------------------------------------------

            const size =
                Math.max(
                    0.3,
                    particle.screenSize
                );


            if (
                size <= 0
            ) {

                continue;

            }


            // ------------------------------------------------
            // 最终亮度
            // ------------------------------------------------

            const brightness =
                clamp(
                    particle.getBrightness(
                        particle.lightFactor
                    ) *
                    particle.screenAlpha,
                    0,
                    0.85
                );


            if (
                brightness <= 0.01
            ) {

                continue;

            }


            // ------------------------------------------------
            // 绘制粒子
            //
            // 使用普通 source-over。
            //
            // 不使用强光叠加。
            // ------------------------------------------------

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
                    ${brightness}
                )`;


            ctx.fill();

        }

    }



    // ========================================================
    // 完整渲染流程
    // ========================================================

    renderScene(
        objects
    ) {

        // ----------------------------------------------------
        // 1. 收集
        // ----------------------------------------------------

        this.collect(
            objects
        );


        // ----------------------------------------------------
        // 2. 投影
        // ----------------------------------------------------

        this.project();


        // ----------------------------------------------------
        // 3. 深度排序
        // ----------------------------------------------------

        this.sortByDepth();


        // ----------------------------------------------------
        // 4. 绘制
        // ----------------------------------------------------

        this.render();

    }

}
