export const metadata = {
  title: "Perspective Boxes",
  description: "2-point perspective drawing with original gradient style"
};

export function render(canvas, ctx) {
  // Parameters matching your original
  let eyelevel = 300;
  let eyedistance = 400;
  let eyex = 400;
  let iterations = 100;
  
  // Scale to canvas
  if (canvas.width !== 800 || canvas.height !== 600) {
    const scaleX = canvas.width / 800;
    const scaleY = canvas.height / 600;
    eyelevel *= scaleY;
    eyedistance *= scaleX;
    eyex *= scaleX;
  }
  
  // Create controls only in modal view
  const controls = createControls();
  
  function createControls() {
    // Check if we're in modal view
    let parent = canvas.parentElement;
    const isModal = parent && parent.classList.contains('art-modal-content');
    
    if (!isModal) {
      // In grid view, don't create controls
      return { panel: null, sliders: {} };
    }
    
    // Create control panel only for modal
    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 100;
    `;
    
    // Eye X slider
    const eyeXSlider = createSlider('Eye X', eyex, 0, canvas.width, (value) => {
      eyex = value;
      draw();
    });
    
    // Eye level slider  
    const eyeLevelSlider = createSlider('Eye Level', eyelevel, 0, canvas.height, (value) => {
      eyelevel = value;
      draw();
    });
    
    // Eye distance slider
    const eyeDistSlider = createSlider('Eye Distance', eyedistance, 100, 800, (value) => {
      eyedistance = value;
      draw();
    });
    
    // Iterations slider
    const iterSlider = createSlider('Boxes', iterations, 10, 200, (value) => {
      iterations = value;
      draw();
    });
    
    // Regenerate button
    const regenButton = document.createElement('button');
    regenButton.textContent = 'Regenerate';
    regenButton.style.cssText = `
      background: #333;
      color: white;
      border: 1px solid #666;
      padding: 5px 10px;
      margin-top: 10px;
      cursor: pointer;
      border-radius: 3px;
      width: 100%;
    `;
    regenButton.onclick = draw;
    
    controlPanel.appendChild(eyeXSlider.container);
    controlPanel.appendChild(eyeLevelSlider.container);
    controlPanel.appendChild(eyeDistSlider.container);
    controlPanel.appendChild(iterSlider.container);
    controlPanel.appendChild(regenButton);
    
    parent.appendChild(controlPanel);
    
    return {
      panel: controlPanel,
      sliders: { eyeXSlider, eyeLevelSlider, eyeDistSlider, iterSlider }
    };
  }
  
  function createSlider(label, initialValue, min, max, onChange) {
    const container = document.createElement('div');
    container.style.marginBottom = '8px';
    
    const labelEl = document.createElement('div');
    labelEl.textContent = `${label}: ${Math.round(initialValue)}`;
    labelEl.style.marginBottom = '3px';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = initialValue;
    slider.style.cssText = `
      width: 150px;
      background: #444;
    `;
    
    slider.oninput = () => {
      const value = parseFloat(slider.value);
      labelEl.textContent = `${label}: ${Math.round(value)}`;
      onChange(value);
    };
    
    container.appendChild(labelEl);
    container.appendChild(slider);
    
    return { container, slider, label: labelEl };
  }
  
  function draw() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate vanishing points (your original math)
    const alpha = 45 * Math.PI / 180;
    const beta = Math.PI / 2 - alpha;
    const vp1x = eyex - eyedistance * Math.tan(alpha);
    const vp2x = eyex + eyedistance * Math.tan(beta);
    
    // Create gradient (your original gradient)
    const grd = ctx.createLinearGradient(0, 0, vp2x, 0);
    grd.addColorStop(0, "white");
    grd.addColorStop(0.5, "black");
    grd.addColorStop(1, "white");
    ctx.fillStyle = grd;
    
    // Draw boxes (your original algorithm)
    for (let num = 1; num < iterations + 1; num++) {
      const pm = Math.random() < 0.5 ? -1 : 1;
      const middlex1 = vp2x * Math.random();
      const middley1 = eyelevel * Math.random() * pm + eyelevel;
      const middlelength = 20 * Math.random();
      const vp1length = 20 * Math.random();
      const vp2length = 30 * Math.random();
      
      const vp2slope1 = (eyelevel - middley1 - middlelength) / (vp2x - middlex1);
      const vp2slope2 = (eyelevel - middley1) / (vp2x - middlex1);
      const vp2b1 = (-vp2slope1 * middlex1 + middley1 + middlelength);
      const vp2b2 = (-vp2slope2 * middlex1 + middley1);
      
      const vp1slope1 = (eyelevel - middley1 - middlelength) / (vp1x - middlex1);
      const vp1slope2 = (eyelevel - middley1) / (vp1x - middlex1);
      const vp1b1 = (-vp1slope1 * middlex1 + middley1 + middlelength);
      const vp1b2 = (-vp1slope2 * middlex1 + middley1);

      // BOTTOM RIGHT SIDE OF BOX
      ctx.beginPath();
      ctx.moveTo(middlex1, middley1);
      ctx.lineTo(middlex1, middley1 + middlelength);
      ctx.lineTo(middlex1 + vp2length, vp2slope1 * (middlex1 + vp2length) + vp2b1);
      ctx.lineTo(middlex1 + vp2length, vp2slope2 * (middlex1 + vp2length) + vp2b2);
      ctx.closePath();
      ctx.fill();
      
      // BOTTOM LEFT SIDE OF BOX 
      ctx.beginPath();
      ctx.moveTo(middlex1, middley1);
      ctx.lineTo(middlex1, middley1 + middlelength);
      ctx.lineTo(middlex1 - vp1length, vp1slope1 * (middlex1 - vp1length) + vp1b1);
      ctx.lineTo(middlex1 - vp1length, vp1slope2 * (middlex1 - vp1length) + vp1b2);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Initial draw
  draw();
  
  // Cleanup function
  return () => {
    if (controls.panel && controls.panel.parentElement) {
      controls.panel.parentElement.removeChild(controls.panel);
    }
  };
}