export const metadata = {
  title: "Colorful Rectangles",
  description: "Multi-colored overlapping rectangles with random positioning"
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
    const count = 100;
    
    ctx.save();
    ctx.beginPath();
    ctx.translate(canvas.width/2, canvas.height/2);
    
    for (let num = 0; num < count; num++) {
      const rnd = Math.random();
      const rnd2 = Math.random();
      const width = 80 * rnd;
      const length = 80 * rnd2;
      const location = 10;
      
      ctx.beginPath();
      ctx.rotate(Math.PI * Math.random());
      ctx.translate(location * Math.random(), location * Math.random());
      
      ctx.rect(-width/2, -length/2, width, length);
      ctx.translate(width, length);
      
      ctx.lineWidth = Math.random() * 4;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
    }
    ctx.closePath();
    ctx.restore();
  }
}