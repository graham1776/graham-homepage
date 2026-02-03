export const metadata = {
  title: "Nomos Tangente",
  description: "Minimalist German design with blue accents and subdial"
};

export function render(canvas, ctx) {
  const radius = Math.min(canvas.width/2, canvas.height/2) * 0.7;
  ctx.translate(canvas.width/2, canvas.height/2);
  
  let animationId;
  
  function drawClock() {
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    
    drawFace(ctx, radius);
    drawLogo("NOMOS", "Helvetica", 0.4, 0.15);
    drawBatons(ctx, radius * 0.95, 0, 0, 12, radius * 0.02, radius * 0.08);
    drawBatons(ctx, radius * 0.95, 0, 0, 60, radius * 0.01, radius * 0.08);
    drawSubdial(ctx, radius, 0, radius * 0.5);
    drawBatons(ctx, radius * 0.25, 0, radius * 0.5, 12, radius * 0.01, radius * 0.04);
    drawTachymeter(ctx, radius);
    drawTime(ctx, radius);
    
    animationId = requestAnimationFrame(drawClock);
  }

  function drawFace(ctx, radius) {
    const bezelwidth = radius * 1.1;
    const grd = ctx.createLinearGradient(-radius, radius, radius, radius);
    grd.addColorStop(0.000, 'rgba(150, 150, 150, 1.000)');
    grd.addColorStop(0.500, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(153, 153, 153, 1.000)');

    // Bezel
    ctx.beginPath();
    ctx.arc(0, 0, bezelwidth, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Dial (clean white)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();
    
    // Center circle (blue accent)
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = "Blue";
    ctx.fill();
  }

  function drawTachymeter(ctx, radius) {
    const numbers = [2, 4, 8, 10, 12];
    const fontsize = radius * 0.2;
    ctx.font = fontsize + "px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    
    numbers.forEach(num => {
      const ang = num * Math.PI / 6;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.7);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    });
  }

  function drawBatons(ctx, radius, x, y, count, width, length) {
    const location = radius - length/2;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "black";
    
    for (let num = 1; num <= count; num++) {
      const ang = num * Math.PI / (count/2);
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
    const smallradius = radius * 0.3;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, smallradius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Center dot with blue accent
    ctx.beginPath();
    ctx.arc(x, y, smallradius * 0.04, 0, 2 * Math.PI);
    ctx.strokeStyle = "Blue";
    ctx.lineWidth = radius * 0.04;
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
    
    const hourAngle = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    const secondAngle = (second + millisecond / 1000) * Math.PI / 30;
    
    // Main hands (blue)
    drawHand(ctx, hourAngle, radius * 0.6, radius * 0.03, 0, 0, flatswordHand);
    drawHand(ctx, minuteAngle, radius * 0.95, radius * 0.03, 0, 0, flatswordHand);
    
    // Second hand in subdial
    drawHand(ctx, secondAngle, radius * 0.25, radius * 0.02, 0, radius * 0.5, grandeSeconde);
  }

  function drawHand(ctx, angle, length, width, x, y, handshape) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    handshape(ctx, angle, length, width);
    ctx.restore();
  }

  function flatswordHand(ctx, pos, length, width) {
    const length2 = length * 0.95;
    ctx.beginPath();
    ctx.rect(-width/2, 0, width, -length2);
    ctx.fillStyle = "Blue";
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-width/2, -length2);
    ctx.lineTo(0, -length);
    ctx.lineTo(width/2, -length2);
    ctx.closePath();
    ctx.fill();
  }

  function grandeSeconde(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.moveTo(0, -length);
    ctx.lineTo(width * 0.2, -length);
    ctx.lineTo(width/2, length/4);
    ctx.lineTo(-width/2, length/4);
    ctx.lineTo(-width * 0.2, -length);
    ctx.fillStyle = "blue";
    ctx.fill();
  }

  drawClock();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}