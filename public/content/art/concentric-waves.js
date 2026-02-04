export const metadata = {
  title: "Concentric Waves",
  description: "Rhythmic line patterns creating interference and resonance"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  // Primary wave centers
  const waveSources = [
    { x: centerX - 80, y: centerY - 40, frequency: 15, phase: 0 },
    { x: centerX + 60, y: centerY + 30, frequency: 18, phase: Math.PI / 3 },
    { x: centerX, y: centerY - 60, frequency: 12, phase: Math.PI / 2 }
  ];
  
  // Draw concentric circles from each source
  waveSources.forEach(source => {
    for (let radius = 10; radius < maxRadius; radius += source.frequency) {
      const amplitude = Math.max(0, 1 - radius / maxRadius);
      const adjustedRadius = radius + Math.sin(source.phase) * 3;
      
      if (amplitude > 0.1) {
        ctx.globalAlpha = amplitude;
        ctx.beginPath();
        ctx.arc(source.x, source.y, adjustedRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
  
  ctx.globalAlpha = 1;
  
  // Add interference patterns
  const resolution = 3;
  for (let x = 0; x < canvas.width; x += resolution) {
    for (let y = 0; y < canvas.height; y += resolution) {
      let totalWave = 0;
      
      waveSources.forEach(source => {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const wave = Math.sin((distance / source.frequency) * Math.PI * 2 + source.phase);
          const decay = Math.max(0, 1 - distance / (maxRadius * 0.8));
          totalWave += wave * decay;
        }
      });
      
      // Draw interference dots where waves constructively interfere
      if (Math.abs(totalWave) > 1.5) {
        const intensity = Math.min(1, Math.abs(totalWave) / 3);
        ctx.globalAlpha = intensity;
        
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  ctx.globalAlpha = 1;
  
  // Add radial lines from center
  ctx.lineWidth = 0.5;
  const numRadialLines = 24;
  for (let i = 0; i < numRadialLines; i++) {
    const angle = (i / numRadialLines) * Math.PI * 2;
    const startRadius = 20;
    const endRadius = maxRadius * 0.9;
    
    ctx.beginPath();
    for (let r = startRadius; r < endRadius; r += 5) {
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      // Modulate line based on wave interference
      let totalWave = 0;
      waveSources.forEach(source => {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin((distance / source.frequency) * Math.PI * 2 + source.phase);
        totalWave += wave;
      });
      
      if (Math.abs(totalWave) > 0.5) {
        if (r === startRadius) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      } else if (r > startRadius) {
        ctx.stroke();
        ctx.beginPath();
      }
    }
    ctx.stroke();
  }
  
  // Mark wave sources
  ctx.lineWidth = 2;
  waveSources.forEach(source => {
    ctx.beginPath();
    ctx.arc(source.x, source.y, 4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(source.x - 6, source.y);
    ctx.lineTo(source.x + 6, source.y);
    ctx.moveTo(source.x, source.y - 6);
    ctx.lineTo(source.x, source.y + 6);
    ctx.stroke();
  });
}