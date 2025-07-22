export const metadata = {
  title: "Chanel Watch",
  description: "Detailed analog watch face with subdials and gold accents"
};

export function render(canvas, ctx) {
  // Set canvas size and context
  const radius = Math.min(canvas.width/2, canvas.height/2) * 0.8;
  ctx.translate(canvas.width/2, canvas.height/2);
  
  let animationId;
  
  function drawClock() {
    // Clear canvas
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    
    drawFace(ctx, radius);
    drawLogo("Chanel", "Helvetica", 0.4, 0.15);
    drawBatons(ctx, radius*0.6, 0, -radius*0.2, 12, radius*0.02, radius*.02);
    drawBatons(ctx, radius*0.6, 0, -radius*0.2, 60, radius*0.01, radius*.02);
    drawSubdial(ctx, radius, 0, radius*0.2);
    drawBatons(ctx, radius*0.23, 0, radius*0.2, 12, radius*.02, radius*.02);
    drawBatons(ctx, radius*0.23, 0, radius*0.2, 60, radius*.01, radius*.02);
    drawTachymeter(ctx, radius, 0, -radius*0.2, radius*0.7);
    drawTime(ctx, radius);
    
    animationId = requestAnimationFrame(drawClock);
  }

  function drawFace(ctx, radius) {
    const grd = ctx.createLinearGradient(-radius, radius, radius, radius);
    grd.addColorStop(0.000, 'rgba(150, 150, 150, 1.000)');
    grd.addColorStop(0.500, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(153, 153, 153, 1.000)');

    // Bezel
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.1, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Dial
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, -radius*0.2, radius * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = "Gold";
    ctx.fill();
  }

  function drawTachymeter(ctx, radius, x, y, length) {
    const numbers = [0,5,10,15,20,25,30,35,40,45,50,55,60];
    const fontsize = radius * 0.08;
    
    ctx.font = fontsize + "px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    
    ctx.save();
    ctx.translate(x, y);
    
    numbers.forEach((num, index) => {
      const ang = (num - 30) * Math.PI / 30;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -length);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    });
    
    ctx.restore();
  }

  function drawBatons(ctx, radius, x, y, count, width, length) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "black";
    
    for (let num = 1; num <= count; num++) {
      const ang = num * Math.PI / (count/2);
      const location = radius - length/2;
      
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -location);
      ctx.beginPath();
      ctx.rect(-width/2, -length/2, width, length);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();
  }

  function drawSubdial(ctx, radius, x, y) {
    const smallradius = radius * 0.25;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, smallradius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, smallradius * 0.04, 0, 2 * Math.PI);
    ctx.strokeStyle = "Gold";
    ctx.lineWidth = radius * 0.02;
    ctx.stroke();
    ctx.fillStyle = "Grey";
    ctx.fill();
    
    ctx.restore();
  }

  function drawLogo(text, font, location, fontsize) {
    const yPos = -radius * location;
    ctx.font = radius * fontsize + "px " + font;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, yPos);
  }

  function drawTime(ctx, radius) {
    const now = new Date();
    let hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();
    const millisecond = now.getMilliseconds();
    
    const hourAngle = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60));
    const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    const secondAngle = (second + millisecond / 1000) * Math.PI / 30;
    
    // Minute hand
    drawHand(ctx, minuteAngle, radius * 0.6, radius * 0.03, 0, -radius*0.2);
    
    // Hour display
    ctx.font = radius * 0.1 + "px helvetica";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(now.getHours().toString().padStart(2, '0'), 0, radius*0.7);
    
    // Seconds hand in subdial
    drawHand(ctx, secondAngle, radius * 0.2, radius * 0.01, 0, radius * 0.2);
  }

  function drawHand(ctx, angle, length, width, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Hand shape
    ctx.beginPath();
    ctx.rect(-width/2, 0, width, -length * 0.95);
    ctx.fillStyle = "Gold";
    ctx.fill();
    
    // Hand tip
    ctx.beginPath();
    ctx.moveTo(-width/2, -length * 0.95);
    ctx.lineTo(0, -length);
    ctx.lineTo(width/2, -length * 0.95);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // Start animation
  drawClock();
  
  // Clean up function (though not called in current system)
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}