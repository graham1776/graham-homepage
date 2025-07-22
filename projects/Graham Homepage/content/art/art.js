export const metadata = {
  title: "Animated Rectangles",
  description: "Random grayscale rectangles with rotation and animation"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.translate(centerX, centerY);
  
  const time = 2;
  const frequency = 30;
  let frameCount = 0;
  const maxFrames = time * frequency;
  
  function draw() {
    if (frameCount >= maxFrames) return;
    
    const count = 5;
    
    for (let i = 0; i < count; i++) {
      const width = 100 * (Math.random() * 0.5);
      const length = 100 * (Math.random() * 0.5);
      const location = 70;
      
      const value = Math.random() * 0xFF | 0;
      const grayscale = (value << 16) | (value << 8) | value;
      const grayscalecolor = '#' + grayscale.toString(16).padStart(6, '0');
      
      ctx.save();
      ctx.rotate(Math.PI * Math.random());
      ctx.translate(location * Math.random(), location * Math.random());
      ctx.rect(-width/2, -length/2, width, length);
      
      ctx.lineWidth = 2 * Math.random();
      ctx.strokeStyle = grayscalecolor;
      ctx.stroke();
      ctx.restore();
    }
    
    frameCount++;
    if (frameCount < maxFrames) {
      setTimeout(() => requestAnimationFrame(draw), 1000 / frequency);
    }
  }
  
  draw();
}