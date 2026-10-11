import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.querySelector('#earth-canvas');
const loading = document.querySelector('#loading');
const nameEl = document.querySelector('#object-name');
const descriptionEl = document.querySelector('#object-description');
const typeEl = document.querySelector('#object-type');
let spinning = true;
let selectedObject = 'earth';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050a15');

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5.3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.7;
controls.maxDistance = 8;
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0x9cb9e8, 1.8));
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(5, 3, 5);
scene.add(sun);

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const textureLoader = new THREE.TextureLoader();
const earthGeometry = new THREE.SphereGeometry(1.45, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    () => loading.classList.add('hidden')),
  roughness: 1,
  metalness: 0
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

// Soft atmospheric halo
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.49, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0x278cff, transparent: true, opacity: 0.09, side: THREE.BackSide })
);
earthGroup.add(atmosphere);

// Decorative stars
const starPositions = [];
for (let i = 0; i < 1400; i++) {
  starPositions.push((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 34, (Math.random() - 0.5) * 34);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xb9d9ff, size: 0.018 }));
scene.add(stars);

// Illustrative orbits only; these are not calculated from real satellite elements.
const orbitObjects = [];
function addDemoOrbit({ id, label, color, radius, tilt, phase }) {
  const points = [];
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.45, 0));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.58 });
  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.set(tilt, 0, tilt * 0.35);
  earthGroup.add(orbit);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshBasicMaterial({ color })
  );
  earthGroup.add(marker);
  const item = { id, label, color, radius, tilt, phase, orbit, marker };
  orbitObjects.push(item);
  updateMarker(item, 0);
}
function updateMarker(item, time) {
  const a = time * 0.22 + item.phase;
  const p = new THREE.Vector3(Math.cos(a) * item.radius, Math.sin(a) * item.radius * 0.45, 0);
  p.applyEuler(new THREE.Euler(item.tilt, 0, item.tilt * 0.35));
  item.marker.position.copy(p);
}
addDemoOrbit({ id: 'iss', label: 'ISS example orbit', color: 0xffcf75, radius: 1.85, tilt: 0.75, phase: 0.6 });
addDemoOrbit({ id: 'weather', label: 'Weather satellite', color: 0x80e8bd, radius: 2.15, tilt: -0.45, phase: 2.4 });

const objectInfo = {
  earth: { name: 'Earth', type: 'Planet', description: 'Our home planet. Rotate the globe and zoom in or out. The satellite paths shown here are illustrative examples.' },
  iss: { name: 'ISS example orbit', type: 'Demo marker', description: 'This marker represents a learning example inspired by low-Earth-orbit spacecraft. Its position and orbit are not live or physically accurate.' },
  weather: { name: 'Weather satellite', type: 'Demo marker', description: 'Weather satellites help observe clouds, storms and Earth systems. This marker is illustrative and does not represent a specific satellite.' }
};
function selectObject(id) {
  selectedObject = id;
  const info = objectInfo[id] || objectInfo.earth;
  nameEl.textContent = info.name;
  typeEl.textContent = info.type;
  descriptionEl.textContent = info.description;
  document.querySelectorAll('.object-button').forEach(button => {
    button.classList.toggle('selected', button.dataset.object === id);
  });
  const found = orbitObjects.find(item => item.id === id);
  orbitObjects.forEach(item => item.marker.scale.setScalar(item === found ? 1.6 : 1));
}
document.querySelectorAll('.object-button').forEach(button => {
  button.addEventListener('click', () => selectObject(button.dataset.object));
});

document.querySelector('#reset-view').addEventListener('click', () => {
  camera.position.set(0, 0, 5.3);
  controls.target.set(0, 0, 0);
  controls.update();
});
document.querySelector('#toggle-spin').addEventListener('click', event => {
  spinning = !spinning;
  event.currentTarget.textContent = spinning ? 'Ⅱ' : '▶';
  event.currentTarget.setAttribute('aria-label', spinning ? 'Pause Earth rotation' : 'Resume Earth rotation');
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('click', event => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(orbitObjects.map(item => item.marker));
  if (hits.length) {
    const item = orbitObjects.find(candidate => candidate.marker === hits[0].object);
    if (item) selectObject(item.id);
  }
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (spinning) earth.rotation.y += 0.0008;
  orbitObjects.forEach(item => updateMarker(item, elapsed));
  controls.update();
  renderer.render(scene, camera);
}
animate();

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener('resize', resize);
selectObject('earth');
