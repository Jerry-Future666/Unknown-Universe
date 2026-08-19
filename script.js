const canvas=document.getElementById("universe");

const ctx=canvas.getContext("2d");


let w,h;


function resize(){

    w=canvas.width=window.innerWidth;

    h=canvas.height=window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



// ==========================
// 星球参数
// ==========================


const planet={

    x:-w*0.05,

    y:h/2,

    radius:h*0.55,

    rotation:0

};



// 粒子

let planetParticles=[];

let ringParticles=[];




function random(min,max){

    return Math.random()*(max-min)+min;

}



// ==========================
// 创建星球
// ==========================


function createPlanet(){


    planetParticles=[];


    for(let i=0;i<1600;i++){


        let theta=Math.random()*Math.PI*2;

        let phi=Math.acos(
            random(-1,1)
        );


        let r=
        planet.radius*
        random(0.75,1);



        planetParticles.push({

            theta,

            phi,

            r,


            size:random(0.5,1.8),


            alpha:random(0.15,0.65),


            speed:random(0.0002,0.0008)

        });

    }

}




// ==========================
// 创建星环
// ==========================


function createRing(){


    ringParticles=[];


    for(let i=0;i<700;i++){


        let angle=
        Math.random()*Math.PI*2;


        let distance=
        planet.radius*
        random(1.15,1.65);



        ringParticles.push({


            angle,


            distance,


            height:
            random(-15,15),


            size:
            random(0.4,1.5),


            alpha:
            random(0.1,0.5)

        });

    }

}



createPlanet();

createRing();



// ==========================
// 绘制背景
// ==========================


function background(){


    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        w,
        h
    );

}



// ==========================
// 绘制星球
// ==========================


function drawPlanet(){


    planet.rotation+=0.001;



    planetParticles.forEach(p=>{


        p.theta+=p.speed;



        let x =
        planet.x +

        p.r*

        Math.sin(p.phi)*

        Math.cos(
            p.theta+
            planet.rotation
        );



        let y =
        planet.y +

        p.r*

        Math.cos(p.phi);



        let z =
        Math.sin(p.phi);



        let size =
        p.size*
        (0.7+z*0.3);



        ctx.beginPath();


        ctx.arc(

            x,
            y,

            size,

            0,

            Math.PI*2

        );


        ctx.fillStyle=
        `rgba(230,235,240,${p.alpha})`;


        ctx.fill();



    });


}



// ==========================
// 星环
// ==========================


function drawRing(){


    ringParticles.forEach(p=>{


        p.angle+=0.0008;



        let x=

        planet.x+

        Math.cos(p.angle)

        *

        p.distance;



        let y=

        planet.y+

        Math.sin(p.angle)

        *

        p.distance*

        0.25

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

        `rgba(230,230,230,${p.alpha})`;


        ctx.fill();



    });



}




// ==========================
// 动画
// ==========================


function animate(){


    background();


    drawRing();


    drawPlanet();


    requestAnimationFrame(animate);


}


animate();
