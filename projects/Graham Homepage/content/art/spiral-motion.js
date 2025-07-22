export const metadata = {
  title: "Spiral Motion",
  description: "Animated spiral with rotating particles"
};

export function render(canvas, ctx) {
  let time = 0;
  
  function animate() {
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing style
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4a9eff';
    ctx.shadowBlur = 10;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Draw spiral
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = (angle / (Math.PI * 8)) * maxRadius;
      const x = centerX + Math.cos(angle + time * 0.02) * radius;
      const y = centerY + Math.sin(angle + time * 0.02) * radius;
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw rotating particles
    for (let i = 0; i < 6; i++) {
      const particleAngle = (i / 6) * Math.PI * 2 + time * 0.03;
      const particleRadius = maxRadius * 0.7;
      const x = centerX + Math.cos(particleAngle) * particleRadius;
      const y = centerY + Math.sin(particleAngle) * particleRadius;
      
      ctx.fillStyle = '#ff6b6b';
      ctx.shadowColor = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    time++;
    requestAnimationFrame(animate);
  }
  
  animate();
}