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


// 粒子数量
const particleCount = 500;


let particles = [];


// 创建粒子

function createParticles(){

    particles = [];

    for(let i = 0; i < particleCount; i++){

        particles.push({

            x: Math.random() * width,
            y: Math.random() * height,

            // 模拟深度
            z: Math.random(),

            size: Math.random() * 1.8 + 0.5,

            speedX:
            (Math.random()-0.5)*0.15,

            speedY:
            (Math.random()-0.5)*0.15,


            opacity:
            Math.random()*0.5+0.2,


            breathe:
            Math.random()*Math.PI*2

        });

    }

}


createParticles();



// 绘制

function draw(){

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    particles.forEach(p=>{


        // 运动

        p.x += p.speedX;
        p.y += p.speedY;



        // 超出返回

        if(p.x < -20)
            p.x = width+20;

        if(p.x > width+20)
            p.x = -20;


        if(p.y < -20)
            p.y = height+20;

        if(p.y > height+20)
            p.y = -20;



        // 呼吸

        p.breathe += 0.01;


        let glow =
        p.opacity +
        Math.sin(p.breathe)*0.1;



        // 深度模拟

        let depth =
        0.5+p.z;



        let size =
        p.size*depth;



        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            size,
            0,
            Math.PI*2
        );


        ctx.fillStyle =
        `rgba(255,255,255,${glow})`;


        ctx.fill();


    });


    requestAnimationFrame(draw);

}



draw();
