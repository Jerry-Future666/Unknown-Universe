import { Particle } from "./particle.js";
import { CONFIG } from "./config.js";


// ============================================================
// Unknown Universe v0.5
// Planet System
//
// 未知天体本体。
// 不负责星环。
// 不负责剧情。
// 不负责摄像机移动。
//
// 这里只负责：
// 1. 生成粒子天体
// 2. 控制天体自转
// 3. 计算粒子光照
// 4. 将天体投影到 Engine
// ============================================================


export class Planet {

    constructor(engine) {

        this.engine = engine;

        this.particles = [];


        // ----------------------------------------------------
        // 天体空间参数
        // ----------------------------------------------------

        this.radius = 0;

        this.centerX = 0;
        this.centerY = 0;
        this.centerZ = 0;


        // ----------------------------------------------------
        // 自转
        // ----------------------------------------------------

        this.rotation = 0;

        this.rotationSpeed =
            CONFIG.planet.rotationSpeed;


        // ----------------------------------------------------
        // 光源方向
        //
        // 不使用彩色光。
        // 只有极弱的银白色空间光。
        // ----------------------------------------------------

        this.lightDirection = {

            x: -0.65,

            y: -0.35,

            z: 0.75

        };


        // ----------------------------------------------------
        // 初始化
        // ----------------------------------------------------

        this.resize();

        this.generate();

    }



    // ========================================================
    // 根据屏幕重新计算天体尺寸
    // ========================================================

    resize() {

        const shortSide =
            Math.min(
                this.engine.width,
                this.engine.height
            );


        // ----------------------------------------------------
        // 星球半径
        //
        // 这里使用屏幕短边，而不是高度。
        //
        // 这是为了避免 iPhone 竖屏下天体突然巨大。
        // ----------------------------------------------------

        this.radius =
            shortSide *
            CONFIG.planet.radius;


        // ----------------------------------------------------
        // 天体位置
        // ----------------------------------------------------

        this.centerX =
            this.engine.width *
            CONFIG.planet.offsetX;


        this.centerY =
            this.engine.height *
            CONFIG.planet.offsetY;


        this.centerZ = 0;

    }



    // ========================================================
    // 生成粒子天体
    // ========================================================

    generate() {

        this.particles.length = 0;


        // ----------------------------------------------------
        // 基础粒子数量
        // ----------------------------------------------------

        const count =
            Math.min(
                CONFIG.particleCount,
                4200
            );


        // ----------------------------------------------------
        // 三维球体采样
        //
        // 注意：
        // 不使用简单球面采样。
        //
        // 粒子分布在球体体积内部。
        // ----------------------------------------------------

        for (
            let i = 0;
            i < count;
            i++
        ) {

            // ------------------------------------------------
            // 球体均匀体积采样
            // ------------------------------------------------

            const theta =
                Math.random() *
                Math.PI *
                2;


            const phi =
                Math.acos(
                    randomRange(-1, 1)
                );


            // 三次方根保证体积内密度更加自然

            const radial =
                Math.cbrt(
                    Math.random()
                );


            const r =
                this.radius *
                radial;


            const sinPhi =
                Math.sin(phi);


            const x =
                r *
                sinPhi *
                Math.cos(theta);


            const y =
                r *
                Math.cos(phi);


            const z =
                r *
                sinPhi *
                Math.sin(theta);


            const particle =
                new Particle(
                    x,
                    y,
                    z
                );


            // ------------------------------------------------
            // 保存原始天体坐标
            // ------------------------------------------------

            particle.planetX = x;
            particle.planetY = y;
            particle.planetZ = z;


            // ------------------------------------------------
            // 计算距离球心的比例
            // ------------------------------------------------

            particle.radiusRatio =
                radial;


            // ------------------------------------------------
            // 表面粒子稍微明显
            //
            // 但不会做成发光边缘。
            // ------------------------------------------------

            const surfaceFactor =
                smoothstep(
                    0.45,
                    1.0,
                    radial
                );


            particle.brightness *=
                0.72 +
                surfaceFactor * 0.28;


            // ------------------------------------------------
            // 粒子大小
            //
            // 深层粒子小。
            // 表层粒子略大。
            // ------------------------------------------------

            particle.baseSize *=
                0.65 +
                surfaceFactor * 0.45;


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


        // ----------------------------------------------------
        // 更新所有粒子
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            // ----------------------------------------------
            // 天体自转
            //
            // Y轴旋转。
            // ----------------------------------------------

            const x =
                particle.planetX;


            const z =
                particle.planetZ;


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


            particle.baseX =
                rotatedX;


            particle.baseY =
                particle.planetY;


            particle.baseZ =
                rotatedZ;


            // ----------------------------------------------
            // 更新粒子本身
            // ----------------------------------------------

            particle.update(
                time
            );


            // ----------------------------------------------
            // 光照
            // ----------------------------------------------

            const light =
                this.calculateLight(
                    rotatedX,
                    particle.planetY,
                    rotatedZ
                );


            particle.planetLight =
                light;


            // ----------------------------------------------
            // 投影
            // ----------------------------------------------

            particle.project(
                this.engine.camera
            );

        }

    }



    // ========================================================
    // 光照计算
    // ========================================================

    calculateLight(
        x,
        y,
        z
    ) {

        const length =
            Math.sqrt(
                x * x +
                y * y +
                z * z
            );


        if (length === 0) {

            return 0.5;

        }


        // ----------------------------------------------------
        // 单位化法线
        // ----------------------------------------------------

        const nx =
            x / length;

        const ny =
            y / length;

        const nz =
            z / length;


        // ----------------------------------------------------
        // 光源单位向量
        // ----------------------------------------------------

        const lx =
            this.lightDirection.x;

        const ly =
            this.lightDirection.y;

        const lz =
            this.lightDirection.z;


        const lightLength =
            Math.sqrt(
                lx * lx +
                ly * ly +
                lz * lz
            );


        const normalizedLX =
            lx / lightLength;

        const normalizedLY =
            ly / lightLength;

        const normalizedLZ =
            lz / lightLength;


        // ----------------------------------------------------
        // Lambert 光照
        // ----------------------------------------------------

        const dot =
            nx * normalizedLX +
            ny * normalizedLY +
            nz * normalizedLZ;


        // ----------------------------------------------------
        // 保留最低环境光
        //
        // 背面不会完全消失。
        // ----------------------------------------------------

        return clamp(
            0.16 +
            Math.max(0, dot) *
            0.84,
            0.08,
            1
        );

    }



    // ========================================================
    // 绘制
    // ========================================================

    render(ctx) {

        // ----------------------------------------------------
        // 根据深度排序
        //
        // 后面的粒子先画。
        // 前面的粒子后画。
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


            const brightness =
                particle.getBrightness(
                    particle.planetLight || 1
                );


            if (
                brightness <= 0.01
            ) {

                continue;

            }


            const size =
                Math.max(
                    0.35,
                    particle.screenSize
                );


            ctx.beginPath();


            ctx.arc(
                particle.screenX +
                this.centerX,

                particle.screenY +
                this.centerY,

                size,

                0,

                Math.PI * 2
            );


            // ------------------------------------------------
            // 非常克制的银白色
            // ------------------------------------------------

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
    // 重新生成
    // ========================================================

    rebuild() {

        this.generate();

    }



    // ========================================================
    // 尺寸变化
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



function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}



function smoothstep(
    edge0,
    edge1,
    value
) {

    const t =
        clamp(
            (value - edge0) /
            (edge1 - edge0),
            0,
            1
        );


    return (
        t * t *
        (3 - 2 * t)
    );

}
