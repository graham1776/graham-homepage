export const metadata = {
  title: "Mountain Topography",
  description: "Procedural mountain ridge generator with topographic contour lines"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#f8f5f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Simplified Perlin noise implementation
  class SimplexNoise {
    constructor(seed = 1) {
      this.seed = seed;
    }
    
    // Simple noise function using sine waves
    noise(x, y = 0) {
      const freq1 = 0.01;
      const freq2 = 0.02;
      const freq3 = 0.05;
      
      return (
        Math.sin(x * freq1 + this.seed) * 0.5 +
        Math.sin(x * freq2 + y * freq1 + this.seed * 2) * 0.3 +
        Math.sin(x * freq3 + y * freq2 + this.seed * 3) * 0.2
      ) / 1.0;
    }
    
    // 2D noise for ridge generation
    noise2D(x, y) {
      return (
        Math.sin(x * 0.008 + y * 0.005 + this.seed) * 0.4 +
        Math.sin(x * 0.015 + y * 0.01 + this.seed * 1.7) * 0.3 +
        Math.sin(x * 0.03 + y * 0.02 + this.seed * 2.3) * 0.2 +
        Math.sin(x * 0.05 + y * 0.04 + this.seed * 3.1) * 0.1
      );
    }
  }
  
  const noise = new SimplexNoise(Math.random() * 1000);
  
  // Height field for the entire canvas
  const heightField = [];
  const resolution = 4; // Sample every 4 pixels for performance
  
  // Initialize height field
  for (let x = 0; x < canvas.width; x += resolution) {
    heightField[x] = [];
    for (let y = 0; y < canvas.height; y += resolution) {
      heightField[x][y] = 0;
    }
  }
  
  // Generate main ridge line across the canvas
  const mainRidge = [];
  const ridgeY = canvas.height * (0.3 + Math.random() * 0.4); // Random height across middle area
  
  for (let x = 0; x < canvas.width; x += 2) {
    const noiseValue = noise.noise(x) * 40; // Vary ridge height
    const y = ridgeY + noiseValue;
    mainRidge.push({ x, y, height: 0.8 + Math.random() * 0.4 });
    
    // Set height in height field for main ridge
    const influence = 60; // How far the ridge affects surrounding area
    for (let dx = -influence; dx <= influence; dx += resolution) {
      for (let dy = -influence; dy <= influence; dy += resolution) {
        const px = x + dx;
        const py = Math.floor(y + dy);
        
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < influence) {
            const ridgePoint = mainRidge[mainRidge.length - 1];
            const falloff = Math.max(0, 1 - distance / influence);
            const height = ridgePoint.height * falloff;
            
            if (!heightField[px]) heightField[px] = [];
            heightField[px][py] = Math.max(heightField[px][py] || 0, height);
          }
        }
      }
    }
  }
  
  // Generate secondary ridges branching from main ridge
  const numBranches = 8 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < numBranches; i++) {
    const startPoint = mainRidge[Math.floor(Math.random() * mainRidge.length)];
    const angle = (Math.random() - 0.5) * Math.PI * 0.8; // Branch angle
    const length = 80 + Math.random() * 120;
    const branchHeight = startPoint.height * (0.6 + Math.random() * 0.3);
    
    let currentX = startPoint.x;
    let currentY = startPoint.y;
    
    for (let step = 0; step < length; step += 3) {
      // Add some noise to branch path
      const noiseAngle = noise.noise2D(currentX, currentY) * 0.3;
      const totalAngle = angle + noiseAngle;
      
      currentX += Math.cos(totalAngle) * 3;
      currentY += Math.sin(totalAngle) * 3;
      
      if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) break;
      
      const stepFalloff = Math.max(0, 1 - step / length);
      const currentHeight = branchHeight * stepFalloff;
      
      // Apply height to surrounding area
      const influence = 30 + stepFalloff * 20;
      for (let dx = -influence; dx <= influence; dx += resolution) {
        for (let dy = -influence; dy <= influence; dy += resolution) {
          const px = Math.floor(currentX + dx);
          const py = Math.floor(currentY + dy);
          
          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < influence) {
              const falloff = Math.max(0, 1 - distance / influence);
              const height = currentHeight * falloff;
              
              if (!heightField[px]) heightField[px] = [];
              heightField[px][py] = Math.max(heightField[px][py] || 0, height);
            }
          }
        }
      }
    }
  }
  
  // Draw topographic contour lines
  const contourLevels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#8B4513';
  
  contourLevels.forEach((level, levelIndex) => {
    ctx.beginPath();
    
    // Trace contour lines using marching squares-like approach
    for (let x = 0; x < canvas.width - resolution; x += resolution) {
      for (let y = 0; y < canvas.height - resolution; y += resolution) {
        const h1 = (heightField[x] && heightField[x][y]) || 0;
        const h2 = (heightField[x + resolution] && heightField[x + resolution][y]) || 0;
        const h3 = (heightField[x] && heightField[x][y + resolution]) || 0;
        const h4 = (heightField[x + resolution] && heightField[x + resolution][y + resolution]) || 0;
        
        // Check if contour line passes through this cell
        const above1 = h1 >= level;
        const above2 = h2 >= level;
        const above3 = h3 >= level;
        const above4 = h4 >= level;
        
        // Simple contour detection - if heights cross the level
        if ((above1 !== above2) || (above1 !== above3) || (above2 !== above4) || (above3 !== above4)) {
          // Draw a small line segment representing the contour
          const centerX = x + resolution / 2;
          const centerY = y + resolution / 2;
          
          // Vary line weight by elevation
          ctx.lineWidth = levelIndex < 3 ? 0.5 : (levelIndex < 6 ? 0.8 : 1.2);
          
          ctx.moveTo(centerX - 2, centerY);
          ctx.lineTo(centerX + 2, centerY);
          ctx.moveTo(centerX, centerY - 2);
          ctx.lineTo(centerX, centerY + 2);
        }
      }
    }
    
    ctx.stroke();
  });
  
  // Draw main ridge line for visual emphasis
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  if (mainRidge.length > 0) {
    ctx.moveTo(mainRidge[0].x, mainRidge[0].y);
    for (let i = 1; i < mainRidge.length; i++) {
      ctx.lineTo(mainRidge[i].x, mainRidge[i].y);
    }
  }
  
  ctx.stroke();
  
  // Add elevation markers
  ctx.fillStyle = '#4A4A4A';
  ctx.font = '10px monospace';
  
  for (let i = 0; i < 5; i++) {
    const ridgePoint = mainRidge[Math.floor(i * mainRidge.length / 5)];
    if (ridgePoint) {
      const elevation = Math.floor(ridgePoint.height * 1000 + 2000); // Fake elevation in meters
      ctx.fillText(`${elevation}m`, ridgePoint.x + 5, ridgePoint.y - 5);
    }
  }
}