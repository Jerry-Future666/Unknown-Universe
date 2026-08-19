import { CONFIG } from "./config.js";


// ============================================================
// Particle
// Unknown Universe v0.5
//
// 单个宇宙粒子。
// 这里只定义粒子本身，不负责整个星球。
// ============================================================

export class Particle {

    constructor(x = 0, y = 0, z = 0) {

        // ----------------------------------------------------
        // 三维空间坐标
        // ----------------------------------------------------

        this.x = x;
        this.y = y;
        this.z = z;


        // ----------------------------------------------------
        // 原始位置
        //
        // 后面的星球自转、摄像机运动都会基于这个位置计算。
        // ----------------------------------------------------

        this.baseX = x;
        this.baseY = y;
        this.baseZ = z;


        // ----------------------------------------------------
        // 粒子视觉属性
        // ----------------------------------------------------

        this.size =
            randomRange(0.45, 1.65);

        this.baseSize =
            this.size;


        this.brightness =
            randomRange(0.22, 0.78);


        // ----------------------------------------------------
        // 深度变化
        //
        // 每个粒子拥有不同的深度感。
        // ----------------------------------------------------

        this.depth =
            normalizeDepth(z);


        // ----------------------------------------------------
        // 极其轻微的漂移
        //
        // 不是“雪花式”乱飘。
        // 只是让整个宇宙拥有生命感。
        // ----------------------------------------------------

        this.driftX =
            randomRange(-1, 1);

        this.driftY =
            randomRange(-1, 1);

        this.driftStrength =
            randomRange(
                0.00008,
                0.00035
            );


        // ----------------------------------------------------
        // 呼吸相位
        //
        // 不同粒子不同步。
        // 避免整个星球同时闪烁。
        // ----------------------------------------------------

        this.phase =
            Math.random() *
            Math.PI *
            2;


        this.phaseSpeed =
            randomRange(
                0.0003,
                0.001
            );


        // ----------------------------------------------------
        // 随机种子
        //
        // 后续需要复杂地貌、密度变化时可以继续使用。
        // ----------------------------------------------------

        this.seed =
            Math.random();


        // ----------------------------------------------------
        // 当前屏幕投影位置
        //
        // 不是粒子的真实空间坐标。
        // ----------------------------------------------------

        this.screenX = 0;
        this.screenY = 0;

        this.screenSize = this.size;
        this.screenAlpha = 0;

    }



    // ========================================================
    // 更新粒子
    // ========================================================

    update(time) {

        // ----------------------------------------------------
        // 极轻微的宇宙漂移
        // ----------------------------------------------------

        const drift =
            Math.sin(
                time * this.driftStrength +
                this.phase
            );


        const drift2 =
            Math.cos(
                time * this.driftStrength * 0.83 +
                this.phase
            );


        this.x =
            this.baseX +
            drift * 0.35;


        this.y =
            this.baseY +
            drift2 * 0.35;



        // ----------------------------------------------------
        // 极轻微呼吸
        //
        // 范围非常小。
        // 高级感来自克制，而不是闪烁。
        // ----------------------------------------------------

        const breathing =
            Math.sin(
                time * this.phaseSpeed +
                this.phase
            );


        this.breath =
            1 +
            breathing * 0.045;

    }



    // ========================================================
    // 根据深度计算视觉属性
    // ========================================================

    project(camera) {

        // ----------------------------------------------------
        // 基础透视
        //
        // 当前只是二维 Canvas 上的轻量级三维投影。
        // 后续 camera.js 会接管更完整的摄像机系统。
        // ----------------------------------------------------

        const depth =
            this.z - camera.z;


        const perspective =
            camera.focalLength /
            (
                camera.focalLength +
                depth
            );


        // 防止异常值导致粒子消失或爆炸

        const safePerspective =
            clamp(
                perspective,
                0.15,
                3
            );


        this.screenX =
            camera.centerX +
            this.x *
            safePerspective;


        this.screenY =
            camera.centerY +
            this.y *
            safePerspective;


        this.screenSize =
            this.baseSize *
            safePerspective *
            this.breath;



        // ----------------------------------------------------
        // 深度透明度
        // ----------------------------------------------------

        const depthFade =
            clamp(
                1 -
                Math.abs(depth) /
                (
                    CONFIG.space.depthRange
                ),
                0.12,
                1
            );


        this.screenAlpha =
            this.brightness *
            depthFade;


        return this;

    }



    // ========================================================
    // 获取最终亮度
    // ========================================================

    getBrightness(lightFactor = 1) {

        return clamp(
            this.screenAlpha *
            lightFactor,
            0,
            1
        );

    }

}



// ============================================================
// 工具函数
// ============================================================


function randomRange(min, max) {

    return (
        Math.random() *
        (max - min)
    ) + min;

}



function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}



function normalizeDepth(z) {

    const range =
        CONFIG.space.depthRange;


    return clamp(
        (z + range) /
        (range * 2),
        0,
        1
    );

}
