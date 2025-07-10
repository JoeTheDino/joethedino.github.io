import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/Addons.js';
/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
*/
let camera, scene, renderer, controller;

    init();
    animate();

    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      document.body.appendChild(renderer.domElement);

      document.body.appendChild(ARButton.createButton(renderer));

      // Créer une vidéo texture
      const video = document.createElement('video');
      video.src = './Dior-Jadore5th_916_LQ.mp4'; // Remplace par le chemin de ta vidéo
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);

      // Charger un modèle GLTF
      const loader = new GLTFLoader();
      loader.load('./ModelMupiSolidBase.glb', function (gltf) {
        const model = gltf.scene;

        // Appliquer la texture vidéo à un des matériaux
        model.traverse((child) => {
            if (child.isMesh && child.material) {
      // Si le matériau est un tableau (multi-material)
      if (Array.isArray(child.material)) {
        child.material.forEach((mat, i) => {
          if (mat.name === 'Screen') {
            child.material[i] = new THREE.MeshBasicMaterial({ map: videoTexture });
          }
        });
      } else {
        // Si c'est un matériau unique
        if (child.material.name === 'Screen') {
          child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
        }
      }
    }
        });

        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, 0, -1); // 1 mètre devant la caméra
        scene.add(model);
      });

      controller = renderer.xr.getController(0);
      scene.add(controller);
    }

    function animate() {
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    }