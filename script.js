const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

let w, h;


function resize(){

    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize", resize);



// ===============================
// 未知天体参数
// ===============================

const planet = {

    // C方案：巨大但远处

    x: -w * 0.05,

    y: h * 0.5,

    radius: h * 0.68,


    rotation:0,

    rotationSpeed:0.0008

};




// ===============================
// 粒子
// ===============================


let planetParticles=[];

let ringBack=[];

let ringFront=[];




function random(min,max){

    return Math.random()*(max-min)+min;

}



// ===============================
// 创建星球粒子
// ===============================


function createPlanet(){


    planetParticles=[];


    for(let i=0;i<2400;i++){


        let theta =
        Math.random()*Math.PI*2;


        let phi =
        Math.acos(
            random(-1,1)
        );


        // 密度变化

        let noise =
        random(0.75,1);



        let r =
        planet.radius*
        noise;



        planetParticles.push({


            theta,

            phi,

            r,


            size:
            random(0.5,1.8),



            brightness:
            random(0.15,0.65),



            offset:
            random(0,Math.PI*2)


        });



    }


}



// ===============================
// 星环
// ===============================


function createRing(){


    ringBack=[];
    ringFront=[];


    for(let i=0;i<1000;i++){


        let particle={


            angle:
            Math.random()*Math.PI*2,


            distance:
            planet.radius*
            random(1.15,1.65),



            height:
            random(-18,18),



            size:
            random(0.5,1.5),



            alpha:
            random(0.15,0.5)

        };



        // 分前后

        if(Math.random()>0.5){

            ringFront.push(particle);

        }
        else{

            ringBack.push(particle);

        }


    }


}



createPlanet();

createRing();



// ===============================
// 背景
// ===============================


function drawBackground(){


    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        w,
        h
    );


}



// ===============================
// 星环绘制
// ===============================


function drawRing(list){


    list.forEach(p=>{


        p.angle+=0.0005;



        let x =
        planet.x +

        Math.cos(p.angle)

        *

        p.distance;



        let y =
        planet.y +

        Math.sin(p.angle)

        *

        p.distance*

        0.28

        +

        p.height;



        ctx.beginPath();


        ctx.arc(

            x,

            y,

            p.size,

            0,

            Math.PI*2

        );


        ctx.fillStyle=

        `rgba(220,225,230,${p.alpha})`;


        ctx.fill();



    });


}




// ===============================
// 星球绘制
// ===============================


function drawPlanet(){


    planet.rotation -= planet.rotationSpeed;



    planetParticles.forEach(p=>{


        // 真正经度旋转


        let theta =
        p.theta + planet.rotation;



        let x =

        planet.x

        +

        p.r*

        Math.sin(p.phi)

        *

        Math.cos(theta);



        let y =

        planet.y

        +

        p.r*

        Math.cos(p.phi);



        // 简单光照

        let light =

        Math.sin(p.phi)*0.7

        +

        0.25;



        light *= p.brightness;



        if(light<0)

            light=0;



        ctx.beginPath();


        ctx.arc(

            x,

            y,

            p.size,

            0,

            Math.PI*2

        );



        ctx.fillStyle=

        `rgba(235,238,240,${light})`;


        ctx.fill();



    });



}



// ===============================
// 动画
// ===============================


function animate(){


    drawBackground();



    // 后方星环

    drawRing(ringBack);



    // 星球

    drawPlanet();



    // 前方星环

    drawRing(ringFront);



    requestAnimationFrame(animate);


}



animate();
