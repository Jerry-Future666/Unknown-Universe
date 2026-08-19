const canvas=document.getElementById("universe");
const ctx=canvas.getContext("2d");


let w,h;


function resize(){

    w=canvas.width=window.innerWidth;
    h=canvas.height=window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



// ==============================
// 天体参数
// ==============================


const planet={


    x:-w*0.08,


    y:h*0.5,


    // 主体更巨大

    radius:h*0.82,


    rotation:0,


    speed:0.0007

};



// 星环独立尺寸

const ringRadius = planet.radius*0.9;



let planetParticles=[];

let ringBack=[];

let ringFront=[];

let dustParticles=[];

let backgroundStars=[];




function random(min,max){

    return Math.random()*(max-min)+min;

}



// ==============================
// 星球粒子
// ==============================


function createPlanet(){


    planetParticles=[];


    for(let i=0;i<4200;i++){


        let theta=Math.random()*Math.PI*2;


        let phi=Math.acos(
            random(-1,1)
        );


        // 地貌扰动

        let terrain =
        random(0.78,1.02);



        planetParticles.push({


            theta,


            phi,


            r:
            planet.radius*terrain,


            size:
            random(0.4,1.8),


            brightness:
            random(0.2,0.8),


            area:
            Math.random()



        });



    }


}



// ==============================
// 星环
// ==============================


function createRing(){


    ringBack=[];
    ringFront=[];


    for(let i=0;i<1200;i++){



        let p={


            angle:
            Math.random()*Math.PI*2,


            distance:
            ringRadius*
            random(1.15,1.45),


            height:
            random(-25,25),



            size:
            random(0.4,1.4),



            alpha:
            random(0.12,0.5)


        };


        // 制造断裂

        if(Math.random()>0.5)

            ringFront.push(p);

        else

            ringBack.push(p);



    }


}




// ==============================
// 星尘
// ==============================


function createDust(){


    dustParticles=[];


    for(let i=0;i<900;i++){


        dustParticles.push({


            x:
            random(0,w),


            y:
            random(0,h),


            size:
            random(0.2,1),


            alpha:
            random(0.05,0.25),


            speed:
            random(0.0001,0.0005)


        });



    }


}



// ==============================
// 远景星空
// ==============================


function createStars(){


    backgroundStars=[];


    for(let i=0;i<400;i++){


        backgroundStars.push({


            x:random(0,w),


            y:random(0,h),


            size:random(0.2,0.8),


            alpha:random(0.05,0.3)


        });


    }


}


createPlanet();

createRing();

createDust();

createStars();



// ==============================
// 背景
// ==============================


function drawBackground(){


    ctx.fillStyle="#000";

    ctx.fillRect(0,0,w,h);



    backgroundStars.forEach(s=>{


        ctx.beginPath();


        ctx.arc(
            s.x,
            s.y,
            s.size,
            0,
            Math.PI*2
        );


        ctx.fillStyle=
        `rgba(255,255,255,${s.alpha})`;


        ctx.fill();


    });



}



// ==============================
// 星尘
// ==============================


function drawDust(){


    dustParticles.forEach(d=>{


        d.x-=d.speed;


        if(d.x<0)

            d.x=w;



        ctx.beginPath();


        ctx.arc(
            d.x,
            d.y,
            d.size,
            0,
            Math.PI*2
        );


        ctx.fillStyle=
        `rgba(220,225,230,${d.alpha})`;


        ctx.fill();


    });


}




// ==============================
// 星环
// ==============================


function drawRing(list){


    list.forEach(p=>{


        p.angle+=0.0005;



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

        `rgba(230,235,240,${p.alpha})`;


        ctx.fill();



    });



}



// ==============================
// 星球
// ==============================


function drawPlanet(){


    planet.rotation-=planet.speed;



    planetParticles.forEach(p=>{


        let theta=
        p.theta+
        planet.rotation;



        let x=

        planet.x+

        p.r*

        Math.sin(p.phi)

        *

        Math.cos(theta);



        let y=

        planet.y+

        p.r*

        Math.cos(p.phi);



        // 光照方向

        let light=

        Math.sin(p.phi)*0.7+0.3;



        light*=p.brightness;



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



// ==============================
// 主循环
// ==============================


function animate(){


    drawBackground();


    drawDust();


    drawRing(ringBack);


    drawPlanet();


    drawRing(ringFront);



    requestAnimationFrame(animate);


}


animate();
