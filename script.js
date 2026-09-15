'use strict';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('.motion-toggle');
let storedMotion = false;
try { storedMotion = localStorage.getItem('barlas-motion-off') === 'true'; } catch {}
let motionOff = storedMotion || reduceMotion.matches;

function setMotion() {
  root.classList.toggle('motion-off', motionOff);
  motionToggle.setAttribute('aria-pressed', String(motionOff));
  motionToggle.setAttribute('aria-label', motionOff ? 'Animasyonları aç' : 'Animasyonları durdur');
  motionToggle.querySelector('.motion-label').textContent = motionOff ? 'Hareket kapalı' : 'Hareket açık';
  motionToggle.querySelector('.motion-icon').textContent = motionOff ? '▶' : 'Ⅱ';
}
setMotion();
motionToggle.addEventListener('click', () => {
  // The operating system's accessibility preference always takes precedence.
  if (reduceMotion.matches) return;
  motionOff = !motionOff;
  try { localStorage.setItem('barlas-motion-off', String(motionOff)); } catch {}
  setMotion();
});
function syncSystemMotion() {
  if (reduceMotion.matches) motionOff = true;
  motionToggle.disabled = reduceMotion.matches;
  motionToggle.title = reduceMotion.matches ? 'Cihazınızın azaltılmış hareket tercihi etkin.' : '';
  setMotion();
}
reduceMotion.addEventListener('change', syncSystemMotion);
syncSystemMotion();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  root.classList.add('reveal-ready');
}

const progress = document.querySelector('.scroll-progress');
let scrollQueued = false;
function updateProgress() {
  const height = root.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
window.addEventListener('load', updateProgress);
updateProgress();

const trailerDialog = document.getElementById('trailer-dialog');
const galleryDialog = document.getElementById('gallery-dialog');
const video = trailerDialog.querySelector('video');
const soundToggle = document.getElementById('sound-toggle');
const volumeControl = document.getElementById('video-volume');
const playbackMessage = document.getElementById('playback-message');
let lastAudibleVolume = 1;
function syncSoundControls() {
  const silent = video.muted || video.volume === 0;
  soundToggle.textContent = silent ? 'Sesi aç' : 'Sesi kapat';
  soundToggle.setAttribute('aria-pressed', String(silent));
  volumeControl.value = String(Math.round(video.volume * 100));
  volumeControl.setAttribute('aria-valuetext', silent ? 'Ses kapalı' : `%${Math.round(video.volume * 100)}`);
  if (video.volume > 0) lastAudibleVolume = video.volume;
}
soundToggle.addEventListener('click', () => {
  if (video.muted || video.volume === 0) {
    video.muted = false;
    video.volume = lastAudibleVolume || 1;
  } else {
    video.muted = true;
  }
  syncSoundControls();
});
volumeControl.addEventListener('input', () => {
  video.volume = Number(volumeControl.value) / 100;
  video.muted = video.volume === 0;
  syncSoundControls();
});
video.addEventListener('volumechange', syncSoundControls);
video.addEventListener('playing', () => { playbackMessage.hidden = true; });
syncSoundControls();
let dialogTrigger = null;
function openDialog(dialog, trigger) {
  dialogTrigger = trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelector('[data-trailer]').addEventListener('click', event => {
  openDialog(trailerDialog, event.currentTarget);
  // Start with audible sound within the user's explicit play gesture.
  video.defaultMuted = false;
  video.muted = false;
  if (video.volume === 0) video.volume = lastAudibleVolume || 1;
  syncSoundControls();
  playbackMessage.hidden = true;
  video.play().catch(() => {
    if (trailerDialog.open && video.paused) playbackMessage.hidden = false;
  });
});
video.addEventListener('error', () => { document.querySelector('.video-error').hidden = false; });
const videoSources = [...video.querySelectorAll('source')];
const failedVideoSources = new Set();
videoSources.forEach(source => source.addEventListener('error', () => {
  failedVideoSources.add(source);
  // One failed format is not a fatal error while another can still play.
  if (failedVideoSources.size === videoSources.length) document.querySelector('.video-error').hidden = false;
}));
video.addEventListener('loadedmetadata', () => {
  document.querySelector('.video-error').hidden = true;
  document.getElementById('video-direct-link').href = video.currentSrc;
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog === trailerDialog) video.pause();
    document.body.classList.remove('modal-open');
    dialogTrigger?.focus({ preventScroll: true });
  });
});

const images = [
  { src: 'assets/maze-steam-1.jpg', title: 'Maze of Mask / Labirent', alt: 'Işıklarla aydınlatılan kıvrımlı su altı tüneli' },
  { src: 'assets/maze-steam-2.jpg', title: 'Maze of Mask / Keşif', alt: 'Labirentin girişindeki maskeli kaşif' },
  { src: 'assets/maze-steam-3.jpg', title: 'Maze of Mask / Maske', alt: 'Mağarada maske takan oyun karakteri' },
  { src: 'assets/maze-steam-0.jpg', title: 'Maze of Mask / Derinlikler', alt: 'Altın renkli ışıklarla aydınlanan su altı labirenti' },
  { src: 'assets/maze-steam-4.jpg', title: 'Maze of Mask / Ada', alt: 'Gün batımında palmiyelerle çevrili ada' },
  { src: 'assets/image11.png', title: 'Galaxy Runner', alt: 'Galaxy Runner oyunundan tam ekran görüntüsü' },
  { src: 'assets/tatli-coffee-merge.png', title: 'Tatlı Coffee Merge', alt: 'Pastanede birleştirme kavanozu ve hayvan müşterinin siparişi' },
];
let activeImage = 0;
function showImage(index) {
  activeImage = (index + images.length) % images.length;
  const data = images[activeImage];
  const image = document.getElementById('gallery-image');
  image.src = data.src;
  image.alt = data.alt;
  document.getElementById('gallery-title').textContent = data.title;
  document.getElementById('gallery-counter').textContent = `${activeImage + 1} / ${images.length}`;
}
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  showImage(Number(button.dataset.gallery));
  openDialog(galleryDialog, button);
}));
document.getElementById('gallery-prev').addEventListener('click', () => showImage(activeImage - 1));
document.getElementById('gallery-next').addEventListener('click', () => showImage(activeImage + 1));
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showImage(activeImage + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let touchStart = null;
const galleryImage = document.getElementById('gallery-image');
galleryImage.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
galleryImage.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showImage(activeImage + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
galleryImage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
document.getElementById('year').textContent = new Date().getFullYear();
