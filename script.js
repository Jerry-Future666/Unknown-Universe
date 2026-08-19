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


// ============================
// 宇宙参数
// ============================

const particleCount = 800;

let particles = [];


// 镜头漂移
let camera = {
    x:0,
    y:0,
    drift:0
};


// ============================
// 工具函数
// ============================

function random(min,max){
    return Math.random()*(max-min)+min;
}


// ============================
// 创建宇宙粒子
// ============================

function createParticles(){

    particles=[];


    for(let i=0;i<particleCount;i++){


        let type;


        let r=Math.random();


        // 三层空间

        if(r<0.6){

            type="far";

        }
        else if(r<0.9){

            type="mid";

        }
        else{

            type="near";

        }



        let depth;


        if(type==="far")
            depth=random(0.1,0.35);

        if(type==="mid")
            depth=random(0.35,0.7);

        if(type==="near")
            depth=random(0.7,1);



        particles.push({


            x:random(-width,width*2),

            y:random(-height,height*2),


            z:depth,


            type:type,


            size:
            type==="far"
            ? random(0.3,0.8)
            :
            type==="mid"
            ? random(0.7,1.5)
            :
            random(1,2.5),



            // 宇宙流方向

            vx:
            random(-0.12,0.12),

            vy:
            random(-0.12,0.12),



            // 曲线漂移

            angle:
            Math.random()*Math.PI*2,


            wave:
            random(0.002,0.008),



            // 呼吸

            breathe:
            Math.random()*Math.PI*2,


            breatheSpeed:
            random(0.003,0.012),



            // 光强

            light:

            type==="near"
            ?
            random(0.5,0.9)
            :
            random(0.15,0.5)



        });

    }

}


createParticles();



// ============================
// 背景空间
// ============================

function drawBackground(){


    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );



    // 极弱空间雾


    let spaceGlow =
    ctx.createRadialGradient(

        width/2+camera.x,
        height/2+camera.y,

        50,

        width/2,
        height/2,

        width

    );


    spaceGlow.addColorStop(

        0,

        "rgba(255,255,255,0.035)"

    );


    spaceGlow.addColorStop(

        1,

        "rgba(0,0,0,0)"

    );



    ctx.fillStyle=spaceGlow;


    ctx.fillRect(

        0,
        0,
        width,
        height

    );


}



// ============================
// 粒子绘制
// ============================

function drawParticles(){


    particles.forEach(p=>{


        // 空间流动

        p.angle += p.wave;


        p.x += 
        p.vx +
        Math.cos(p.angle)*0.05;


        p.y +=
        p.vy +
        Math.sin(p.angle)*0.05;



        // 镜头影响

        let px =
        p.x-camera.x*p.z;


        let py =
        p.y-camera.y*p.z;



        // 循环空间

        if(px<-50)
            p.x=width+50;

        if(px>width+50)
            p.x=-50;


        if(py<-50)
            p.y=height+50;

        if(py>height+50)
            p.y=-50;




        // 呼吸

        p.breathe+=p.breatheSpeed;


        let breath=
        (Math.sin(p.breathe)+1)/2;



        let alpha =
        p.light*
        (0.6+breath*0.5);



        // 深度大小

        let size =
        p.size*p.z+0.3;



        // 光晕

        let glow =
        ctx.createRadialGradient(

            px,
            py,
            0,

            px,
            py,

            size*8

        );



        glow.addColorStop(

            0,

            `rgba(255,255,255,${alpha})`

        );


        glow.addColorStop(

            0.2,

            `rgba(255,255,255,${alpha*0.3})`

        );


        glow.addColorStop(

            1,

            "rgba(255,255,255,0)"

        );



        ctx.fillStyle=glow;


        ctx.beginPath();

        ctx.arc(

            px,
            py,
            size*8,

            0,

            Math.PI*2

        );

        ctx.fill();



        // 星点核心


        ctx.beginPath();

        ctx.arc(

            px,
            py,
            size,

            0,

            Math.PI*2

        );



        ctx.fillStyle=
        `rgba(255,255,255,${alpha})`;

        ctx.fill();



    });



}



// ============================
// 镜头漂移
// ============================

function updateCamera(){


    camera.drift+=0.002;


    camera.x=
    Math.sin(camera.drift)*30;


    camera.y=
    Math.cos(camera.drift*0.7)*20;


}



// ============================
// 主循环
// ============================

function animate(){


    updateCamera();


    drawBackground();


    drawParticles();


    requestAnimationFrame(animate);


}



animate();
