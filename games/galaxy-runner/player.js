'use strict';
const stage = document.getElementById('game-stage');
const canvas = document.getElementById('unity-canvas');
const startScreen = document.getElementById('start-screen');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('loading-progress');
const loadingLabel = document.getElementById('loading-label');
const gameStatus = document.getElementById('game-status');
const fullscreenButton = document.getElementById('fullscreen-button');
let started = false;
let failed = false;

function showError(message) {
  if (failed) return;
  failed = true;
  console.error('Galaxy Runner:', message);
  loadingScreen.hidden = false;
  loadingLabel.textContent = 'Oyun açılamadı.';
  progressBar.hidden = true;
  document.getElementById('load-error').hidden = false;
  gameStatus.textContent = 'Yükleme tamamlanamadı.';
  document.getElementById('retry-button').focus();
}

document.getElementById('start-button').addEventListener('click', () => {
  if (started) return;
  started = true;
  startScreen.hidden = true;
  loadingScreen.hidden = false;
  canvas.hidden = false;
  gameStatus.textContent = 'Oyun yükleniyor…';
  const config = {
    dataUrl: 'Build/WebGL-Web.data',
    frameworkUrl: 'Build/WebGL-Web.framework.js',
    codeUrl: 'Build/WebGL-Web.wasm',
    streamingAssetsUrl: 'StreamingAssets',
    companyName: 'GalaxyRunner',
    productName: 'GalaxyRunner',
    productVersion: '1.0',
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    showBanner: (message, type) => { if (type === 'error') showError(message); }
  };
  const loader = document.createElement('script');
  loader.src = 'Build/WebGL-Web.loader.js';
  loader.onerror = () => showError('Oyun yükleyicisi indirilemedi.');
  loader.onload = async () => {
    try {
      await createUnityInstance(canvas, config, progress => {
        progressBar.value = progress;
        loadingLabel.textContent = `Galaksi hazırlanıyor… %${Math.round(progress * 100)}`;
      });
      if (failed) return;
      loadingScreen.hidden = true;
      gameStatus.textContent = 'Basılı tut ve sağa-sola sürükle · Çift tıkla ateş et.';
      fullscreenButton.disabled = !stage.requestFullscreen;
      canvas.focus({ preventScroll: true });
    } catch (error) { showError(error); }
  };
  document.body.appendChild(loader);
});
document.getElementById('retry-button').addEventListener('click', () => window.location.reload());
fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
    canvas.focus({ preventScroll: true });
  } catch { gameStatus.textContent = 'Bu tarayıcıda tam ekran açılamadı; bu alanda oynamaya devam edebilirsin.'; }
});
document.addEventListener('fullscreenchange', () => {
  fullscreenButton.textContent = document.fullscreenElement ? 'Tam ekrandan çık ↙' : 'Tam ekran ↗';
});
