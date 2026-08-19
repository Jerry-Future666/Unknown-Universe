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


        const count =
            Math.min(
                CONFIG.particleCount,
                4200
            );


        // ----------------------------------------------------
        // 三维球体采样
        // ----------------------------------------------------

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const theta =
                Math.random() *
                Math.PI *
                2;


            const phi =
                Math.acos(
                    randomRange(-1, 1)
                );


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


            particle.radiusRatio =
                radial;


            // ------------------------------------------------
            // 表面粒子
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


            // ------------------------------------------------
            // 天体自转
            //
            // 当前方向：
            // 北半球从屏幕观察为逆时针。
            // ------------------------------------------------

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


            // ------------------------------------------------
            // 更新粒子本身
            // ------------------------------------------------

            particle.update(
                time
            );


            // ------------------------------------------------
            // 光照
            // ------------------------------------------------

            const light =
                this.calculateLight(
                    rotatedX,
                    particle.planetY,
                    rotatedZ
                );


            particle.planetLight =
                light;


            // ------------------------------------------------
            // 投影
            // ------------------------------------------------

            particle.project(
                this.engine.camera
            );

        }

    }



    // ========================================================
    // 获取当前天体旋转角度
    //
    // 星环必须读取这个值。
    //
    // Planet 和 Ring 不允许各自拥有独立时间轴，
    // 否则运行一段时间后会产生空间漂移。
    // ========================================================

    getRotation() {

        return this.rotation;

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
        // 环境光
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

        const sorted =
            [...this.particles].sort(
                (a, b) =>
                    b.screenSize -
                    a.screenSize
            );


        const color =
            CONFIG.particleColor;


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
