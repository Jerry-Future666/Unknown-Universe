// ============================================================
// Unknown Universe v0.5
// Planet Ring
//
// 粒子星环系统
//
// 核心原则：
// 1. 星环属于 Planet
// 2. 星环与 Planet 使用完全相同的旋转角度
// 3. 星环粒子不能独立漂移
// 4. Particle.update() 只用于维持呼吸状态
// 5. X / Y / Z 三轴必须同步锁定
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
        // ----------------------------------------------------

        this.inclination =
            -0.28;


        // ----------------------------------------------------
        // 当前旋转角
        //
        // 不独立计时。
        // 每一帧从 Planet 读取。
        // ----------------------------------------------------

        this.rotation =
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


        this.innerRadius =
            planetRadius *
            1.12;


        this.outerRadius =
            planetRadius *
            1.78;

    }



    // ========================================================
    // 生成星环
    // ========================================================

    generate() {

        this.particles.length = 0;


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
            // 星环半径
            // ------------------------------------------------

            const radius =
                randomRingRadius(
                    this.innerRadius,
                    this.outerRadius
                );


            // ------------------------------------------------
            // 环面基础坐标
            // ------------------------------------------------

            const x =
                Math.cos(angle) *
                radius;


            const z =
                Math.sin(angle) *
                radius;


            // ------------------------------------------------
            // 星环横向厚度
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


            // ------------------------------------------------
            // 保存星环的永久基础坐标
            //
            // 所有旋转都从这里重新计算。
            // ------------------------------------------------

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
            // 粒子尺寸
            // ------------------------------------------------

            particle.baseSize *=
                randomRange(
                    0.35,
                    0.75
                );


            // ------------------------------------------------
            // 粒子亮度
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

        // ----------------------------------------------------
        // 读取 Planet 当前旋转
        //
        // Planet 是唯一的旋转源。
        // ----------------------------------------------------

        this.rotation =
            this.planet.getRotation();


        const sinRotation =
            Math.sin(
                this.rotation
            );


        const cosRotation =
            Math.cos(
                this.rotation
            );


        // ----------------------------------------------------
        // 星环倾角
        // ----------------------------------------------------

        const sinInclination =
            Math.sin(
                this.inclination
            );


        const cosInclination =
            Math.cos(
                this.inclination
            );


        // ----------------------------------------------------
        // 更新全部粒子
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            // ------------------------------------------------
            // 永久基础坐标
            // ------------------------------------------------

            const x =
                particle.ringX;

            const y =
                particle.ringY;

            const z =
                particle.ringZ;



            // =================================================
            // 第一层：与 Planet 完全同步自转
            // =================================================

            const rotatedX =
                x *
                cosRotation +
                z *
                sinRotation;


            const rotatedZ =
                -x *
                sinRotation +
                z *
                cosRotation;



            // =================================================
            // 第二层：星环自身空间倾角
            // =================================================

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



            // =================================================
            // 写入 Particle 世界坐标
            // =================================================

            particle.baseX =
                rotatedX;

            particle.baseY =
                tiltedY;

            particle.baseZ =
                tiltedZ;



            // ------------------------------------------------
            // Particle.update()
            //
            // 这里只借用：
            // - breath
            //
            // 它原本还会产生轻微漂移，
            // 所以下面马上锁回刚性坐标。
            // ------------------------------------------------

            particle.update(
                time
            );



            // =================================================
            // 重新锁定三维坐标
            //
            // 这一点非常重要：
            //
            // X
            // Y
            // Z
            //
            // 三个轴必须全部来自星环变换结果。
            // =================================================

            particle.x =
                particle.baseX;

            particle.y =
                particle.baseY;

            particle.z =
                particle.baseZ;



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

        const sorted =
            [...this.particles].sort(
                (a, b) =>
                    b.screenSize -
                    a.screenSize
            );


        const color =
            CONFIG.particleColor;


        // ----------------------------------------------------
        // 绘制星环粒子
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


            // ------------------------------------------------
            // 极端异常保护
            // ------------------------------------------------

            if (
                !Number.isFinite(
                    particle.screenX
                ) ||
                !Number.isFinite(
                    particle.screenY
                ) ||
                !Number.isFinite(
                    size
                )
            ) {

                continue;

            }


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
        (
            max -
            min
        )
    ) + min;

}



// ============================================================
// 星环半径随机
// ============================================================

function randomRingRadius(
    inner,
    outer
) {

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
