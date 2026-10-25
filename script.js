// =========================================================
// 1. SISTEMA DE PARTÍCULAS (LUZES DOURADAS, PÉTALAS E CORAÇÕES)
// =========================================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let burstParticlesList = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class AmbientParticle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
    this.size = Math.random() * 4 + 2;
    this.speedY = -(Math.random() * 0.45 + 0.15);
    this.speedX = (Math.random() - 0.5) * 0.35;
    this.opacity = Math.random() * 0.45 + 0.15;
    this.type = Math.random() > 0.35 ? 'gold' : 'heart';
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.015;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.2;
    this.angle += this.spin;

    if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;

    if (this.type === 'gold') {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
      grad.addColorStop(0, '#E5C17B');
      grad.addColorStop(1, 'rgba(229, 193, 123, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawMiniHeart(ctx, 0, 0, this.size * 2.2, '#D98B95');
    }

    ctx.restore();
  }
}

function drawMiniHeart(context, x, y, size, color) {
  context.fillStyle = color;
  context.beginPath();
  const topCurveHeight = size * 0.3;
  context.moveTo(x, y + topCurveHeight);
  context.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  context.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size);
  context.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  context.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  context.closePath();
  context.fill();
}

// Partículas de explosão comemorativa (quando acerta quiz, abre carta, etc.)
function spawnHeartBurst(x, y, count = 28) {
  const colors = ['#B86B77', '#E5C17B', '#D98B95', '#6B8E7B', '#C59B5F'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 5 + 2;
    burstParticlesList.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.8,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      gravity: 0.08,
      rotation: Math.random() * Math.PI
    });
  }
}

for (let i = 0; i < 38; i++) {
  particles.push(new AmbientParticle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  for (let i = burstParticlesList.length - 1; i >= 0; i--) {
    const b = burstParticlesList[i];
    b.x += b.vx;
    b.y += b.vy;
    b.vy += b.gravity;
    b.alpha -= 0.016;

    if (b.alpha <= 0) {
      burstParticlesList.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, b.alpha);
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    drawMiniHeart(ctx, 0, 0, b.size, b.color);
    ctx.restore();
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

// =========================================================
// 2. MÚSICA ("CHEIRO DE MAR - JOSÉ JR") & BOAS-VINDAS
// =========================================================
const audio = document.getElementById('bg-audio');
const welcomeOverlay = document.getElementById('welcome-overlay');
const startJourneyBtn = document.getElementById('start-journey-btn');
const heroPlayBtn = document.getElementById('hero-play-btn');
const floatingPlayBtn = document.getElementById('floating-play-btn');
const heroPlayIcon = document.getElementById('hero-play-icon');
const floatingPlayIcon = document.getElementById('floating-play-icon');
const floatingDisc = document.getElementById('floating-disc');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const lyricTicker = document.getElementById('lyric-ticker');
const toggleYtBtn = document.getElementById('toggle-yt-btn');
const ytEmbedBox = document.getElementById('yt-embed-box');
const ytIframe = document.getElementById('yt-iframe');

const PLAY_SVG = '<path d="M8 5v14l11-7z"/>';
const PAUSE_SVG = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

const lyricsLines = [
  '“O nosso amor tem cheiro de mar, tem tons de verde água sem fim...”',
  '“E com suas mãos segurando as minhas...”',
  '“E os nossos pés firmados sobre a Rocha, então prosseguiremos...”',
  '“Tem sossego, paz e a presença de Deus em cada detalhe nosso...”'
];
let lyricIndex = 0;

setInterval(() => {
  lyricIndex = (lyricIndex + 1) % lyricsLines.length;
  lyricTicker.style.opacity = '0';
  setTimeout(() => {
    lyricTicker.textContent = lyricsLines[lyricIndex];
    lyricTicker.style.opacity = '1';
  }, 350);
}, 5500);

function updateMusicUI(isPlaying) {
  heroPlayIcon.innerHTML = isPlaying ? PAUSE_SVG : PLAY_SVG;
  floatingPlayIcon.innerHTML = isPlaying ? PAUSE_SVG : PLAY_SVG;
  if (isPlaying) {
    floatingDisc.classList.add('playing');
  } else {
    floatingDisc.classList.remove('playing');
  }
}

function toggleMusic() {
  if (audio.paused) {
    audio.play().then(() => updateMusicUI(true)).catch(() => {});
  } else {
    audio.pause();
    updateMusicUI(false);
  }
}

startJourneyBtn.addEventListener('click', (e) => {
  welcomeOverlay.classList.add('hidden');
  document.body.classList.remove('locked');
  spawnHeartBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 32);

  audio.volume = 0.85;
  audio.play().then(() => {
    updateMusicUI(true);
  }).catch(() => {
    updateMusicUI(false);
  });
});

heroPlayBtn.addEventListener('click', toggleMusic);
floatingPlayBtn.addEventListener('click', toggleMusic);

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

audio.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatSeconds(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${pct}%`;
    currentTimeEl.textContent = formatSeconds(audio.currentTime);
    durationTimeEl.textContent = formatSeconds(audio.duration);
  }
});

progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  if (audio.duration) {
    audio.currentTime = (clickX / rect.width) * audio.duration;
  }
});

toggleYtBtn.addEventListener('click', () => {
  const isOpen = ytEmbedBox.classList.toggle('active');
  if (isOpen) {
    audio.pause();
    updateMusicUI(false);
    if (!ytIframe.src || ytIframe.src === window.location.href) {
      ytIframe.src = 'https://www.youtube.com/embed/OC1VhrzkxSM?rel=0';
    }
    toggleYtBtn.textContent = '✕ Fechar vídeo do YouTube e voltar ao áudio da página';
  } else {
    ytIframe.src = '';
    toggleYtBtn.textContent = '🎬 Ver vídeo completo com letra (YouTube)';
  }
});

// =========================================================
// 3. VERSÍCULO INTERATIVO (1 CORÍNTIOS 13:4-7)
// =========================================================
const highlights = document.querySelectorAll('.scripture-highlight');
const noteBox = document.getElementById('scripture-note-box');

highlights.forEach((item) => {
  item.addEventListener('click', (e) => {
    highlights.forEach((h) => h.classList.remove('active'));
    item.classList.add('active');
    const note = item.getAttribute('data-note');
    noteBox.innerHTML = `✨ <strong>No nosso amor:</strong> ${note}`;
    spawnHeartBurst(e.clientX, e.clientY, 14);
  });
});

// =========================================================
// 4. FOTOS (CORAÇÕES & LIGHTBOX EM TELA CHEIA)
// =========================================================
window.toggleHeart = function (btn) {
  btn.classList.toggle('liked');
  const span = btn.querySelector('span');
  const rect = btn.getBoundingClientRect();
  if (btn.classList.contains('liked')) {
    span.textContent = '❤️';
    spawnHeartBurst(rect.left + rect.width / 2, rect.top, 20);
  } else {
    span.textContent = '🤍';
  }
};

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.memory-photo-frame').forEach((frame) => {
  frame.addEventListener('click', () => {
    const src = frame.getAttribute('data-full');
    const caption = frame.getAttribute('data-caption');
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
  });
});

lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});

// =========================================================
// 5. MINI-QUIZ SOBRE A HISTÓRIA DO GABRIEL & ANA LUIZA
// =========================================================
const quizData = [
  {
    question: 'Onde nós nos vimos, nos conhecemos e você começou a orar por mim?',
    options: [
      'Na Festa da Colheita 🌾',
      'Em um acampamento de férias',
      'Na fila da cantina depois do culto'
    ],
    correct: 0,
    successMsg: 'Isso mesmo! Na Festa da Colheita! Foi ali que você se apaixonou por mim (não sei como kkkk) e começou a orar por mim ❤️'
  },
  {
    question: 'Qual foi a data exata em que eu abri o coração e me declarei pra você?',
    options: [
      '15/11/2025',
      '08/12/2025 💌',
      '25/12/2025'
    ],
    correct: 1,
    successMsg: '08/12/2025! Um dia inesquecível que mudou tudo entre nós dois!'
  },
  {
    question: 'Onde aconteceu o melhor abraço que a gente já teve?',
    options: [
      'Na saída da aula',
      'Na praça da cidade',
      'Na festa de confraternização da igreja 🤗'
    ],
    correct: 2,
    successMsg: 'Sim!! Aquele abraço na festa de confraternização da igreja foi simplesmente o melhor abraço do mundo!'
  },
  {
    question: 'Em qual momento especial nós ficamos de mãos dadas caminhando juntos?',
    options: [
      'Na Caminhada Pra Cristo 🤝',
      'No passeio do shopping',
      'Na gincana de jovens'
    ],
    correct: 0,
    successMsg: 'Na Caminhada Pra Cristo! De mãos dadas e com Jesus guiando os nossos passos ✨'
  },
  {
    question: 'E o que nós já ficamos fazendo uma madrugada inteira juntos?',
    options: [
      'Discutindo sobre qual filme assistir',
      'Chorando a madrugada toda com você (de amor!) 😭❤️',
      'Jogando videogame até amanhecer'
    ],
    correct: 1,
    successMsg: 'SIM! Chorando a madrugada toda de tanto amor! Agora o selo dourado da sua carta está destravado! 🔓✨'
  }
];

let currentQuizIndex = 0;
const quizProgressEl = document.getElementById('quiz-progress');
const quizQuestionNumEl = document.getElementById('quiz-question-num');
const quizQuestionTextEl = document.getElementById('quiz-question-text');
const quizOptionsEl = document.getElementById('quiz-options');
const quizFeedbackEl = document.getElementById('quiz-feedback');
const quizNextBtn = document.getElementById('quiz-next-btn');

function renderQuiz() {
  quizProgressEl.innerHTML = '';
  quizData.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'quiz-step-dot';
    if (idx < currentQuizIndex) dot.classList.add('done');
    if (idx === currentQuizIndex) dot.classList.add('active');
    quizProgressEl.appendChild(dot);
  });

  const item = quizData[currentQuizIndex];
  quizQuestionNumEl.textContent = `Pergunta ${currentQuizIndex + 1} de ${quizData.length}`;
  quizQuestionTextEl.textContent = item.question;
  quizOptionsEl.innerHTML = '';
  quizFeedbackEl.className = 'quiz-feedback';
  quizFeedbackEl.textContent = '';
  quizNextBtn.classList.remove('show');

  item.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.innerHTML = `<span>${optText}</span><span>○</span>`;
    btn.addEventListener('click', (e) => handleQuizAnswer(idx, btn, e));
    quizOptionsEl.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex, btnEl, event) {
  const item = quizData[currentQuizIndex];
  const allBtns = quizOptionsEl.querySelectorAll('.quiz-option-btn');

  if (selectedIndex === item.correct) {
    allBtns.forEach((b) => (b.disabled = true));
    btnEl.classList.add('correct');
    btnEl.querySelector('span:last-child').textContent = '✓';

    quizFeedbackEl.textContent = item.successMsg;
    quizFeedbackEl.className = 'quiz-feedback show success';
    spawnHeartBurst(event.clientX, event.clientY, 24);

    if (currentQuizIndex < quizData.length - 1) {
      quizNextBtn.textContent = 'Próxima Pergunta →';
      quizNextBtn.classList.add('show');
    } else {
      quizNextBtn.textContent = '✨ Ir para a Carta Desbloqueada ↓';
      quizNextBtn.classList.add('show');
      unlockEnvelopeBadge();
    }
  } else {
    btnEl.classList.add('wrong');
    btnEl.querySelector('span:last-child').textContent = '✕';
    quizFeedbackEl.textContent = 'Hmm, certeza mocinha? Tenta outra opção kkkk ❤️';
    quizFeedbackEl.className = 'quiz-feedback show retry';
    setTimeout(() => {
      btnEl.classList.remove('wrong');
      btnEl.querySelector('span:last-child').textContent = '○';
    }, 900);
  }
}

quizNextBtn.addEventListener('click', () => {
  if (currentQuizIndex < quizData.length - 1) {
    currentQuizIndex++;
    renderQuiz();
  } else {
    document.getElementById('carta-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => openEnvelope(), 700);
  }
});

renderQuiz();

// =========================================================
// 6. ABERTURA DO ENVELOPE SELADO & CELEBRAÇÃO FINAL
// =========================================================
const envelopeBox = document.getElementById('envelope-box');
const letterPaper = document.getElementById('letter-paper');
const envelopeStatusBanner = document.getElementById('envelope-status-banner');
const envelopeStatusText = document.getElementById('envelope-status-text');
const celebrateLoveBtn = document.getElementById('celebrate-love-btn');
const loveResponseMsg = document.getElementById('love-response-msg');

function unlockEnvelopeBadge() {
  envelopeStatusBanner.innerHTML = '<span>🔓</span> <span>Selo dourado desbloqueado! Toque no envelope abaixo para abrir</span>';
}

function openEnvelope(event) {
  if (envelopeBox.classList.contains('opened')) return;
  envelopeBox.classList.add('opened');
  envelopeStatusBanner.innerHTML = '<span>💌</span> <span>Carta aberta com todo o meu amor para você, Ana Luiza!</span>';

  const rect = envelopeBox.getBoundingClientRect();
  const cx = event ? event.clientX : rect.left + rect.width / 2;
  const cy = event ? event.clientY : rect.top + rect.height / 2;
  spawnHeartBurst(cx, cy, 45);

  setTimeout(() => {
    letterPaper.classList.add('visible');
    letterPaper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 650);
}

envelopeBox.addEventListener('click', (e) => openEnvelope(e));

celebrateLoveBtn.addEventListener('click', (e) => {
  loveResponseMsg.classList.add('show');
  celebrateLoveBtn.textContent = '❤️ Eu te amo pra sempre, Ana Luiza! ❤️';
  spawnHeartBurst(e.clientX, e.clientY, 55);
  setTimeout(() => {
    spawnHeartBurst(window.innerWidth * 0.25, window.innerHeight * 0.4, 35);
    spawnHeartBurst(window.innerWidth * 0.75, window.innerHeight * 0.4, 35);
  }, 300);
});
