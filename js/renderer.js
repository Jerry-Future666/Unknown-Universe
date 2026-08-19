// ============================================================
// Unknown Universe v0.6
// Renderer
//
// 统一三维粒子渲染器
//
// Renderer 是整个视觉系统唯一负责：
//
// 1. 三维投影
// 2. 深度计算
// 3. 深度排序
// 4. 粒子绘制
//
// Planet / Ring 不再负责最终绘制。
// 它们只负责计算粒子的三维世界坐标。
// ============================================================


import { CONFIG } from "./config.js";



export class Renderer {

    constructor(engine) {

        this.engine =
            engine;

        this.camera =
            engine.camera;

        this.objects = [];

    }



    // ========================================================
    // 设置场景对象
    // ========================================================

    setObjects(objects) {

        this.objects =
            objects || [];

    }



    // ========================================================
    // 主渲染入口
    // ========================================================

    render(ctx) {

        const renderQueue = [];


        // ----------------------------------------------------
        // 收集所有场景粒子
        //
        // Planet 和 Ring 在这里被视为同一个三维空间。
        // ----------------------------------------------------

        for (
            let objectIndex = 0;
            objectIndex < this.objects.length;
            objectIndex++
        ) {

            const object =
                this.objects[
                    objectIndex
                ];


            if (
                !object ||
                !Array.isArray(
                    object.particles
                )
            ) {

                continue;

            }


            // ------------------------------------------------
            // 天体的屏幕位置偏移
            //
            // 当前项目的 Planet.centerX / centerY
            // 是相对于 Canvas 中心的天体位置偏移。
            //
            // 这里统一处理。
            // ------------------------------------------------

            const offsetX =
                Number.isFinite(
                    object.centerX
                )
                    ? object.centerX
                    : 0;


            const offsetY =
                Number.isFinite(
                    object.centerY
                )
                    ? object.centerY
                    : 0;



            // ------------------------------------------------
            // 收集粒子
            // ------------------------------------------------

            for (
                let i = 0;
                i < object.particles.length;
                i++
            ) {

                const particle =
                    object.particles[i];


                if (!particle) {

                    continue;

                }


                // ------------------------------------------------
                // 获取粒子的真实三维世界坐标
                //
                // v0.6 开始：
                //
                // x / y / z
                //
                // 才是 Renderer 认可的最终世界坐标。
                //
                // baseX / baseY / baseZ
                // 仅作为兼容旧系统的备用值。
                // ------------------------------------------------

                const x =
                    Number.isFinite(
                        particle.x
                    )
                        ? particle.x
                        : particle.baseX;


                const y =
                    Number.isFinite(
                        particle.y
                    )
                        ? particle.y
                        : particle.baseY;


                const z =
                    Number.isFinite(
                        particle.z
                    )
                        ? particle.z
                        : particle.baseZ;


                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y) ||
                    !Number.isFinite(z)
                ) {

                    continue;

                }



                // ------------------------------------------------
                // 相机深度
                // ------------------------------------------------

                const depth =
                    z -
                    this.camera.z;


                // ------------------------------------------------
                // 透视
                // ------------------------------------------------

                const perspective =
                    this.calculatePerspective(
                        depth
                    );


                if (
                    perspective <= 0
                ) {

                    continue;

                }



                // ------------------------------------------------
                // 屏幕坐标
                //
                // 注意：
                //
                // Camera center
                // +
                // 天体位置偏移
                // +
                // 粒子投影
                //
                // 所有中心计算现在集中在 Renderer。
                // ------------------------------------------------

                const screenX =
                    this.camera.centerX +
                    offsetX +
                    x *
                    perspective;


                const screenY =
                    this.camera.centerY +
                    offsetY +
                    y *
                    perspective;



                // ------------------------------------------------
                // 深度透明度
                // ------------------------------------------------

                const depthFade =
                    this.calculateDepthFade(
                        depth
                    );



                // ------------------------------------------------
                // 粒子视觉属性
                // ------------------------------------------------

                const baseSize =
                    Number.isFinite(
                        particle.baseSize
                    )
                        ? particle.baseSize
                        : (
                            Number.isFinite(
                                particle.size
                            )
                                ? particle.size
                                : 1
                        );


                const breath =
                    Number.isFinite(
                        particle.breath
                    )
                        ? particle.breath
                        : 1;


                const brightness =
                    Number.isFinite(
                        particle.brightness
                    )
                        ? particle.brightness
                        : (
                            Number.isFinite(
                                particle.baseBrightness
                            )
                                ? particle.baseBrightness
                                : 1
                        );


                // ------------------------------------------------
                // 天体光照
                //
                // Planet 粒子拥有 planetLight。
                //
                // Ring 没有时默认 1。
                // ------------------------------------------------

                const lightFactor =
                    Number.isFinite(
                        particle.planetLight
                    )
                        ? particle.planetLight
                        : 1;



                // ------------------------------------------------
                // 最终粒子尺寸
                // ------------------------------------------------

                const screenSize =
                    Math.max(
                        0.35,
                        baseSize *
                        perspective *
                        breath
                    );



                // ------------------------------------------------
                // 最终透明度
                //
                // 故意保持克制。
                //
                // Unknown Universe 不允许重新出现
                // 大面积廉价光晕。
                // ------------------------------------------------

                const alpha =
                    clamp(
                        brightness *
                        lightFactor *
                        depthFade,
                        0,
                        0.82
                    );



                if (
                    alpha <= 0.01
                ) {

                    continue;

                }



                // ------------------------------------------------
                // 加入统一渲染队列
                // ------------------------------------------------

                renderQueue.push({

                    particle,

                    x: screenX,

                    y: screenY,

                    size: screenSize,

                    alpha,

                    depth,

                    objectIndex

                });

            }

        }



        // ====================================================
        // 统一深度排序
        // ====================================================

        // ----------------------------------------------------
        // 当前 Camera 投影逻辑：
        //
        // depth 越大 = 离摄像机越远
        //
        // 因此：
        //
        // 远 → 近
        //
        // 才能保证近处粒子覆盖远处粒子。
        // ----------------------------------------------------

        renderQueue.sort(
            (a, b) => {

                if (
                    a.depth !==
                    b.depth
                ) {

                    return (
                        b.depth -
                        a.depth
                    );

                }


                // ------------------------------------------------
                // 深度完全相同时保持稳定排序。
                // ------------------------------------------------

                return (
                    a.objectIndex -
                    b.objectIndex
                );

            }
        );



        // ====================================================
        // 绘制
        // ====================================================

        const color =
            CONFIG.particleColor;


        for (
            let i = 0;
            i < renderQueue.length;
            i++
        ) {

            const item =
                renderQueue[i];


            ctx.beginPath();


            ctx.arc(

                item.x,

                item.y,

                item.size,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                `rgba(
                    ${color.r},
                    ${color.g},
                    ${color.b},
                    ${item.alpha}
                )`;


            ctx.fill();

        }

    }



    // ========================================================
    // 透视计算
    // ========================================================

    calculatePerspective(depth) {

        const focalLength =
            this.camera.focalLength;


        const denominator =
            focalLength +
            depth;


        if (
            denominator <= 0.001
        ) {

            return 0;

        }


        const perspective =
            focalLength /
            denominator;


        return clamp(
            perspective,
            0.15,
            3
        );

    }



    // ========================================================
    // 深度淡出
    // ========================================================

    calculateDepthFade(depth) {

        const range =
            CONFIG.space.depthRange;


        if (
            range <= 0
        ) {

            return 1;

        }


        return clamp(

            1 -
            Math.abs(depth) /
            range,

            0.12,

            1

        );

    }

}



// ============================================================
// 工具函数
// ============================================================

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
