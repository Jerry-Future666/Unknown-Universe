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
// 5. 与星球形成自然空间关系
// 6. 与 Planet 使用完全相同的旋转角度
// 7. 星环整体刚性运动
// 8. 粒子保留轻微呼吸效果
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
        // 星环当前旋转角度
        //
        // 不再拥有独立 rotationSpeed。
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

        this.particles.length =
            0;


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
            // ------------------------------------------------

            const radius =
                randomRingRadius(
                    this.innerRadius,
                    this.outerRadius
                );


            // ------------------------------------------------
            // 基础环面坐标
            // ------------------------------------------------

            const x =
                Math.cos(angle) *
                radius;


            const z =
                Math.sin(angle) *
                radius;


            // ------------------------------------------------
            // 星环宽度
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
            // 保存星环原始坐标
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
        // 与 Planet 完全同步
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


        const sinInclination =
            Math.sin(
                this.inclination
            );


        const cosInclination =
            Math.cos(
                this.inclination
            );


        // ----------------------------------------------------
        // 更新粒子
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            // ------------------------------------------------
            // 原始星环坐标
            // ------------------------------------------------

            const x =
                particle.ringX;


            const y =
                particle.ringY;


            const z =
                particle.ringZ;


            // ------------------------------------------------
            // 与星球同步自转
            //
            // 使用和 Planet 完全相同的旋转公式。
            // ------------------------------------------------

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


            // ------------------------------------------------
            // 星环空间倾斜
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
            // 写入世界坐标
            // ------------------------------------------------

            particle.baseX =
                rotatedX;


            particle.baseY =
                tiltedY;


            particle.baseZ =
                tiltedZ;


            // ------------------------------------------------
            // 保留 Particle.update()
            //
            // 原因：
            // Particle.update() 负责 breath 呼吸动画。
            //
            // 但是它也会产生极轻微漂移，
            // 所以调用之后立即把位置锁回星环坐标。
            // ------------------------------------------------

            particle.update(
                time
            );


            // ------------------------------------------------
            // 锁定星环粒子位置
            //
            // 星环整体转，
            // 粒子之间不能自己散开。
            // ------------------------------------------------

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

        // ----------------------------------------------------
        // 星环内部深度排序
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
        (
            max -
            min
        )
    ) + min;

}



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
