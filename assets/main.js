// Attention : n'importez Three.js qu'une seule fois dans tout le projet pour éviter les conflits.
console.log('main.js chargé');
import * as THREE from 'three';

// Ce script suppose que <model-viewer> est présent dans index.html
// et que le modèle GLB contient un matériau nommé 'Screen'.

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
  const modelViewer = document.getElementById('ar-model');
  if (!modelViewer) {
    console.warn('model-viewer element not found');
    return;
  }

  modelViewer.addEventListener('scene-graph-ready', () => {
    const materials = modelViewer.model.materials;
    materials.forEach((material) => {
      console.log('Matériau trouvé:', material.name);
      if (material.name === 'Screen') {
        const video = document.createElement('video');
        video.src = '/WebAR-app/Dior-Jadore5th_916_LQ.mp4';
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.play();
        video.addEventListener('play', () => {
          console.log('La vidéo démarre bien.');
        });
        video.addEventListener('error', (e) => {
          console.error('Erreur vidéo:', e);
        });
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.flipY = false;
        material.pbrMetallicRoughness.setBaseColorTexture(videoTexture);
        material.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
        console.log('Texture vidéo appliquée au matériau Screen');
      }
    });
  });
});
