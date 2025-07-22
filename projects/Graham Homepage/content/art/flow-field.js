export const metadata = {
  title: "Flow Field",
  description: "Organic flowing lines following mathematical vector fields"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  
  const numLines = 80;
  const stepSize = 2;
  const maxSteps = 200;
  
  // Noise function for flow field
  function noise(x, y) {
    return Math.sin(x * 0.01) * Math.cos(y * 0.01) + 
           Math.sin(x * 0.02 + 10) * Math.cos(y * 0.02 + 10) * 0.5;
  }
  
  function getFlowAngle(x, y) {
    return noise(x, y) * Math.PI * 4;
  }
  
  // Draw flow lines
  for (let i = 0; i < numLines; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    for (let step = 0; step < maxSteps; step++) {
      const angle = getFlowAngle(x, y);
      const prevX = x;
      const prevY = y;
      
      x += Math.cos(angle) * stepSize;
      y += Math.sin(angle) * stepSize;
      
      // Stop if we go off canvas
      if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;
      
      // Vary line weight based on flow strength
      const flowStrength = Math.abs(noise(x, y));
      ctx.lineWidth = 0.3 + flowStrength * 0.8;
      
      ctx.lineTo(x, y);
      
      // Occasionally start a new path for broken lines effect
      if (step > 0 && step % 30 === 0 && Math.random() > 0.7) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    
    ctx.stroke();
  }
  
  // Add some anchor points
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 2 + Math.random() * 4;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }
}