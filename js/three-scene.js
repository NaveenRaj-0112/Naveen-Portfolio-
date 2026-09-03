/* ==========================================
   THREE.JS 3D SCENE
   - Background particles
   - Floating geometric objects
   - Mouse interaction
   - Gravity field around profile
   ========================================== */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.position.z = 30;

  // Mouse tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ==========================================
  // PARTICLES
  // ==========================================
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

    velocities.push({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.005,
      baseX: positions[i * 3],
      baseY: positions[i * 3 + 1],
      baseZ: positions[i * 3 + 2]
    });

    sizes[i] = Math.random() * 2 + 0.5;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x6c63ff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ==========================================
  // FLOATING GEOMETRIC SHAPES
  // ==========================================
  const shapes = [];
  const shapeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x6c63ff, wireframe: true, transparent: true, opacity: 0.15 }),
    new THREE.MeshBasicMaterial({ color: 0x4ecdc4, wireframe: true, transparent: true, opacity: 0.12 }),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.1 })
  ];

  const geometries = [
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.8, 0.3, 8, 16)
  ];

  for (let i = 0; i < 8; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = shapeMaterials[Math.floor(Math.random() * shapeMaterials.length)];
    const mesh = new THREE.Mesh(geom, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20 - 10
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005 },
      floatSpeed: Math.random() * 0.5 + 0.3,
      floatRange: Math.random() * 0.5 + 0.3,
      baseY: mesh.position.y
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // ==========================================
  // ORBITAL RING (subtle)
  // ==========================================
  const ringGeometry = new THREE.RingGeometry(12, 12.1, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x6c63ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  // ==========================================
  // ANIMATION LOOP
  // ==========================================
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Rotate particles based on mouse
    particles.rotation.x = mouse.y * 0.1;
    particles.rotation.y = mouse.x * 0.1;

    // Animate individual particles
    const posArray = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const vel = velocities[i];
      posArray[i * 3] += vel.x + mouse.x * 0.02;
      posArray[i * 3 + 1] += vel.y + mouse.y * 0.02;
      posArray[i * 3 + 2] += vel.z;

      // Boundary check - wrap around
      if (Math.abs(posArray[i * 3] - vel.baseX) > 20) vel.x *= -1;
      if (Math.abs(posArray[i * 3 + 1] - vel.baseY) > 15) vel.y *= -1;
      if (Math.abs(posArray[i * 3 + 2] - vel.baseZ) > 10) vel.z *= -1;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Animate shapes
    shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotSpeed.x;
      shape.rotation.y += shape.userData.rotSpeed.y;
      shape.position.y = shape.userData.baseY + Math.sin(time * shape.userData.floatSpeed) * shape.userData.floatRange;
    });

    // Rotate ring
    ring.rotation.z = time * 0.1;

    // Camera subtle movement
    camera.position.x = mouse.x * 2;
    camera.position.y = mouse.y * 1.5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // ==========================================
  // RESIZE HANDLER
  // ==========================================
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();
