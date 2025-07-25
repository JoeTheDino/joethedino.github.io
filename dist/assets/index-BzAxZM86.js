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
const modelViewerAnimated = document.querySelector("model-viewer#animated");
let videoTexture = null;
customElements.whenDefined("model-viewer").then(() => {
  videoTexture = modelViewerAnimated.createVideoTexture("/WebAR-app/Dior-Jadore5th_916_LQ.mp4");
});
modelViewerAnimated.addEventListener("load", async () => {
  const materials = modelViewerAnimated.model.materials;
  const screenMaterial = materials.find((mat) => mat.name === "Screen");
  if (screenMaterial && videoTexture) {
    const { pbrMetallicRoughness } = screenMaterial;
    pbrMetallicRoughness.baseColorTexture.setTexture(videoTexture);
    screenMaterial.emissiveTexture.setTexture(videoTexture);
    const sampler = screenMaterial.pbrMetallicRoughness.baseColorTexture.texture.sampler;
    sampler.setScale({ u: 1, v: -1 });
    const samplerEmissive = screenMaterial.pbrMetallicRoughness.emissiveTexture.texture.sampler;
    samplerEmissive.setScale({ u: 1, v: -1 });
  } else {
    console.warn("Matériau 'Screen' non trouvé ou texture vidéo non prête.");
  }
});
