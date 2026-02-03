export const metadata = {
  title: "Particle Waves",
  description: "Flowing wave patterns with interactive particles"
};

export function render(canvas, ctx) {
  const particles = [];
  const numParticles = 50;
  let time = 0;
  
  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      hue: Math.random() * 360
    });
  }
  
  function animate() {
    // Fade previous frame
    ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach((particle, index) => {
      // Wave motion
      const waveInfluence = Math.sin(time * 0.02 + particle.x * 0.01) * 2;
      particle.y += waveInfluence * 0.5;
      
      // Basic movement
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      
      // Draw particle
      const alpha = 0.8;
      ctx.fillStyle = `hsla(${(particle.hue + time * 0.5) % 360}, 70%, 60%, ${alpha})`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = particle.size * 2;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Connect nearby particles
      particles.forEach((other, otherIndex) => {
        if (otherIndex > index) {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 60) {
            const alpha = (60 - distance) / 60 * 0.3;
            ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });
    });
    
    time++;
    requestAnimationFrame(animate);
  }
  
  animate();
}