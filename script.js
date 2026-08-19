const canvas = document.getElementById("universe");
const ctx = canvas.getContext("2d");

let width;
let height;

function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();



const particleCount = 550;

let particles = [];



function random(min,max){
    return Math.random()*(max-min)+min;
}



function createParticles(){

    particles=[];

    for(let i=0;i<particleCount;i++){

        let depth=Math.random();


        particles.push({

            x:Math.random()*width,
            y:Math.random()*height,


            // 深度
            z:depth,


            // 基础大小
            size:random(0.3,1.8),


            // 运动
            vx:random(-0.08,0.08),
            vy:random(-0.08,0.08),


            // 波动参数
            angle:Math.random()*Math.PI*2,

            wave:random(0.001,0.006),


            // 呼吸
            breathe:Math.random()*Math.PI*2,

            breatheSpeed:
            random(0.005,0.02),


            opacity:
            random(0.15,0.65)

        });

    }

}


createParticles();





function drawSpace(){

    // 黑色空间

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // 极弱空间雾

    let gradient =
    ctx.createRadialGradient(
        width/2,
        height/2,
        50,
        width/2,
        height/2,
        width
    );


    gradient.addColorStop(
        0,
        "rgba(255,255,255,0.025)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle=gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

}





function drawParticles(){

    particles.forEach(p=>{


        // 自然漂移

        p.angle += p.wave;


        p.x += 
        p.vx +
        Math.cos(p.angle)*0.03;


        p.y +=
        p.vy +
        Math.sin(p.angle)*0.03;



        // 循环空间

        if(p.x< -30)
            p.x=width+30;

        if(p.x>width+30)
            p.x=-30;


        if(p.y< -30)
            p.y=height+30;

        if(p.y>height+30)
            p.y=-30;



        // 呼吸

        p.breathe += p.breatheSpeed;


        let breathe =
        (Math.sin(p.breathe)+1)/2;



        // 深度

        let depth =
        0.5+p.z;



        let size =
        p.size*depth;



        let alpha =
        p.opacity*
        (0.7+breathe*0.5);



        // 光晕

        let glow =
        ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            size*5
        );


        glow.addColorStop(
            0,
            `rgba(255,255,255,${alpha})`
        );


        glow.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );


        ctx.fillStyle=glow;


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            size*5,
            0,
            Math.PI*2
        );

        ctx.fill();



        // 中心粒子

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            size,
            0,
            Math.PI*2
        );


        ctx.fillStyle=
        `rgba(255,255,255,${alpha})`;


        ctx.fill();



    });

}





function animate(){

    drawSpace();

    drawParticles();

    requestAnimationFrame(animate);

}


animate();
