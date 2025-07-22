export const metadata = {
  title: "Geometric Maze",
  description: "Recursive geometric patterns forming maze-like structures"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxSize = Math.min(canvas.width, canvas.height) * 0.8;
  
  function drawRecursiveSquare(x, y, size, depth) {
    if (depth <= 0 || size < 4) return;
    
    // Draw square
    ctx.beginPath();
    ctx.rect(x - size/2, y - size/2, size, size);
    ctx.stroke();
    
    // Draw internal divisions
    const quarterSize = size / 4;
    const halfSize = size / 2;
    
    // Vertical and horizontal lines
    ctx.beginPath();
    ctx.moveTo(x - halfSize, y);
    ctx.lineTo(x + halfSize, y);
    ctx.moveTo(x, y - halfSize);
    ctx.lineTo(x, y + halfSize);
    ctx.stroke();
    
    // Recursive smaller squares
    const newSize = size * 0.4;
    if (Math.random() > 0.3) {
      drawRecursiveSquare(x - quarterSize, y - quarterSize, newSize, depth - 1);
    }
    if (Math.random() > 0.3) {
      drawRecursiveSquare(x + quarterSize, y - quarterSize, newSize, depth - 1);
    }
    if (Math.random() > 0.3) {
      drawRecursiveSquare(x - quarterSize, y + quarterSize, newSize, depth - 1);
    }
    if (Math.random() > 0.3) {
      drawRecursiveSquare(x + quarterSize, y + quarterSize, newSize, depth - 1);
    }
  }
  
  drawRecursiveSquare(centerX, centerY, maxSize, 6);
}