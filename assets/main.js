/*

animate();
*/

/*import * as THREE from 'three';*/

// Ce script suppose que <model-viewer> est présent dans index.html
// et que le modèle GLB contient un matériau nommé 'Screen'.

window.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.getElementById('ar-model');
  if (!modelViewer) {
    console.warn('model-viewer element not found');
    return;
  }

  modelViewer.addEventListener('load', () => {
    // model-viewer expose le modèle Three.js via .model
    const model = modelViewer.model;
    if (!model) return;
    model.traverse((node) => {
      if (node.isMesh && node.material.name === 'Screen') {
        const video = document.createElement('video');
        video.src = '/WebAR-app/Dior-Jadore5th_916_LQ.mp4';
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        node.material.map = videoTexture;
        node.material.needsUpdate = true;
        videoTexture.flipY = false;
      }
    });
  });
});
