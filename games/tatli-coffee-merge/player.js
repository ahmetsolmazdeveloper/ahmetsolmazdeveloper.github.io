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
  console.error('Tatlı Coffee Merge:', message);
  loadingScreen.hidden = false;
  loadingLabel.textContent = 'Kafe açılamadı.';
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
    dataUrl: 'Build/d5a6c1bd93c7f69d9a8eb8e5f427e022.data.unityweb',
    frameworkUrl: 'Build/ae55658c09a1449352ae47dbac864289.framework.js.unityweb',
    codeUrl: 'Build/abc9570d2e04d95efd4c3d174538e86d.wasm.unityweb',
    streamingAssetsUrl: 'StreamingAssets',
    companyName: 'Solmaz Games',
    productName: 'Tatli Kafe Merge',
    productVersion: '1.0',
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    showBanner: (message, type) => { if (type === 'error') showError(message); }
  };
  const loader = document.createElement('script');
  loader.src = 'Build/ac736aa2177893a08379258b4bd4fca4.loader.js';
  loader.onerror = () => showError('Oyun yükleyicisi indirilemedi.');
  loader.onload = async () => {
    try {
      await createUnityInstance(canvas, config, progress => {
        progressBar.value = progress;
        loadingLabel.textContent = `Kafe hazırlanıyor… %${Math.round(progress * 100)}`;
      });
      if (failed) return;
      loadingScreen.hidden = true;
      gameStatus.textContent = 'Fare veya dokunmatik ile hedefle ve bırak.';
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
