export const metadata = {
  title: "Stippled Landscape",
  description: "Pointillism technique creating rolling hills and sky"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#000000';
  
  const horizon = canvas.height * 0.6;
  
  // Generate landscape contours
  const hills = [];
  for (let x = 0; x <= canvas.width; x += 10) {
    const baseHeight = horizon + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.005) * 50;
    const detailHeight = baseHeight + Math.sin(x * 0.02) * 10 + Math.sin(x * 0.03) * 5;
    hills.push({ x, y: detailHeight });
  }
  
  // Function to get landscape height at any x position
  function getLandscapeHeight(x) {
    const index = Math.floor(x / 10);
    if (index >= 0 && index < hills.length) {
      return hills[index].y;
    }
    return horizon;
  }
  
  // Stippling function
  function stipple(x, y, density) {
    if (Math.random() < density) {
      const dotSize = 0.5 + Math.random() * 1;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Sky stippling (lighter, decreasing toward horizon)
  for (let y = 0; y < horizon; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      const skyDensity = (horizon - y) / horizon * 0.02;
      // Add cloud-like formations
      const cloudNoise = Math.sin(x * 0.008 + y * 0.005) * Math.cos(x * 0.003);
      const cloudDensity = cloudNoise > 0.3 ? skyDensity * 3 : skyDensity;
      stipple(x + Math.random() * 3, y + Math.random() * 3, cloudDensity);
    }
  }
  
  // Ground stippling
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const groundLevel = getLandscapeHeight(x);
      
      if (y > groundLevel) {
        // Distance from surface affects density
        const depth = y - groundLevel;
        const surfaceDensity = Math.max(0, 0.4 - depth * 0.01);
        
        // Add texture variation
        const textureNoise = Math.sin(x * 0.02) * Math.cos(y * 0.015);
        const finalDensity = surfaceDensity + textureNoise * 0.1;
        
        stipple(x + Math.random() * 2, y + Math.random() * 2, finalDensity);
      }
    }
  }
  
  // Add some trees/vegetation with denser stippling
  for (let i = 0; i < 8; i++) {
    const treeX = Math.random() * canvas.width;
    const groundY = getLandscapeHeight(treeX);
    const treeHeight = 20 + Math.random() * 40;
    
    // Tree trunk
    for (let y = groundY - treeHeight; y < groundY; y += 1) {
      for (let x = treeX - 2; x < treeX + 2; x += 1) {
        stipple(x + Math.random() * 2, y + Math.random() * 2, 0.7);
      }
    }
    
    // Tree canopy
    const canopyRadius = 10 + Math.random() * 15;
    const canopyY = groundY - treeHeight;
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      for (let r = 0; r < canopyRadius; r += 2) {
        const x = treeX + Math.cos(angle) * r;
        const y = canopyY + Math.sin(angle) * r * 0.6;
        
        const canopyDensity = (canopyRadius - r) / canopyRadius * 0.6;
        stipple(x + Math.random() * 2, y + Math.random() * 2, canopyDensity);
      }
    }
  }
}