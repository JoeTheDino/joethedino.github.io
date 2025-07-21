
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';

let camera, scene, renderer;
let controller;
let reticle;
let model = null;
let video, videoTexture;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('docklands_01_2k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture; // HDRI en fond ou pas
    });


    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load('ModelMupiSolidBase.glb', function (gltf) {
        model = gltf.scene;
        model.visible = true;
        
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, 0, -1); // 1 mètre devant la caméra
        //model.rotation.set(0, Math.PI, 0); // Orienté vers l'utilisateur
        scene.add(model);

        // Replace texture named 'Screen' with video
        model.traverse((child) => {
            if (child.isMesh && child.material.name === 'Screen') {
                video = document.createElement('video');
                video.src = 'Dior-Jadore5th_916_LQ.mp4';
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = true;
                video.play();

                videoTexture = new THREE.VideoTexture(video);
                child.material.map = videoTexture;
                //child.material.emissiveMap = videoTexture;
                child.material.emissive = new THREE.Color(0x000000);
                child.material.needsUpdate = true;
                videoTexture.flipY = false; 
            }
        });
    });

    const geometry = new THREE.RingGeometry(0.05, 0.06, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    const hitTestSourceRequested = false;
    let hitTestSource = null;

    renderer.xr.addEventListener('sessionstart', async () => {
        const session = renderer.xr.getSession();
        const viewerReferenceSpace = await session.requestReferenceSpace('viewer');
        hitTestSource = await session.requestHitTestSource({ space: viewerReferenceSpace });

        session.addEventListener('end', () => {
            hitTestSource = null;
        });
    });

    renderer.setAnimationLoop((timestamp, frame) => {
        if (frame) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();

            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);
                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }

        renderer.render(scene, camera);
    });

    // Add gesture controls
    addGestureControls();
}

function onSelect() {
    if (reticle.visible && model) {
        model.position.setFromMatrixPosition(reticle.matrix);
        model.visible = true;
    }
}

function addGestureControls() {
    let isDragging = false;
    let previousTouch = null;

    renderer.domElement.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            previousTouch = event.touches[0];
        }
    });

    renderer.domElement.addEventListener('touchmove', (event) => {
        if (isDragging && model && event.touches.length === 1) {
            const deltaX = event.touches[0].pageX - previousTouch.pageX;
            const deltaY = event.touches[0].pageY - previousTouch.pageY;
            model.rotation.y += deltaX * 0.01;
            model.position.y += deltaY * 0.001;
            previousTouch = event.touches[0];
        } else if (event.touches.length === 2 && model) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (model.userData.lastDistance) {
                const scale = distance / model.userData.lastDistance;
                model.scale.multiplyScalar(scale);
            }
            model.userData.lastDistance = distance;
        }
    });

    renderer.domElement.addEventListener('touchend', (event) => {
        isDragging = false;
        previousTouch = null;
        if (model) model.userData.lastDistance = null;
    });
}

function animate() {
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
