(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
window.addEventListener("DOMContentLoaded", () => {
  const modelViewer = document.getElementById("ar-model");
  if (!modelViewer) {
    console.warn("model-viewer element not found");
    return;
  }
  modelViewer.addEventListener("load", () => {
    const model = modelViewer.model;
    if (!model) return;
    model.traverse((node) => {
      if (node.isMesh && node.material.name === "Screen") {
        const video = document.createElement("video");
        video.src = "/WebAR-app/Dior-Jadore5th_916_LQ.mp4";
        video.crossOrigin = "anonymous";
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
