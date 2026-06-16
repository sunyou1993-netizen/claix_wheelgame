// Sound synthesizer using Web Audio API (does not require external audio assets)
class SignageAudioEngine {
  constructor() {
    this.ctx = null;
    this.whirOsc = null;
    this.whirGain = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime); // Crisp click pitch
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  startWhir() {
    this.init();
    if (!this.ctx) return;
    this.stopWhir(); // safeguard reset

    this.whirOsc = this.ctx.createOscillator();
    this.whirGain = this.ctx.createGain();

    this.whirOsc.type = 'sine';
    this.whirOsc.frequency.setValueAtTime(140, this.ctx.currentTime); // dynamic low whir frequency

    this.whirGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.whirGain.gain.linearRampToValueAtTime(0.38, this.ctx.currentTime + 0.1); // significantly louder clean entry fade

    this.whirOsc.connect(this.whirGain);
    this.whirGain.connect(this.ctx.destination);

    this.whirOsc.start();
  }

  updateWhir(progress) {
    if (!this.whirOsc || !this.ctx) return;
    // Lower the pitch from 140Hz down to 50Hz as the wheel slows down
    const p = 140 - (progress * 90);
    this.whirOsc.frequency.setValueAtTime(p, this.ctx.currentTime);

    // Fade out volume slightly towards the end of the rotation
    const currentGain = 0.38 * Math.cos(progress * Math.PI / 2);
    if (this.whirGain) {
      this.whirGain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
    }
  }

  stopWhir() {
    if (this.whirOsc) {
      try {
        this.whirOsc.stop();
      } catch (e) {}
      this.whirOsc = null;
    }
    this.whirGain = null;
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0.0, this.ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + index * 0.12);
      osc.stop(this.ctx.currentTime + index * 0.12 + 0.4);
    });
  }

  playClick() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}

const audio = new SignageAudioEngine();

// Beautiful interactive high-performance Canvas Fireworks Engine
class FireworksCelebration {
  constructor(canvasId) {
    this.canvasIdx = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.fireworks = [];
    this.active = false;
    this.animationId = null;
    this.colors = [
      '#FF1F65', // Vivid Energetic Pink
      '#006CFF', // Bold Royal Blue
      '#13D475', // Vibrant Minty Green
      '#FFC107', // Luminous Gold Yellow
      '#A855F7', // Imperial Deep Purple
      '#FF5722', // High-Contrast Electric Orange
      '#00E5FF'  // Glowing Intense Cyan
    ];
  }

  init() {
    this.canvas = document.getElementById(this.canvasIdx);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Set layout resolution to exact 1000x1000 dimensions for behind-wheel sizing
    this.canvas.width = 1000;
    this.canvas.height = 1000;
  }

  start() {
    this.init();
    if (!this.canvas || !this.ctx) return;
    
    this.active = true;
    this.particles = [];
    this.fireworks = [];
    this.loop();
    
    // Launch initial beautiful explosions immediately
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.active) this.spawnFirework();
      }, i * 350);
    }
  }

  stop() {
    this.active = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  spawnFirework() {
    if (!this.active || !this.canvas) return;
    
    // Launch from near bottom of our 1000x1000 square to various areas behind the wheel
    const startX = 150 + Math.random() * (this.canvas.width - 300);
    const startY = 950;
    const targetX = startX + (Math.random() * 200 - 100);
    const targetY = 150 + Math.random() * 550;
    
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    this.fireworks.push({
      x: startX,
      y: startY,
      targetX: targetX,
      targetY: targetY,
      speed: 13 + Math.random() * 7,
      angle: Math.atan2(targetY - startY, targetX - startX),
      color: color,
      exploded: false
    });
  }

  explode(x, y, color) {
    const pCount = 55 + Math.floor(Math.random() * 30);
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 11;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // Slight upward boost
        color: color,
        alpha: 1,
        decay: 0.013 + Math.random() * 0.014,
        gravity: 0.14
      });
    }
    
    // Additional sparkles/star rings (golden/whites)
    if (Math.random() > 0.4) {
      for (let i = 0; i < 12; i++) {
        const ringAngle = (i / 12) * Math.PI * 2;
        const ringSpeed = 7;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ringAngle) * ringSpeed,
          vy: Math.sin(ringAngle) * ringSpeed,
          color: '#FFFFFF',
          alpha: 1,
          decay: 0.02,
          gravity: 0.08
        });
      }
    }
  }

  loop() {
    if (!this.active || !this.ctx || !this.canvas) return;

    this.animationId = requestAnimationFrame(() => this.loop());

    // Semi-transparent clears to create gorgeous trailing light effect fading to flat pastel blue background (#F4F8FF)
    this.ctx.fillStyle = 'rgba(244, 248, 255, 0.22)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & draw launching rockets
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const f = this.fireworks[i];
      const vx = Math.cos(f.angle) * f.speed;
      const vy = Math.sin(f.angle) * f.speed;

      f.x += vx;
      f.y += vy;

      // Draw trails
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = f.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = f.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset

      // Reached destination?
      const distToTarget = Math.sqrt(Math.pow(f.targetX - f.x, 2) + Math.pow(f.targetY - f.y, 2));
      if (distToTarget < 20 || f.y <= f.targetY || f.y < 120) {
        this.explode(f.x, f.y, f.color);
        this.fireworks.splice(i, 1);
      }
    }

    // Update & draw explosion sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3.5 + Math.random() * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      
      // Outer neon glowing aura
      this.ctx.shadowBlur = p.alpha * 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Dynamic random background spawn
    if (Math.random() < 0.04) {
      this.spawnFirework();
    }
  }
}

const fireworks = new FireworksCelebration('fireworks-canvas');

// Primary application state
const state = {
  participants: [
    "입력",
    "입력",
    "입력",
    "입력",
    "입력"
  ],
  isSpinning: false,
  currentRotationAngle: 0, // In radians
  winningIndex: null,
};

// Default preset pool of names for quick on-screen touch add
const QUICK_PRESETS = [
  "김하늘", "이서준", "박지우", "한민준", "정예린", "공동현", "오서연", "임건우",
  "서윤", "도윤", "하은", "지호", "서현", "예준", "수아", "지유", "준우"
];

// Easing function for smooth deceleration
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Draw the roulette wheel on <canvas>
function drawRoulette() {
  const canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const scaleFactor = width / 656; // Dynamic scale factor relative to design spec width
  const outerRadius = width / 2 - (52 * scaleFactor); // Reduced to support a thick white decorative border on the canvas itself
  
  ctx.clearRect(0, 0, width, height);

  const numSectors = state.participants.length;
  if (numSectors === 0) {
    // Empty state
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#E4E7EC';
    ctx.fill();
    ctx.fillStyle = '#667085';
    ctx.font = `bold ${Math.round(36 * scaleFactor)}px Pretendard`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('참여자를 추가해주세요', cx, cy);
    return;
  }

  const sectorAngle = (2 * Math.PI) / numSectors;

  // Save base context state and apply rotation for segments
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.currentRotationAngle);
  ctx.translate(-cx, -cy);

  for (let i = 0; i < numSectors; i++) {
    const startRad = i * sectorAngle;
    const endRad = startRad + sectorAngle;
    const isWinner = (!state.isSpinning && state.winningIndex !== null && i === state.winningIndex);

    // Draw wedge segment
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerRadius, startRad, endRad);
    ctx.closePath();

    if (isWinner) {
      // Sleek luminous light sky blue segment highlight for the winning section
      ctx.fillStyle = '#E0F2FE';
    } else {
      // Soft alternate elegant colors: soft lavender/white to pastel blue
      ctx.fillStyle = (i % 2 === 0) ? '#FFFFFF' : '#E3ECFC';
    }
    ctx.fill();

    // Clean segment divide border strokes
    ctx.lineWidth = isWinner ? (6 * scaleFactor) : (4 * scaleFactor);
    ctx.strokeStyle = isWinner ? '#006CFF' : '#FFFFFF';
    ctx.stroke();

    // Draw card-pill with name inside each sector
    ctx.save();
    ctx.translate(cx, cy);
    // Align block along the bisection angle of of the sector segment
    ctx.rotate(startRad + sectorAngle / 2);
    
    // Position of card-pill along the radius
    const cardX = 185 * scaleFactor; 
    const cardY = 0;   
    const cardW = (isWinner ? 122 : 100) * scaleFactor;
    const cardH = (isWinner ? 58 : 50) * scaleFactor;
    const cardR = (isWinner ? 16 : 14) * scaleFactor;

    // Translate to the cell center first, then cancel out the entire cumulative rotation to draw perfectly horizontal Name tags!
    ctx.translate(cardX, cardY);
    ctx.rotate(-(state.currentRotationAngle + startRad + sectorAngle / 2));

    if (editingParticipantIndex !== i) {
      if (isWinner) {
        // High-contrast vibrant blue shadow glow
        ctx.shadowColor = 'rgba(0, 108, 255, 0.45)';
        ctx.shadowBlur = 24 * scaleFactor;
        ctx.shadowOffsetY = 6 * scaleFactor;
      } else {
        // Soft subtle outer shadow for name pills
        ctx.shadowColor = 'rgba(0, 50, 150, 0.05)';
        ctx.shadowBlur = 8 * scaleFactor;
        ctx.shadowOffsetY = 3 * scaleFactor;
      }

      // Draw rounded rectangle container
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cardR);
      ctx.fillStyle = '#FFFFFF'; // Clean white background for both winner and normal to highlight the gorgeous blue border
      ctx.fill();

      // Disable shadow for text/borders next
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Clean border trim inside or around the card
      ctx.lineWidth = isWinner ? (5.5 * scaleFactor) : (2 * scaleFactor);
      ctx.strokeStyle = isWinner ? '#006CFF' : '#D9E6FF'; // Standout royal blue border for winner!
      ctx.stroke();

      // Draw participant text
      let displayName = state.participants[i] || '입력';
      if (displayName.length > 4 && displayName !== '입력') {
        displayName = displayName.substring(0, 3) + '..';
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const winFontSize = Math.round(24 * scaleFactor);
      const normFontSize = Math.round(20 * scaleFactor);
      ctx.font = isWinner ? `bold ${winFontSize}px Pretendard` : `700 ${normFontSize}px Pretendard`;
      ctx.fillStyle = isWinner ? '#006CFF' : (displayName === '입력' ? '#98A2B3' : '#344054'); // Standout blue font for winner!

      // Draw name centered inside card-pill
      ctx.fillText(displayName, 0, 0);
    }

    ctx.restore();
  }

  ctx.restore(); // Restore back to global static coordinates space for outer rim

  // 1. Draw the thick white outer rim (centered at radius width/2 - half rimWidth)
  const rimWidth = 52 * scaleFactor;
  ctx.beginPath();
  ctx.arc(cx, cy, width / 2 - (rimWidth / 2), 0, 2 * Math.PI);
  ctx.lineWidth = rimWidth;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // 2. A sleek separating separator stroke between the sectors and the white border
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI);
  ctx.lineWidth = 3 * scaleFactor;
  ctx.strokeStyle = '#D9E6FF'; // Subtle elegant border
  ctx.stroke();

  // 3. Draw 8 outer decorative studs along the rim (replicates design image)
  const studCount = 8;
  const studsRadius = width / 2 - (rimWidth / 2); // Centered exactly inside the thick white border
  for (let s = 0; s < studCount; s++) {
    const angle = (s * (2 * Math.PI) / studCount) + state.currentRotationAngle;
    const studX = cx + studsRadius * Math.cos(angle);
    const studY = cy + studsRadius * Math.sin(angle);

    // Outer beautiful pastel soft blue background circle for the stud
    ctx.beginPath();
    ctx.arc(studX, studY, 12 * scaleFactor, 0, 2 * Math.PI);
    ctx.fillStyle = '#E8F1FF';
    ctx.fill();

    ctx.lineWidth = 2 * scaleFactor;
    ctx.strokeStyle = '#CBDDFE';
    ctx.stroke();

    // Core classic blue stud
    ctx.beginPath();
    ctx.arc(studX, studY, 6.5 * scaleFactor, 0, 2 * Math.PI);
    ctx.fillStyle = '#1D75FF';
    ctx.fill();
  }
}

// Global click handler to capture click inside canvas for direct cell rename popup
let editingParticipantIndex = null;

function bindCanvasInteraction() {
  const canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;

  canvas.addEventListener('click', (e) => {
    if (state.isSpinning) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Central button is 110px radius (clickable center start)
    if (dist < 100) {
      spinWheel();
      return;
    }

    // Outer wheel area allows quick renaming of sectors
    const outerRadius = canvas.width / 2 - 40;
    if (dist >= 100 && dist <= outerRadius) {
      const numSectors = state.participants.length;
      if (numSectors === 0) return;

      // Determine clicked sector index
      let clickAngle = Math.atan2(dy, dx);
      let wheelRelativeAngle = clickAngle - state.currentRotationAngle;

      wheelRelativeAngle = wheelRelativeAngle % (2 * Math.PI);
      if (wheelRelativeAngle < 0) wheelRelativeAngle += 2 * Math.PI;

      const sectorAngle = (2 * Math.PI) / numSectors;
      const clickedIdx = Math.floor(wheelRelativeAngle / sectorAngle) % numSectors;

      openNameEditModal(clickedIdx);
    }
  });
}

function showToast(message) {
  // Remove any existing toast
  const existingToast = document.getElementById('aistudio-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'aistudio-toast';
  toast.className = 'toast-notification';
  
  const iconEl = document.createElement('span');
  iconEl.innerHTML = `⚠️`;
  iconEl.style.fontSize = '36px';
  toast.appendChild(iconEl);

  const textEl = document.createElement('span');
  textEl.innerText = message;
  toast.appendChild(textEl);

  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.appendChild(toast);
  } else {
    document.body.appendChild(toast);
  }

  // Force animate in next event loop
  setTimeout(() => {
    toast.classList.add('show');
  }, 30);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function openNameEditModal(idx, isError = false) {
  if (state.isSpinning) return;

  // Remove any active inline edit input first
  const existingInput = document.getElementById('inline-edit-input');
  if (existingInput) {
    existingInput.remove();
  }

  editingParticipantIndex = idx;
  const currentName = state.participants[idx];
  const displayName = (currentName === '입력') ? '' : currentName;

  // Get canvas context to calculate layout translation math
  const canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const numSectors = state.participants.length;
  const sectorAngle = (2 * Math.PI) / numSectors;
  const startRad = idx * sectorAngle;

  // Bisection center angle of the selected sector under the overall rotation
  const absAngle = state.currentRotationAngle + startRad + sectorAngle / 2;
  const scaleFactor = canvas.width / 656;
  const cardX = 185 * scaleFactor; // Distance matching card center on the canvas drawing code

  const pillX = cx + cardX * Math.cos(absAngle);
  const pillY = cy + cardX * Math.sin(absAngle);

  // Translate coordinates to percentage relative to canvas size for resolution-independent styling
  const pctX = (pillX / canvas.width) * 100;
  const pctY = (pillY / canvas.height) * 100;

  // Re-draw the wheel immediately so the canvas hides the text and original card for this sector
  drawRoulette();

  // Create inline input element on the fly
  const inputEl = document.createElement('input');
  inputEl.id = 'inline-edit-input';
  inputEl.type = 'text';
  inputEl.value = displayName;
  inputEl.maxLength = 10;
  inputEl.placeholder = '입력';

  const isWinner = (!state.isSpinning && state.winningIndex !== null && idx === state.winningIndex);
  const cardW = (isWinner ? 122 : 100) * scaleFactor;
  const cardH = (isWinner ? 58 : 50) * scaleFactor;
  const cardR = (isWinner ? 16 : 14) * scaleFactor;

  // Apply rich modern styles that match the wheel's design
  inputEl.style.position = 'absolute';
  inputEl.style.width = `${Math.round(cardW)}px`;
  inputEl.style.height = `${Math.round(cardH)}px`;
  inputEl.style.left = `${pctX}%`;
  inputEl.style.top = `${pctY}%`;
  inputEl.style.transform = 'translate(-50%, -50%)';
  inputEl.style.borderRadius = `${Math.round(cardR)}px`;
  if (isError) {
    inputEl.className = 'inline-edit-input-error';
    inputEl.style.border = `${Math.round(3 * scaleFactor)}px solid #EF4444`;
  } else if (isWinner) {
    inputEl.className = 'winner-input-interaction';
    inputEl.style.border = `${Math.round(3 * scaleFactor)}px solid #006CFF`;
  } else {
    inputEl.style.border = `${Math.round(3 * scaleFactor)}px solid #006CFF`;
  }
  inputEl.style.backgroundColor = '#FFFFFF';
  inputEl.style.fontFamily = 'Pretendard, sans-serif';
  inputEl.style.fontSize = `${Math.round((isWinner ? 24 : 20) * scaleFactor)}px`;
  inputEl.style.fontWeight = '700';
  inputEl.style.color = '#101828';
  inputEl.style.textAlign = 'center';
  inputEl.style.outline = 'none';
  inputEl.style.zIndex = '500';
  inputEl.style.boxShadow = isError ? '0 12px 28px rgba(239, 68, 68, 0.4)' : '0 12px 28px rgba(0, 108, 255, 0.28)';
  inputEl.style.transition = 'all 0.15s ease';

  // Append input into viewport container
  const viewport = document.querySelector('.roulette-viewport');
  if (viewport) {
    viewport.appendChild(inputEl);
  }

  // Trigger focus and auto-select text
  inputEl.focus();
  inputEl.select();

  // Save changes callback
  let isSaved = false;
  const saveChanges = () => {
    if (isSaved) return;
    isSaved = true;
    const finalVal = inputEl.value.trim() || '입력';
    state.participants[idx] = finalVal;
    editingParticipantIndex = null;
    audio.playClick();
    inputEl.remove();
    syncParticipantsHTML();
    drawRoulette();
  };

  // Bind key actions and blur
  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      isSaved = true; // prevent save on subsequent blur
      editingParticipantIndex = null;
      inputEl.remove();
      drawRoulette();
    }
  };

  inputEl.onblur = () => {
    saveChanges();
  };
}

// Kept stub for clean initialization compatibility without warnings
function setupEditModalListeners() {}

// Physics-safe spin animation loop with exact boundary sound ticking
let activeSpinId = null;

function spinWheel() {
  if (state.isSpinning || state.participants.length === 0) return;

  // Active inline input dismissal
  const activeInput = document.getElementById('inline-edit-input');
  if (activeInput) {
    activeInput.remove();
  }

  // Check if there is any participant whose name is empty or literally '입력'
  const firstEmptyIdx = state.participants.findIndex(name => !name || name.trim() === '' || name.trim() === '입력');
  if (firstEmptyIdx !== -1) {
    showToast("참여자 이름을 모두 입력해 주세요!");
    openNameEditModal(firstEmptyIdx, true); // Open in error mode!
    return;
  }

  // Dismiss inline banner and stop old fireworks
  const winnerBanner = document.getElementById('winner-banner-wrapper');
  if (winnerBanner) {
    winnerBanner.classList.add('hidden');
  }
  const statusSubtitle = document.getElementById('wheel-status-subtitle');
  if (statusSubtitle) {
    statusSubtitle.innerHTML = "돌림판이 돌아가고 있습니다... 💫";
  }
  fireworks.stop();

  audio.init();
  audio.startWhir(); // Start the elegant rotation sound whirr
  state.isSpinning = true;
  document.getElementById('spin-button').disabled = true;

  const spinBtnText = document.querySelector('#spin-button .start-btn-text');
  if (spinBtnText) {
    spinBtnText.textContent = "진행중";
  }

  const duration = 5000; // 5 seconds spin
  const startTime = performance.now();
  const startAngle = state.currentRotationAngle;

  // Rotation properties
  const numSectors = state.participants.length;
  const sectorAngle = (2 * Math.PI) / numSectors;

  // Calculate destination:
  // Random winner between 0 and N-1
  const targetWinnerIndex = Math.floor(Math.random() * numSectors);
  state.winningIndex = targetWinnerIndex;

  // Top pointer indicator pin is at -90 degrees (-PI/2) in normal unit circle terms.
  // Wheel rotates in a clockwise direction.
  // For section `i` to stop under pointer at -Math.PI/2:
  // (RotationAngle + SectionCenterOffset) % 2PI = -Math.PI/2
  // => RotationAngle = -Math.PI/2 - (targetWinnerIndex * sectorAngle + sectorAngle / 2)
  const targetSectorAngle = -Math.PI / 2 - (targetWinnerIndex * sectorAngle + sectorAngle / 2);

  // We want the wheel to spin at least 5-8 full rounds for extreme suspense!
  const spinRounds = 6 + Math.floor(Math.random() * 3);
  const targetAngle = targetSectorAngle - (spinRounds * 2 * Math.PI);

  let lastTickIndex = -1;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    // Update global state position
    state.currentRotationAngle = startAngle + (targetAngle - startAngle) * easedProgress;

    // Tick audio sound trigger
    // Calculate current sector passing under the top indicator pointer (-Math.PI/2)
    // Absolute angle calculation
    const normalizedAngle = (-state.currentRotationAngle - Math.PI / 2) % (2 * Math.PI);
    const positiveAngle = normalizedAngle < 0 ? normalizedAngle + 2 * Math.PI : normalizedAngle;
    const currentTickSection = Math.floor(positiveAngle / sectorAngle) % numSectors;

    if (currentTickSection !== lastTickIndex) {
      audio.playTick();
      lastTickIndex = currentTickSection;
    }

    // Dynamic rotation sound frequency update
    audio.updateWhir(progress);

    drawRoulette();

    if (progress < 1) {
      activeSpinId = requestAnimationFrame(animate);
    } else {
      // Completed!
      state.isSpinning = false;
      document.getElementById('spin-button').disabled = false;
      
      const spinBtnText = document.querySelector('#spin-button .start-btn-text');
      if (spinBtnText) {
        spinBtnText.textContent = "다시하기";
      }

      audio.stopWhir(); // Terminate the rotating sound cleanly
      audio.playSuccess();
      showWinnerModal();
    }
  }

  activeSpinId = requestAnimationFrame(animate);
}

// Modals management
function showWinnerModal() {
  const winnerName = state.participants[state.winningIndex];
  
  // Update name inside our inline banner
  const nameEl = document.getElementById('inline-winner-name');
  if (nameEl) {
    nameEl.innerText = winnerName;
  }

  // Unhide the inline banner wrapper with transition
  const bannerEl = document.getElementById('winner-banner-wrapper');
  if (bannerEl) {
    bannerEl.classList.remove('hidden');
  }

  // Set friendly signage hint description
  const statusSubtitle = document.getElementById('wheel-status-subtitle');
  if (statusSubtitle) {
    statusSubtitle.innerHTML = "다시하기 버튼을 누르면 또 한번의 기회가!";
  }

  // Launch celebratory background fireworks
  fireworks.start();
}

function openOverlay(id) {
  audio.playClick();
  document.getElementById(id).classList.add('active');
}

function closeOverlay(id) {
  audio.playClick();
  document.getElementById(id).classList.remove('active');
}

// Sync the local participant names to view & list chips
function syncParticipantsHTML() {
  const countDisplay = document.getElementById('participant-count-value');
  if (countDisplay) {
    countDisplay.innerText = state.participants.length;
  }

  // Clear winning index since participants updated
  state.winningIndex = null;

  const statusSubtitle = document.getElementById('wheel-status-subtitle');
  if (statusSubtitle) {
    statusSubtitle.innerHTML = "이름표를 눌러 입력한 후<br />시작하기 버튼을 누르세요!";
  }

  const spinBtnText = document.querySelector('#spin-button .start-btn-text');
  if (spinBtnText) {
    spinBtnText.textContent = "시작하기";
  }

  const flowContainer = document.getElementById('current-names-flow');
  if (!flowContainer) return;

  flowContainer.innerHTML = '';

  state.participants.forEach((name, idx) => {
    const chip = document.createElement('div');
    chip.className = 'name-chip';
    chip.innerHTML = `
      <span>${name}</span>
      <div class="name-chip-remove" onclick="removeParticipant(${idx})">×</div>
    `;
    flowContainer.appendChild(chip);
  });

  // Re-draw wheel
  drawRoulette();
}

// Add a participant name
window.addParticipant = function(customNameInput = null) {
  const input = customNameInput || document.getElementById('new-name-input');
  if (!input) return;

  const value = input.value.trim();
  if (value) {
    if (state.participants.length >= 20) {
      alert("최대 20명까지만 추가할 수 있습니다.");
      return;
    }
    audio.playClick();
    state.participants.push(value);
    input.value = '';
    syncParticipantsHTML();
    input.focus();
  }
};

// Remove a participant index
window.removeParticipant = function(idx) {
  audio.playClick();
  state.participants.splice(idx, 1);
  syncParticipantsHTML();
};

// Quick presets add helper helper
function loadPresetNames() {
  const container = document.getElementById('quick-presets-row');
  if (!container) return;

  container.innerHTML = '';
  // Show a subset of 10 random pre-configured presets to avoid cluttering but give nice visual options
  const shuffled = QUICK_PRESETS.sort(() => 0.5 - Math.random()).slice(0, 8);
  
  shuffled.forEach(name => {
    const pill = document.createElement('div');
    pill.className = 'preset-pill';
    pill.innerText = `+ ${name}`;
    pill.onclick = () => {
      if (state.participants.length >= 20) {
        alert("최대 20명까지만 추가할 수 있습니다.");
        return;
      }
      audio.playClick();
      // Only append if not already existing, or allow anyway
      state.participants.push(name);
      syncParticipantsHTML();
    };
    container.appendChild(pill);
  });
}

// Handle automatic high-fidelity resizing of 1080x1920 viewport to fit the browser frame
function resizeSignage() {
  const container = document.getElementById('app-container');
  if (!container) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Fit to screen width perfectly to fill horizontal area completely
  const scale = viewportWidth / 1080;

  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'center center';

  // Support beautiful centered page flow with parents in viewport-wrapper
  const wrapper = document.getElementById('viewport-wrapper');
  if (wrapper) {
    wrapper.style.height = '100vh';
    wrapper.style.width = '100vw';
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // Initial draw and config
  drawRoulette();
  syncParticipantsHTML();
  loadPresetNames();

  // Resize signage initially and on window resize
  resizeSignage();
  window.addEventListener('resize', resizeSignage);

  // Setup interactive canvas elements click & modal hooks
  bindCanvasInteraction();
  setupEditModalListeners();

  // Bind decrement/increment buttons on participant count control card
  const decBtn = document.getElementById('participant-decrement-btn');
  const incBtn = document.getElementById('participant-increment-btn');

  if (decBtn) {
    decBtn.onclick = () => {
      if (state.isSpinning) return;
      if (state.participants.length > 2) {
        audio.playClick();
        state.participants.pop();
        syncParticipantsHTML();
      } else {
        alert("최소 2명의 참여자가 필요합니다.");
      }
    };
  }

  if (incBtn) {
    incBtn.onclick = () => {
      if (state.isSpinning) return;
      if (state.participants.length < 20) {
        audio.playClick();
        state.participants.push("입력");
        syncParticipantsHTML();
      } else {
        alert("최대 20명까지만 설정할 수 있습니다.");
      }
    };
  }

  // Bind close button helper on inline winner celebration banner
  const closeBannerBtn = document.getElementById('close-banner-btn');
  if (closeBannerBtn) {
    closeBannerBtn.onclick = () => {
      audio.playClick();
      const bannerEl = document.getElementById('winner-banner-wrapper');
      if (bannerEl) {
        bannerEl.classList.add('hidden');
      }
      const statusSubtitle = document.getElementById('wheel-status-subtitle');
      if (statusSubtitle) {
        statusSubtitle.innerHTML = "시작하기 버튼이나 이름표를 눌러<br />변경하고 돌려보세요!";
      }
      fireworks.stop();
    };
  }

  // Setup main layout button triggers
  const spinBtn = document.getElementById('spin-button');
  if (spinBtn) {
    spinBtn.onclick = () => {
      spinWheel();
    };
  }

  const resetBtn = document.getElementById('reset-button');
  if (resetBtn) {
    resetBtn.onclick = () => {
      audio.playClick();
      // Soft reset current wheel location
      state.currentRotationAngle = 0;
      state.winningIndex = null;
      drawRoulette();
    };
  }

  // Participant edit popup helpers (safely guarded since buttons are removed in signage simplified layout)
  const manageBtn = document.getElementById('manage-button');
  if (manageBtn) {
    manageBtn.onclick = () => {
      openOverlay('participants-overlay');
    };
  }
  const optionBtn = document.getElementById('option-button');
  if (optionBtn) {
    optionBtn.onclick = () => {
      openOverlay('participants-overlay');
    };
  }

  // Keyboard add click listener
  const newNameInput = document.getElementById('new-name-input');
  if (newNameInput) {
    newNameInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        window.addParticipant();
      }
    };
  }

  // Close back triggers
  const backHomeTrigger = document.getElementById('back-home-trigger');
  if (backHomeTrigger) {
    backHomeTrigger.onclick = () => {
      audio.playClick();
      window.location.href = 'https://claix-toolkit-xzrp.vercel.app/';
    };
  }

  const closeAppTrigger = document.getElementById('close-app-trigger');
  if (closeAppTrigger) {
    closeAppTrigger.onclick = () => {
      audio.playClick();
      window.location.href = 'https://claix-toolkit-xzrp.vercel.app/';
    };
  }
});
