import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
*/

let camera, scene, renderer, controller;
let modelRef = null;
let dragging = false;
let lastTouchDistance = null;
let lastRotationX = null;

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

      //Lumières
      
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(1, 1, 1);
        scene.add(dirLight);
    const rgbeLoader = new RGBELoader();
        rgbeLoader.load('./docklands_01_2k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    // scene.background = texture; // optionnel si tu veux voir le HDRI en fond
        });

      // Créer une vidéo texture
      const video = document.createElement('video');
      video.src = './Dior-Jadore5th_916_LQ.mp4'; // Remplace par le chemin de ta vidéo
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.flipY = false;


      // Charger un modèle GLTF
      const loader = new GLTFLoader();

      loader.load('./ModelMupiSolidBase.glb', function (gltf) {
        const model = gltf.scene;

        // Appliquer la texture vidéo à un des matériaux
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat, i) => {
                        if (mat.name === 'Screen') {
                            child.material[i] = new THREE.MeshBasicMaterial({ map: videoTexture });
                        }
                    });
                } else {
                    if (child.material.name === 'Screen') {
                        child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
                    }
                }
            }
        });

        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, -0.5, -1.5);
        scene.add(model);
        modelRef = model;
      });


      controller = renderer.xr.getController(0);
      scene.add(controller);

      // Drag (déplacement du modèle)
      controller.addEventListener('selectstart', onSelectStart);
      controller.addEventListener('selectend', onSelectEnd);

      // Touch events for pinch and rotate
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
      renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });
    }


    // Drag logic
    function onSelectStart(event) {
      dragging = true;
    }
    function onSelectEnd(event) {
      dragging = false;
    }

    // Pinch to zoom & rotate
    function onTouchStart(event) {
      if (event.touches.length === 2) {
        lastTouchDistance = getTouchDistance(event.touches);
      }
      if (event.touches.length === 1) {
        lastRotationX = event.touches[0].clientX;
      }
    }

    function onTouchMove(event) {
      if (!modelRef) return;
      if (event.touches.length === 2) {
        event.preventDefault();
        const newDistance = getTouchDistance(event.touches);
        if (lastTouchDistance) {
          const scaleChange = newDistance / lastTouchDistance;
          modelRef.scale.multiplyScalar(scaleChange);
        }
        lastTouchDistance = newDistance;
      } else if (event.touches.length === 1) {
        // Rotation Y
        event.preventDefault();
        const deltaX = event.touches[0].clientX - lastRotationX;
        modelRef.rotation.y += deltaX * 0.01;
        lastRotationX = event.touches[0].clientX;
      }
    }

    function onTouchEnd(event) {
      lastTouchDistance = null;
      lastRotationX = null;
    }

    function getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Animation loop
    function animate() {
      renderer.setAnimationLoop(() => {
        // Dragging: déplacer le modèle sous le contrôleur
        if (dragging && modelRef && controller) {
          const tempMatrix = new THREE.Matrix4();
          tempMatrix.identity().extractRotation(controller.matrixWorld);
          const position = new THREE.Vector3();
          position.setFromMatrixPosition(controller.matrixWorld);
          modelRef.position.copy(position);
        }
        renderer.render(scene, camera);
      });
    }