// ============================================================
// Unknown Universe v0.5
// Planet Ring
//
// 粒子星环系统
//
// 设计目标：
// 1. 环绕天体中部
// 2. 三维倾斜
// 3. 宽粒子带
// 4. 不使用强光晕
// 5. 与星球形成自然遮挡
// ============================================================


import { Particle } from "./particle.js";
import { CONFIG } from "./config.js";



export class PlanetRing {

    constructor(
        engine,
        planet
    ) {

        this.engine =
            engine;

        this.planet =
            planet;


        // ----------------------------------------------------
        // 粒子
        // ----------------------------------------------------

        this.particles = [];


        // ----------------------------------------------------
        // 星环尺寸
        // ----------------------------------------------------

        this.innerRadius = 0;

        this.outerRadius = 0;


        // ----------------------------------------------------
        // 星环倾角
        //
        // 不是完全水平。
        // 有轻微空间倾斜。
        // ----------------------------------------------------

        this.inclination =
            -0.28;


        // ----------------------------------------------------
        // 星环旋转
        // ----------------------------------------------------

        this.rotation =
            0;


        this.rotationSpeed =
            0.00035;


        // ----------------------------------------------------
        // 深度
        // ----------------------------------------------------

        this.depth =
            0;


        // ----------------------------------------------------
        // 初始化
        // ----------------------------------------------------

        this.resize();

        this.generate();

    }



    // ========================================================
    // 尺寸
    // ========================================================

    resize() {

        const planetRadius =
            this.planet.radius;


        // ----------------------------------------------------
        // 星环内圈
        //
        // 必须明显大于星球半径。
        // ----------------------------------------------------

        this.innerRadius =
            planetRadius *
            1.12;


        // ----------------------------------------------------
        // 星环外圈
        // ----------------------------------------------------

        this.outerRadius =
            planetRadius *
            1.78;

    }



    // ========================================================
    // 生成星环
    // ========================================================

    generate() {

        this.particles.length = 0;


        // ----------------------------------------------------
        // 粒子数量
        //
        // 控制在合理范围。
        // ----------------------------------------------------

        const count =
            1800;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            // ------------------------------------------------
            // 环绕角度
            // ------------------------------------------------

            const angle =
                Math.random() *
                Math.PI *
                2;


            // ------------------------------------------------
            // 半径
            //
            // 不完全均匀。
            // 让星环产生自然密度。
            // ------------------------------------------------

            const radius =
                randomRingRadius(
                    this.innerRadius,
                    this.outerRadius
                );


            // ------------------------------------------------
            // 基础平面
            // ------------------------------------------------

            const x =
                Math.cos(angle) *
                radius;


            const z =
                Math.sin(angle) *
                radius;


            // ------------------------------------------------
            // 星环宽度
            //
            // 中间更密。
            // 两边自然变薄。
            // ------------------------------------------------

            const normalized =
                (
                    radius -
                    this.innerRadius
                ) /
                (
                    this.outerRadius -
                    this.innerRadius
                );


            const bandWidth =
                Math.sin(
                    normalized *
                    Math.PI
                );


            const y =
                randomRange(
                    -22,
                    22
                ) *
                bandWidth;


            // ------------------------------------------------
            // 创建粒子
            // ------------------------------------------------

            const particle =
                new Particle(
                    x,
                    y,
                    z
                );


            particle.ringX =
                x;

            particle.ringY =
                y;

            particle.ringZ =
                z;


            particle.ringRadius =
                radius;


            particle.ringAngle =
                angle;


            // ------------------------------------------------
            // 星环粒子尺寸
            // ------------------------------------------------

            particle.baseSize *=
                randomRange(
                    0.35,
                    0.75
                );


            // ------------------------------------------------
            // 星环粒子亮度
            //
            // 明显比星球克制。
            // ------------------------------------------------

            particle.brightness *=
                randomRange(
                    0.35,
                    0.75
                );


            this.particles.push(
                particle
            );

        }

    }



    // ========================================================
    // 更新
    // ========================================================

    update(time) {

        this.rotation +=
            this.rotationSpeed *
            16;


        const sinRotation =
            Math.sin(
                this.rotation
            );


        const cosRotation =
            Math.cos(
                this.rotation
            );


        const sinInclination =
            Math.sin(
                this.inclination
            );


        const cosInclination =
            Math.cos(
                this.inclination
            );


        // ----------------------------------------------------
        // 更新所有星环粒子
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            // ------------------------------------------------
            // 原始坐标
            // ------------------------------------------------

            const x =
                particle.ringX;

            const y =
                particle.ringY;

            const z =
                particle.ringZ;


            // ------------------------------------------------
            // 星环自转
            // ------------------------------------------------

            const rotatedX =
                x *
                cosRotation -
                z *
                sinRotation;


            const rotatedZ =
                x *
                sinRotation +
                z *
                cosRotation;


            // ------------------------------------------------
            // 倾斜星环
            //
            // 绕 X 轴旋转。
            // ------------------------------------------------

            const tiltedY =
                y *
                cosInclination -
                rotatedZ *
                sinInclination;


            const tiltedZ =
                y *
                sinInclination +
                rotatedZ *
                cosInclination;


            // ------------------------------------------------
            // 写入粒子
            // ------------------------------------------------

            particle.baseX =
                rotatedX;

            particle.baseY =
                tiltedY;

            particle.baseZ =
                tiltedZ;


            // ------------------------------------------------
            // 粒子本身运动
            // ------------------------------------------------

            particle.update(
                time
            );


            // ------------------------------------------------
            // 投影
            // ------------------------------------------------

            particle.project(
                this.engine.camera
            );

        }

    }



    // ========================================================
    // 绘制
    // ========================================================

    render(ctx) {

        // ----------------------------------------------------
        // 根据深度排序
        // ----------------------------------------------------

        const sorted =
            [...this.particles].sort(
                (a, b) =>
                    b.screenSize -
                    a.screenSize
            );


        const color =
            CONFIG.particleColor;


        // ----------------------------------------------------
        // 绘制
        // ----------------------------------------------------

        for (
            let i = 0;
            i < sorted.length;
            i++
        ) {

            const particle =
                sorted[i];


            const size =
                Math.max(
                    0.3,
                    particle.screenSize
                );


            const alpha =
                Math.max(
                    0.08,
                    Math.min(
                        particle.screenAlpha *
                        particle.brightness,
                        0.75
                    )
                );


            ctx.beginPath();


            ctx.arc(
                particle.screenX +
                this.planet.centerX,

                particle.screenY +
                this.planet.centerY,

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
    // Resize
    // ========================================================

    onResize() {

        this.resize();

        this.generate();

    }

}



// ============================================================
// 工具函数
// ============================================================


function randomRange(
    min,
    max
) {

    return (
        Math.random() *
        (max - min)
    ) + min;

}



function randomRingRadius(
    inner,
    outer
) {

    // --------------------------------------------------------
    // 偏向中间区域
    //
    // 避免外圈粒子过度集中。
    // --------------------------------------------------------

    const value =
        Math.random();


    const curved =
        Math.pow(
            value,
            0.75
        );


    return (
        inner +
        (
            outer -
            inner
        ) *
        curved
    );

}
