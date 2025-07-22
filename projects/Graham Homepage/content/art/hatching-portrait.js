export const metadata = {
  title: "Hatching Portrait",
  description: "Cross-hatching technique creating depth and form"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const faceRadius = Math.min(canvas.width, canvas.height) * 0.25;
  
  // Create density map for hatching
  function getDensity(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Face outline
    if (distance < faceRadius) {
      // Nose area
      if (Math.abs(dx) < 15 && dy > -20 && dy < 20) return 0.7;
      // Eye areas
      if (((dx > -40 && dx < -20) || (dx > 20 && dx < 40)) && dy > -40 && dy < -20) return 0.8;
      // Mouth area
      if (Math.abs(dx) < 25 && dy > 30 && dy < 50) return 0.6;
      // Cheek shadows
      if (Math.abs(dx) > 30 && Math.abs(dy) < 30) return 0.4;
      // General face
      return 0.2;
    }
    
    // Hair area
    if (distance < faceRadius * 1.3 && dy < 0) return 0.9;
    
    return 0;
  }
  
  // Draw hatching lines
  const spacing = 4;
  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      const density = getDensity(x, y);
      if (density > 0.1) {
        drawHatchArea(x, y, spacing, density);
      }
    }
  }
  
  function drawHatchArea(startX, startY, size, density) {
    const lines = Math.floor(density * 8);
    const lineSpacing = size / (lines + 1);
    
    ctx.beginPath();
    
    // Horizontal hatching
    for (let i = 1; i <= lines; i++) {
      const y = startY + i * lineSpacing;
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + size, y);
    }
    
    // Cross-hatching for higher density
    if (density > 0.5) {
      for (let i = 1; i <= lines; i++) {
        const x = startX + i * lineSpacing;
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + size);
      }
    }
    
    // Diagonal cross-hatching for highest density
    if (density > 0.7) {
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + size, startY + size);
      ctx.moveTo(startX + size, startY);
      ctx.lineTo(startX, startY + size);
    }
    
    ctx.stroke();
  }
}