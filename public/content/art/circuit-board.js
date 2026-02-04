export const metadata = {
  title: "Circuit Board",
  description: "Technical drawing inspired by electronic circuit layouts"
};

export function render(canvas, ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  
  const gridSize = 20;
  const nodes = [];
  
  // Create grid of potential connection points
  for (let x = gridSize; x < canvas.width - gridSize; x += gridSize) {
    for (let y = gridSize; y < canvas.height - gridSize; y += gridSize) {
      if (Math.random() > 0.3) {
        nodes.push({ x, y, connected: false });
      }
    }
  }
  
  // Draw connection paths
  function drawPath(startNode, endNode) {
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    
    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    
    // Manhattan-style routing
    if (Math.abs(dx) > Math.abs(dy)) {
      const midX = startNode.x + dx * 0.7;
      ctx.lineTo(midX, startNode.y);
      ctx.lineTo(midX, endNode.y);
      ctx.lineTo(endNode.x, endNode.y);
    } else {
      const midY = startNode.y + dy * 0.7;
      ctx.lineTo(startNode.x, midY);
      ctx.lineTo(endNode.x, midY);
      ctx.lineTo(endNode.x, endNode.y);
    }
    
    ctx.stroke();
  }
  
  // Connect nearby nodes
  nodes.forEach((node, index) => {
    const nearbyNodes = nodes.filter((other, otherIndex) => {
      if (otherIndex <= index) return false;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < gridSize * 3 && distance > gridSize;
    });
    
    if (nearbyNodes.length > 0 && Math.random() > 0.6) {
      const target = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];
      drawPath(node, target);
      node.connected = true;
      target.connected = true;
    }
  });
  
  // Draw component rectangles
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * (canvas.width - 60) + 30;
    const y = Math.random() * (canvas.height - 40) + 20;
    const width = 20 + Math.random() * 40;
    const height = 10 + Math.random() * 20;
    
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
    
    // Add component pins
    const numPins = Math.floor(Math.random() * 6) + 2;
    for (let pin = 0; pin < numPins; pin++) {
      const pinX = x + (pin + 1) * width / (numPins + 1);
      ctx.beginPath();
      ctx.moveTo(pinX, y);
      ctx.lineTo(pinX, y - 5);
      ctx.moveTo(pinX, y + height);
      ctx.lineTo(pinX, y + height + 5);
      ctx.stroke();
    }
  }
  
  // Draw nodes as connection points
  ctx.lineWidth = 1;
  nodes.forEach(node => {
    if (node.connected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  
  // Add via holes
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}