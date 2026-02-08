(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width; const H = canvas.height;

  const groundY = H - 40;
  const trex = { x: 50, w: 40, h: 50, y: groundY - 50, vy: 0, onGround: true };
  const gravity = 0.6;

  let obstacles = [];
  let frame = 0;
  let speed = 5;
  let score = 0;
  let running = true;

  function reset(){
    obstacles = [];
    frame = 0; speed = 6; score = 0; running = true;
    trex.y = groundY - trex.h; trex.vy = 0; trex.onGround = true;
  }

  function spawn(){
    const h = Math.random() > 0.5 ? 30 : 50;
    const w = Math.random() > 0.5 ? 15 : 25;
    obstacles.push({ x: W + 20, w, h, y: groundY - h });
  }

  function update(){
    if(!running) return;
    frame++;
    if(frame % 100 === 0) spawn();
    if(frame % 4 === 0) score++;
    if(score % 250 === 0) speed += 0.4;

    // T-Rex physics
    trex.vy += gravity;
    trex.y += trex.vy;
    if(trex.y >= groundY - trex.h){ trex.y = groundY - trex.h; trex.vy = 0; trex.onGround = true; }

    // Obstacles
    for(let i = obstacles.length-1; i >= 0; i--){
      const o = obstacles[i];
      o.x -= speed;
      if(o.x + o.w < 0) obstacles.splice(i,1);
      // collision
      if(o.x < trex.x + trex.w && o.x + o.w > trex.x && o.y < trex.y + trex.h && o.y + o.h > trex.y){
        running = false;
      }
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    
    // Retro pixel background
    ctx.fillStyle = '#d6b99d';
    ctx.fillRect(0, 0, W, H);
    
    // grid pattern (optional retro)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    ctx.lineWidth = 1;
    for(let i = 0; i < W; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    
    // ground
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, groundY, W, H-groundY);
    
    // ground outline
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, groundY, W, H-groundY);

    // T-Rex
    drawRetroTRex(trex);

    // obstacles (pixel style)
    ctx.fillStyle = '#292727';
    ctx.strokeStyle = '#81807e';
    ctx.lineWidth = 2;
    obstacles.forEach(o => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });

    // score with retro styling
    ctx.fillStyle = '#f4f3f0';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SCORE: ' + score.toString().padStart(6, '0'), 600, 35);
    
    // speed indicator
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SPD: ' + speed.toFixed(1) + 'x', 600, 60);

    if(!running){
      // Game over overlay
      ctx.fillStyle = 'rgba(45, 31, 18, 0.9)';
      ctx.fillRect(0,0,W,H);
      
      ctx.fillStyle = '#d43737';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W/2, H/2 - 40);
      
      ctx.font = '20px monospace';
      ctx.fillText('FINAL SCORE: ' + score, W/2, H/2 + 10);
      
      ctx.font = '20px monospace';
      ctx.fillText('PRESS SPACE TO RESTART', W/2, H/2 + 50);
      
      ctx.textAlign = 'left';
    }
  }
  
  function drawRetroTRex(t) {
    ctx.fillStyle = '#35aa3b';
    ctx.strokeStyle = '#295327';
    ctx.lineWidth = 2;
    
    // Draw pixel art dinosaur (simple blocky style)
    // Body
    ctx.fillRect(t.x, t.y + 10, 30, 28);
    ctx.strokeRect(t.x, t.y + 10, 30, 28);
    
    // Head
    ctx.fillRect(t.x + 26, t.y - 8, 18, 18);
    ctx.strokeRect(t.x + 26, t.y - 8, 18, 18);
    
    // Snout
    ctx.fillRect(t.x + 42, t.y, 10, 10);
    ctx.strokeRect(t.x + 42, t.y, 10, 10);
    
    // Front leg
    ctx.fillRect(t.x + 8, t.y + 38, 6, 12);
    ctx.strokeRect(t.x + 8, t.y + 38, 6, 12);
    
    // Back leg
    ctx.fillRect(t.x + 24, t.y + 38, 6, 12);
    ctx.strokeRect(t.x + 24, t.y + 38, 6, 12);
    
    // Tail
    ctx.fillRect(t.x - 10, t.y + 15, 10, 8);
    ctx.strokeRect(t.x - 10, t.y + 15, 10, 8);
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(t.x + 36, t.y - 4, 4, 4);
    ctx.strokeStyle = '#d43737';
    ctx.strokeRect(t.x + 36, t.y - 4, 4, 4);
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  function jump(){ if(!running){ reset(); return; } if(trex.onGround){ trex.vy = -13; trex.onGround = false; } }

  function roundRect(ctx, x, y, w, h, r, fill, stroke){
    if (typeof stroke === 'undefined') stroke = true;
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    if(fill) ctx.fill(); if(stroke) ctx.stroke();
  }

  // input
  window.addEventListener('keydown', e => { if(e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } });
  window.addEventListener('mousedown', () => { jump(); });
  window.addEventListener('touchstart', () => { jump(); });

  // start
  reset(); loop();
})();
