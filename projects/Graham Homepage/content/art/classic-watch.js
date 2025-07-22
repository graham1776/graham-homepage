export const metadata = {
  title: "Classic Watch",
  description: "Traditional timepiece with multiple subdials and tachymeter"
};

export function render(canvas, ctx) {
  const radius = Math.min(canvas.width/2, canvas.height/2) * 0.6;
  ctx.translate(canvas.width/2, canvas.height/2);
  
  let animationId;
  
  function drawClock() {
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    
    drawFace(ctx, radius);
    drawNumbers(ctx, radius, 12, 0.15, "Helvetica", 0.75);
    drawNumbers(ctx, radius, 60, 0.05, "Helvetica", 0.65);
    drawLogo("Omega", "Times New Roman", 0.3);
    drawTime(ctx, radius);
    drawBatons(ctx, radius, 0, 0, 12, radius * 0.05, radius * 0.15);
    drawBatons(ctx, radius, 0, 0, 60, radius * 0.01, radius * 0.08);
    
    // Subdials
    drawSubdial(ctx, radius, -radius * 0.4, 0);
    drawBatons(ctx, radius * 0.2, -radius * 0.4, 0, 12, radius * 0.01, radius * 0.04);
    
    drawSubdial(ctx, radius, 0, radius * 0.4);
    drawBatons(ctx, radius * 0.2, 0, radius * 0.4, 12, radius * 0.01, radius * 0.04);
    
    drawSubdial(ctx, radius, radius * 0.4, 0);
    drawBatons(ctx, radius * 0.2, radius * 0.4, 0, 30, radius * 0.01, radius * 0.04);
    
    drawTachymeter(ctx, radius);
    
    animationId = requestAnimationFrame(drawClock);
  }

  function drawFace(ctx, radius) {
    const bezelwidth = radius * 1.2;
    const grd = ctx.createLinearGradient(-radius, radius, radius, radius);
    grd.addColorStop(0.000, 'rgba(150, 150, 150, 1.000)');
    grd.addColorStop(0.500, 'rgba(255, 255, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(153, 153, 153, 1.000)');

    // Bezel
    ctx.beginPath();
    ctx.arc(0, 0, bezelwidth, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = grd;
    ctx.stroke();

    // Dial
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = 'Black';
    ctx.fill();
  }

  function drawTachymeter(ctx, radius) {
    const numbers = [450,400,350,300,250,200,150,140,130,120,110,100,90,80,70,60,175,65,75,85,500,600];
    const fontsize = radius * 0.10;
    ctx.font = fontsize + "px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    
    numbers.forEach(num => {
      const ang = (3600/num) * Math.PI / 30;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -radius * 1.1);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    });
  }

  function drawNumbers(ctx, radius, count, fontsize, font, location) {
    ctx.font = radius * fontsize + "px " + font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    
    for (let num = 1; num <= count; num++) {
      const ang = num * Math.PI / (count/2);
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -radius * location);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    }
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
    const smallradius = radius * 0.2;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, smallradius, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, smallradius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
  }

  function drawLogo(text, font, location) {
    const yPos = -radius * location;
    ctx.font = radius * 0.15 + "px " + font;
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
    
    // Main hands (leaf style)
    drawHand(ctx, hourAngle, radius * 0.6, radius * 0.07, 0, 0, feuille);
    drawHand(ctx, minuteAngle, radius * 1, radius * 0.07, 0, 0, feuille);
    
    // Second hand in subdial
    drawHand(ctx, secondAngle, radius * 0.2, radius * 0.01, 0, radius * 0.4, grandeSeconde);
  }

  function drawHand(ctx, angle, length, width, x, y, handshape) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    handshape(ctx, angle, length, width);
    ctx.restore();
  }

  function grandeSeconde(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.moveTo(0, -length);
    ctx.lineTo(width * 0.2, -length);
    ctx.lineTo(width/2, length/4);
    ctx.lineTo(-width/2, length/4);
    ctx.lineTo(-width * 0.2, -length);
    ctx.fillStyle = "black";
    ctx.fill();
  }

  function feuille(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(width/2, -length/5, width/2, -length/3, 0, -length);
    ctx.bezierCurveTo(-width/2, -length/3, -width/2, -length/5, 0, 0);
    ctx.fillStyle = "black";
    ctx.fill();
  }

  drawClock();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}