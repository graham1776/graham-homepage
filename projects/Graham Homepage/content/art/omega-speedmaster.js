export const metadata = {
  title: "Omega Speedmaster",
  description: "Professional chronograph with tachymeter and subdials"
};

export function render(canvas, ctx) {
  const radius = Math.min(canvas.width/2, canvas.height/2) * 0.6;
  ctx.translate(canvas.width/2, canvas.height/2);
  
  let animationId;
  
  function drawClock() {
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    
    drawFace(ctx, radius);
    drawLogo("Ω", "Helvetica", 0.7, 0.20);
    drawLogo("Omega", "Helvetica", 0.55, 0.15);
    drawLogo("Speedmaster", "Times New Roman", 0.45, 0.10);
    drawLogo("Professional", "Helvetica", 0.35, 0.10);
    
    drawTime(ctx, radius);
    drawBatons(ctx, radius, 0, 0, 12, radius*0.04, radius*0.20);
    drawBatons(ctx, radius, 0, 0, 60, radius*0.01, radius*0.15);
    drawBatons(ctx, radius, 0, 0, 300, radius*0.005, radius*0.04);

    // Subdials
    drawSubdial(ctx, radius*0.3, -radius*0.5, 0);
    drawBatons(ctx, radius*0.3, -radius*0.5, 0, 12, radius*.01, radius*.06);
    
    drawSubdial(ctx, radius*0.3, 0, radius*0.5);
    drawBatons(ctx, radius*0.3, 0, radius*0.5, 12, radius*.01, radius*.06);
    
    drawSubdial(ctx, radius*0.3, radius*0.5, 0);
    drawBatons(ctx, radius*0.3, radius*0.5, 0, 30, radius*.01, radius*.06);
    
    // Tachymeter and numbers
    const tachyNumbers = [450,400,350,300,250,200,150,140,130,120,110,100,90,80,70,60,175,65,75,85,500,600];
    drawTachymeter(ctx, radius, 0, 0, radius*1.1, tachyNumbers, 3600, 60);
    
    drawCustomNumbers(ctx, radius, -radius*0.5, 0, radius*0.2, [60,20,40], 60);
    drawCustomNumbers(ctx, radius, 0, radius*0.5, radius*0.2, [3,6,9,12], 12);
    drawCustomNumbers(ctx, radius, radius*0.5, 0, radius*0.2, [10,20,30], 30);
    
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
    ctx.fillStyle = 'Black';
    ctx.strokeStyle = "White";
    ctx.stroke();
    ctx.fill();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = 'White';
    ctx.fill();
  }

  function drawTachymeter(ctx, radius, x, y, smallradius, numbers, divisor, lastnumouter) {
    const fontsize = radius * 0.10;
    ctx.font = fontsize + "px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    
    numbers.forEach(num => {
      const ang = (divisor/num) * Math.PI / (lastnumouter/2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.translate(0, -smallradius);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    });
  }

  function drawCustomNumbers(ctx, radius, x, y, smallradius, numbers, lastnumouter) {
    const fontsize = radius * 0.10;
    ctx.font = fontsize + "px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    
    numbers.forEach(num => {
      const ang = num * Math.PI / (lastnumouter/2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.translate(0, -smallradius);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    });
  }

  function drawBatons(ctx, radius, x, y, count, width, length) {
    const location = radius - length/2;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "white";
    
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
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
  }

  function drawLogo(text, font, location, px) {
    const yPos = -radius * location;
    ctx.font = radius * px + "px " + font;
    ctx.fillStyle = "white";
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
    const chronoAngle = (second % 30) * Math.PI / 15; // Simulated chronograph
    
    // Main hands
    drawHand(ctx, hourAngle, radius * 0.65, radius * 0.04, 0, 0, flatswordHand);
    drawHand(ctx, minuteAngle, radius * 1, radius * 0.04, 0, 0, flatswordHand);
    drawHand(ctx, chronoAngle, radius * 1, radius * 0.04, 0, 0, diamondHand);
    
    // Subdial hands
    drawHand(ctx, 0, radius * 0.3, radius * 0.02, 0, radius * 0.5, flatswordHand);
    drawHand(ctx, 0, radius * 0.3, radius * 0.02, radius * 0.5, 0, flatswordHand);
    drawHand(ctx, secondAngle, radius * 0.3, radius * 0.02, -radius * 0.5, 0, flatswordHand);
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
    ctx.fillStyle = "White";
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-width/2, -length2);
    ctx.lineTo(0, -length);
    ctx.lineTo(width/2, -length2);
    ctx.closePath();
    ctx.fill();
  }

  function diamondHand(ctx, pos, length, width) {
    const dx = 0.13;
    const diamondy1 = 0.65;
    const diamondy2 = 0.7;
    const diamondy3 = 0.83;
    
    ctx.beginPath();
    ctx.moveTo(0, -length);
    ctx.lineTo(width * 0.2, -length);
    ctx.lineTo(width/2, length/4);
    ctx.lineTo(-width/2, length/4);
    ctx.lineTo(-width * 0.2, -length);
    ctx.fillStyle = "Orange";
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, -length * diamondy1);
    ctx.lineTo(width * 10 * dx, -length * diamondy2);
    ctx.lineTo(0, -length * diamondy3);
    ctx.lineTo(-width * 10 * dx, -length * diamondy2);
    ctx.closePath();
    ctx.fill();
  }

  drawClock();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}