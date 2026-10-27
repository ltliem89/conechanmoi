import * as THREE from 'three';

export interface PatrolDragonflyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  tailGroup: THREE.Group;
  foreLeftWing: THREE.Group;
  hindLeftWing: THREE.Group;
  foreRightWing: THREE.Group;
  hindRightWing: THREE.Group;
  flairRing: THREE.Mesh;
  flairMat: THREE.MeshBasicMaterial;
  isBee?: boolean;
}

export interface RollingSnailRig {
  root: THREE.Group;
  shellGroup: THREE.Group;
  bodyGroup: THREE.Group;
  leftTentacle: THREE.Group;
  rightTentacle: THREE.Group;
}

/**
 * Creates a lightweight 256x128 equirectangular Sky & Environment texture
 * with realistic daylight colors and +15% brighter sky luminance,
 * giving wet frog skin, water, and insects natural reflections at near-zero GPU cost.
 */
export function createBrightDaylightSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Natural daylight sky gradient (+15% brighter than before)
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0.0, '#1d6fa5'); // Zenith natural sky blue
  grad.addColorStop(0.32, '#2b8cbe'); // Upper sky
  grad.addColorStop(0.52, '#56b4e9'); // Bright sunlit horizon (+15% brighter)
  grad.addColorStop(0.62, '#16658a'); // Distant pond edge
  grad.addColorStop(1.0, '#0a3d62'); // Deep pond water reflection bounce
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  // Soft warm sunlight glow in upper-right sky
  const sunGrad = ctx.createRadialGradient(190, 38, 4, 190, 38, 68);
  sunGrad.addColorStop(0, 'rgba(255, 251, 235, 0.55)');
  sunGrad.addColorStop(0.45, 'rgba(254, 243, 199, 0.22)');
  sunGrad.addColorStop(1, 'rgba(254, 243, 199, 0.0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, 256, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

/**
 * Lightweight 256x256 procedural CanvasTexture for realistic natural blue pond water
 * ("màu sắc đúng thực tế, nền trời sáng hơn 15%")
 */
export function createBluePondWaterTexture(
  renderer: THREE.WebGLRenderer
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 180);
  grad.addColorStop(0, '#1e88e5');
  grad.addColorStop(0.45, '#0277bd');
  grad.addColorStop(0.82, '#01579b');
  grad.addColorStop(1, '#0c3b5e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Flowing water current streaks
  ctx.strokeStyle = 'rgba(187, 222, 251, 0.34)';
  ctx.lineWidth = 1.6;
  for (let y = 8; y < 256; y += 16) {
    ctx.beginPath();
    for (let x = 0; x <= 256; x += 12) {
      const wy =
        y +
        Math.sin(x * 0.05 + y * 0.07) * 5 +
        Math.cos(x * 0.09 - y * 0.04) * 2.5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  // Sparkling blue water caustic cells
  ctx.strokeStyle = 'rgba(227, 242, 253, 0.25)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 32; i++) {
    const x = ((i * 53) % 236) + 10;
    const y = ((i * 89) % 236) + 10;
    const r = 8 + (i % 5) * 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 2.5);
  texture.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

// Cached geometries & materials for Patrol Dragonflies & Wild Bees (Zero extra GPU memory)
const critterGeos = {
  thorax: new THREE.SphereGeometry(0.18, 9, 7),
  head: new THREE.SphereGeometry(0.145, 8, 7),
  eye: new THREE.SphereGeometry(0.092, 7, 6),
  glint: new THREE.SphereGeometry(0.024, 5, 5),
  wingBlade: new THREE.SphereGeometry(0.5, 7, 5),
  flairRing: (() => {
    const g = new THREE.RingGeometry(0.16, 0.27, 14);
    g.rotateX(-Math.PI / 2);
    return g;
  })(),
};

/**
 * Creates a lightweight, realistic 3D Patrol Dragonfly or Wild Honeybee (Chuồn chuồn / Ong mật)
 * that flies across the pond and can be leaped at and eaten mid-air by frogs or fish!
 */
export function createPatrolDragonflyRig(
  variantIndex: number
): PatrolDragonflyRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Alternate between true-to-life Dragonflies (Chuồn chuồn) and Wild Honeybees (Ong mật)
  const isBee = variantIndex % 2 === 1;

  const schemes = [
    {
      // Realistic Emperor Blue-Green Darner Dragonfly (Chuồn chuồn ngô xanh)
      thorax: 0x15803d,
      ringA: 0x0284c7,
      ringB: 0x0f172a,
      wingTint: 0xe0f2fe,
      flair: 0x38bdf8,
    },
    {
      // Realistic Golden Honeybee (Ong mật vàng nâu tự nhiên)
      thorax: 0xd97706,
      ringA: 0xfacc15,
      ringB: 0x292524,
      wingTint: 0xfef9c3,
      flair: 0xfde047,
    },
    {
      // Realistic Crimson Meadowhawk Dragonfly (Chuồn chuồn ớt đỏ)
      thorax: 0xb91c1c,
      ringA: 0xef4444,
      ringB: 0x311010,
      wingTint: 0xffe4e6,
      flair: 0xfca5a5,
    },
  ];
  const scheme = isBee ? schemes[1] : schemes[variantIndex % 3];

  const thoraxMat = new THREE.MeshStandardMaterial({
    color: scheme.thorax,
    roughness: isBee ? 0.45 : 0.25,
    metalness: isBee ? 0.1 : 0.35,
  });
  const ringAMat = new THREE.MeshStandardMaterial({
    color: scheme.ringA,
    roughness: 0.3,
    metalness: isBee ? 0.08 : 0.3,
  });
  const ringBMat = new THREE.MeshStandardMaterial({
    color: scheme.ringB,
    roughness: 0.45,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.12,
  });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const wingMat = new THREE.MeshBasicMaterial({
    color: scheme.wingTint,
    transparent: true,
    opacity: 0.56,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Thorax
  const thorax = new THREE.Mesh(critterGeos.thorax, thoraxMat);
  thorax.scale.set(0.88, 0.92, isBee ? 1.15 : 1.42);
  bodyGroup.add(thorax);

  // Head & Compound Eyes
  const head = new THREE.Mesh(critterGeos.head, isBee ? ringBMat : thoraxMat);
  head.position.set(0, 0.04, 0.25);
  bodyGroup.add(head);

  [-1, 1].forEach((side) => {
    const cEye = new THREE.Mesh(critterGeos.eye, eyeMat);
    cEye.scale.set(0.85, 1.05, 1.0);
    cEye.position.set(side * 0.1, 0.07, 0.29);
    const glint = new THREE.Mesh(critterGeos.glint, glintMat);
    glint.position.set(side * 0.03, 0.04, 0.07);
    cEye.add(glint);
    bodyGroup.add(cEye);
  });

  // Tail / Abdomen (-Z)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.0, -0.18);
  bodyGroup.add(tailGroup);

  if (isBee) {
    // Plump striped Honeybee abdomen
    const beeAbdomen = new THREE.Mesh(critterGeos.thorax, ringAMat);
    beeAbdomen.scale.set(1.15, 1.05, 1.45);
    beeAbdomen.position.set(0, -0.02, -0.18);
    tailGroup.add(beeAbdomen);

    [-0.08, -0.2, -0.32].forEach((zPos, idx) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.18 - idx * 0.025,
          0.18 - idx * 0.025,
          0.055,
          8
        ),
        ringBMat
      );
      band.rotation.x = Math.PI / 2;
      band.position.set(0, -0.02, zPos);
      tailGroup.add(band);
    });
  } else {
    // Slender 5-segment Dragonfly tail
    for (let s = 0; s < 5; s++) {
      const segLen = 0.16;
      const radius = 0.054 - s * 0.005;
      const segGeo = new THREE.CylinderGeometry(
        radius * 0.88,
        radius,
        segLen,
        7
      );
      segGeo.rotateX(Math.PI / 2);
      const seg = new THREE.Mesh(segGeo, s % 2 === 0 ? ringAMat : ringBMat);
      seg.position.set(0, 0, -(s * segLen + segLen * 0.5));
      tailGroup.add(seg);
    }
  }

  // 4 Articulated Wings
  const buildWing = (side: -1 | 1, isFore: boolean): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.11, 0.13, isFore ? 0.08 : -0.06);
    pivot.rotation.y = side * (isFore ? 0.12 : -0.14);

    const span = isBee ? (isFore ? 0.44 : 0.34) : isFore ? 0.7 : 0.62;
    const chord = isBee ? 0.22 : isFore ? 0.15 : 0.17;

    const blade = new THREE.Mesh(critterGeos.wingBlade, wingMat);
    blade.scale.set(span, 0.03, chord);
    blade.position.set(side * (span * 0.5), 0, 0);
    pivot.add(blade);

    bodyGroup.add(pivot);
    return pivot;
  };

  const foreLeftWing = buildWing(-1, true);
  const hindLeftWing = buildWing(-1, false);
  const foreRightWing = buildWing(1, true);
  const hindRightWing = buildWing(1, false);

  const flairMat = new THREE.MeshBasicMaterial({
    color: scheme.flair,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const flairRing = new THREE.Mesh(critterGeos.flairRing, flairMat);
  flairRing.position.set(0, -0.08, -0.14);
  bodyGroup.add(flairRing);

  return {
    root,
    bodyGroup,
    tailGroup,
    foreLeftWing,
    hindLeftWing,
    foreRightWing,
    hindRightWing,
    flairRing,
    flairMat,
    isBee,
  };
}

/**
 * Creates a lightweight, realistic 3D Little Rolling Pond Snail (Ốc nhỏ lăn trên lá sen)
 */
export function createRollingSnailRig(variantIndex: number): RollingSnailRig {
  const root = new THREE.Group();

  const shellPalettes = [
    { main: 0x92400e, stripe: 0xfde68a, body: 0xd6d3d1 }, // Natural Pond Apple Snail (Ốc bươu / ốc gạo tự nhiên)
    { main: 0x78350f, stripe: 0xfcd34d, body: 0xe7e5e4 }, // Chestnut River Snail
    { main: 0xb45309, stripe: 0xfef08a, body: 0xf5f5f4 }, // Golden Amber Snail
    { main: 0x4b5563, stripe: 0xcbd5e1, body: 0xd1d5db }, // Dark Stone Snail
  ];
  const pal = shellPalettes[variantIndex % shellPalettes.length];

  const shellMat = new THREE.MeshStandardMaterial({
    color: pal.main,
    roughness: 0.28,
    metalness: 0.08,
  });
  const bandMat = new THREE.MeshStandardMaterial({
    color: pal.stripe,
    roughness: 0.35,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: pal.body,
    roughness: 0.42,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const footGeo = new THREE.SphereGeometry(0.11, 8, 6);
  footGeo.scale(0.72, 0.48, 1.65);
  const foot = new THREE.Mesh(footGeo, bodyMat);
  foot.position.set(0, 0.045, 0.03);
  bodyGroup.add(foot);

  const createTentacle = (side: -1 | 1) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(side * 0.042, 0.08, 0.16);
    const stalkGeo = new THREE.CylinderGeometry(0.01, 0.014, 0.1, 5);
    stalkGeo.translate(0, 0.05, 0);
    const stalk = new THREE.Mesh(stalkGeo, bodyMat);
    const tipBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 5, 5),
      eyeMat
    );
    tipBall.position.set(0, 0.1, 0);
    tGroup.add(stalk, tipBall);
    tGroup.rotation.x = 0.35;
    tGroup.rotation.z = side * -0.28;
    bodyGroup.add(tGroup);
    return tGroup;
  };

  const leftTentacle = createTentacle(-1);
  const rightTentacle = createTentacle(1);

  const shellGroup = new THREE.Group();
  shellGroup.position.set(0, 0.14, -0.02);
  root.add(shellGroup);

  const coreShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 9, 7),
    shellMat
  );
  coreShell.scale.set(0.82, 1.05, 1.05);
  shellGroup.add(coreShell);

  [-1, 1].forEach((side) => {
    const whorl1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.076, 0.032, 5, 10),
      bandMat
    );
    whorl1.rotation.y = Math.PI / 2;
    whorl1.position.set(side * 0.085, 0, 0);
    shellGroup.add(whorl1);
  });

  for (let r = 0; r < 4; r++) {
    const angle = (r / 4) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 5, 4),
      bandMat
    );
    rib.scale.set(3.2, 0.55, 0.55);
    rib.position.set(0, Math.cos(angle) * 0.125, Math.sin(angle) * 0.125);
    rib.rotation.x = angle;
    shellGroup.add(rib);
  }

  return {
    root,
    shellGroup,
    bodyGroup,
    leftTentacle,
    rightTentacle,
  };
}
