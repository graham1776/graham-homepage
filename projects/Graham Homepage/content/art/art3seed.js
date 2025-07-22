export const metadata = {
  title: "Seeded Rectangles",
  description: "Deterministic colorful rectangles using seeded random generation"
};

export function render(canvas, ctx) {
  ctx.save();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f5f5dc";
  ctx.fill();

  const colors = ["#ff0000", "#000000", "#444444", "#ffff00", "#0000ff"];
  
  colors.forEach(color => {
    art(ctx, color, canvas);
  });

  function art(ctx, color, canvas) {
    let seed = 1;
    
    function random() {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    
    const count = 100;
    
    ctx.save();
    ctx.beginPath();
    ctx.translate(canvas.width/2, canvas.height/2);
    
    for (let num = 0; num < count; num++) {
      const rnd = random();
      const rnd2 = random();
      const width = 80 * rnd;
      const length = 80 * rnd2;
      const location = 10;

      ctx.beginPath();
      ctx.rotate(Math.PI * random());
      ctx.translate(location * random(), location * random());
      
      ctx.rect(-width/2, -length/2, width, length);
      ctx.translate(width, length);
      
      ctx.lineWidth = random() * 4;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
    }
    ctx.closePath();
    ctx.restore();
  }
}