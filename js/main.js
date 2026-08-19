// ============================================================
// Unknown Universe v0.5
// Main Entry
//
// 整个 Unknown Universe 的启动入口。
// ============================================================

import { ParticleEngine } from "./engine.js";
import { Particle } from "./particle.js";
import { CONFIG } from "./config.js";


// ============================================================
// 获取 Canvas
// ============================================================

const canvas =
    document.getElementById("universe");


// ------------------------------------------------------------
// 如果 Canvas 不存在，停止运行
// ------------------------------------------------------------

if (!canvas) {

    console.error(
        "Unknown Universe: Canvas #universe not found."
    );

} else {

    startUniverse();

}



// ============================================================
// 启动宇宙
// ============================================================

function startUniverse() {

    // --------------------------------------------------------
    // 创建粒子引擎
    // --------------------------------------------------------

    const engine =
        new ParticleEngine(canvas);



    // --------------------------------------------------------
    // 创建一小批测试粒子
    //
    // 注意：
    // 这不是最终星球。
    //
    // 这里只是确认：
    //
    // index.html
    //      ↓
    // main.js
    //      ↓
    // engine.js
    //      ↓
    // particle.js
    //
    // 整个模块链可以正常运行。
    // --------------------------------------------------------

    createTestParticles(engine);



    // --------------------------------------------------------
    // 启动动画
    // --------------------------------------------------------

    engine.start();



    // --------------------------------------------------------
    // 暴露到 window
    //
    // 方便开发阶段在浏览器控制台检查。
    // 正式版本以后可以删除。
    // --------------------------------------------------------

    window.UnknownUniverse = {

        engine,

        config: CONFIG

    };


    console.log(
        "Unknown Universe v0.5 engine started."
    );

}



// ============================================================
// 创建测试粒子
// ============================================================

function createTestParticles(engine) {

    const count =
        180;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        // ----------------------------------------------------
        // 测试空间范围
        // ----------------------------------------------------

        const x =
            randomRange(
                -engine.width * 0.6,
                engine.width * 0.6
            );


        const y =
            randomRange(
                -engine.height * 0.6,
                engine.height * 0.6
            );


        const z =
            randomRange(
                -CONFIG.space.depthRange * 0.7,
                CONFIG.space.depthRange * 0.7
            );


        const particle =
            new Particle(
                x,
                y,
                z
            );


        engine.addParticle(
            particle
        );

    }

}



// ============================================================
// 工具
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
