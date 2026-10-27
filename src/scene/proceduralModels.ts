import * as THREE from 'three';
import { InsectType } from '../game/types';

export interface FrogPalette {
  nameVi: string;
  skin: number;
  belly: number;
  spots: number;
  stripe: number;
  hexCss: string;
}

export const FROG_PALETTES: FrogPalette[] = [
  {
    nameVi: 'Xanh Lá Tự Nhiên (Ếch Đồng)',
    skin: 0x45b649,
    belly: 0xebf7b8,
    spots: 0x184d22,
    stripe: 0xc5d86d,
    hexCss: '#45b649',
  },
  {
    nameVi: 'Xanh Lá Sen Đậm',
    skin: 0x2e8b57,
    belly: 0xdcfce7,
    spots: 0x0f381e,
    stripe: 0xa3e635,
    hexCss: '#2e8b57',
  },
  {
    nameVi: 'Xanh Cốm Mùa Xuân',
    skin: 0x65c93d,
    belly: 0xf7fee7,
    spots: 0x255c18,
    stripe: 0xfde047,
    hexCss: '#65c93d',
  },
  {
    nameVi: 'Vàng Hoàng Kim',
    skin: 0xfacc15,
    belly: 0xfef9c3,
    spots: 0x854d0e,
    stripe: 0xfef08a,
    hexCss: '#facc15',
  },
  {
    nameVi: 'Đỏ Hồng Ngọc',
    skin: 0xf43f5e,
    belly: 0xffe4e6,
    spots: 0x881337,
    stripe: 0xfda4af,
    hexCss: '#f43f5e',
  },
  {
    nameVi: 'Xanh Lam Ánh Kim',
    skin: 0x06b6d4,
    belly: 0xcffafe,
    spots: 0x164e63,
    stripe: 0x67e8f9,
    hexCss: '#06b6d4',
  },
  {
    nameVi: 'Tím Thạch Anh',
    skin: 0xa855f7,
    belly: 0xf3e8ff,
    spots: 0x581c87,
    stripe: 0xd8b4fe,
    hexCss: '#a855f7',
  },
  {
    nameVi: 'Cam San Hô',
    skin: 0xf97316,
    belly: 0xffedd5,
    spots: 0x7c2d12,
    stripe: 0xfdba74,
    hexCss: '#f97316',
  },
  {
    nameVi: 'Hồng Đào Phấn',
    skin: 0xec4899,
    belly: 0xfce7f3,
    spots: 0x831843,
    stripe: 0xf9a8d4,
    hexCss: '#ec4899',
  },
  {
    nameVi: 'Xanh Ngọc Bích',
    skin: 0x14b8a6,
    belly: 0xccfbf1,
    spots: 0x134e4a,
    stripe: 0x5eead4,
    hexCss: '#14b8a6',
  },
  {
    nameVi: 'Xanh Dương Hoàng Gia',
    skin: 0x3b82f6,
    belly: 0xdbeafe,
    spots: 0x1e3a8a,
    stripe: 0x93c5fd,
    hexCss: '#3b82f6',
  },
  {
    nameVi: 'Trắng Bạch Tuyết',
    skin: 0xf1f5f9,
    belly: 0xfef08a,
    spots: 0x475569,
    stripe: 0xfde047,
    hexCss: '#f1f5f9',
  },
];

export interface FrogRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  jawGroup: THREE.Group;
  vocalSac: THREE.Mesh;
  leftCheek: THREE.Mesh;
  rightCheek: THREE.Mesh;
  headSproutGroup: THREE.Group;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  leftSparkleGroup: THREE.Group;
  rightSparkleGroup: THREE.Group;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  leftFrontLeg: THREE.Group;
  rightFrontLeg: THREE.Group;
  leftHindLeg: THREE.Group;
  rightHindLeg: THREE.Group;
  tongueGroup: THREE.Group;
  tongueShaft: THREE.Mesh;
  tongueTip: THREE.Mesh;
  hitProxy: THREE.Mesh;
  skinMat: THREE.MeshStandardMaterial;
  bellyMat: THREE.MeshStandardMaterial;
  spotMat: THREE.MeshStandardMaterial;
  stripeMat: THREE.MeshStandardMaterial;
  paletteIndex: number;
}

export interface LilyPadRig {
  root: THREE.Group;
  padGroup: THREE.Group;
  rippleRing: THREE.Mesh;
  rippleMat: THREE.MeshBasicMaterial;
  baseX: number;
  baseZ: number;
  radius: number;
  dipY: number;
  dipVel: number;
  ripplePhase: number;
  phaseOffset: number;
}

export interface InsectRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftWings: THREE.Object3D[];
  rightWings: THREE.Object3D[];
  type: InsectType;
}

export interface FishRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  tailGroup: THREE.Group;
  leftPectoral: THREE.Mesh;
  rightPectoral: THREE.Mesh;
}

let cachedFrogPatternTex: THREE.CanvasTexture | null = null;
/**
 * Lightweight 256x256 realistic frog skin albedo texture (cellular mottling + haloed leopard spots)
 */
function getFrogSkinPatternTexture(): THREE.CanvasTexture {
  if (cachedFrogPatternTex) return cachedFrogPatternTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
  bgGrad.addColorStop(0, '#f4fbe8');
  bgGrad.addColorStop(0.5, '#e2f2cb');
  bgGrad.addColorStop(1, '#cde6af');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 140; i++) {
    const x = (i * 53) % 256;
    const y = (i * 89) % 256;
    const r = 3 + (i % 4) * 2.5;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255, 255, 230, 0.16)' : 'rgba(60, 110, 45, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const spots = [
    [70, 60, 11, 8],
    [185, 62, 10, 8],
    [128, 88, 12, 9],
    [82, 115, 12, 8],
    [172, 118, 11, 8],
    [128, 145, 13, 9],
    [65, 160, 9, 7],
    [190, 158, 10, 7],
    [98, 188, 11, 8],
    [158, 190, 11, 8],
  ];

  spots.forEach(([cx, cy, rx, ry], idx) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((idx % 5) - 2) * 0.2);

    ctx.fillStyle = 'rgba(245, 255, 190, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx + 2.5, ry + 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(28, 68, 28, 0.62)';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedFrogPatternTex = tex;
  return tex;
}

let cachedContactShadowTex: THREE.CanvasTexture | null = null;
function getSoftContactShadowTexture(): THREE.CanvasTexture {
  if (cachedContactShadowTex) return cachedContactShadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 3, 32, 32, 30);
  grad.addColorStop(0, 'rgba(6, 24, 18, 0.62)');
  grad.addColorStop(0.55, 'rgba(6, 24, 18, 0.26)');
  grad.addColorStop(1, 'rgba(6, 24, 18, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedContactShadowTex = tex;
  return tex;
}

let cachedLilyPadAlbedoTex: THREE.CanvasTexture | null = null;
/**
 * Lightweight 256x256 botanical Lotus Leaf (Nelumbo nucifera) procedural texture
 */
function getLilyPadTexture(): THREE.CanvasTexture {
  if (cachedLilyPadAlbedoTex) return cachedLilyPadAlbedoTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
  grad.addColorStop(0, '#a3e635');
  grad.addColorStop(0.08, '#4ade80');
  grad.addColorStop(0.38, '#22c55e');
  grad.addColorStop(0.78, '#15803d');
  grad.addColorStop(0.95, '#166534');
  grad.addColorStop(1, '#3f2e1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const veinCount = 18;
  for (let i = 0; i < veinCount; i++) {
    const angle = (i / veinCount) * Math.PI * 2;
    const forkDist = 88 + (i % 3) * 6;
    const fx = 128 + Math.cos(angle) * forkDist;
    const fy = 128 + Math.sin(angle) * forkDist;

    ctx.strokeStyle = 'rgba(217, 249, 157, 0.42)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.quadraticCurveTo(
      128 + Math.cos(angle + 0.04) * 48,
      128 + Math.sin(angle + 0.04) * 48,
      fx,
      fy
    );
    ctx.stroke();

    [-0.08, 0.08].forEach((branchAngle) => {
      ctx.strokeStyle = 'rgba(187, 247, 208, 0.28)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(
        128 + Math.cos(angle + branchAngle) * 123,
        128 + Math.sin(angle + branchAngle) * 123
      );
      ctx.stroke();
    });
  }

  ctx.fillStyle = '#d9f99d';
  ctx.beginPath();
  ctx.arc(128, 128, 5, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedLilyPadAlbedoTex = tex;
  return tex;
}

export function applyFrogPalette(
  rig: FrogRig,
  paletteIndex: number
): FrogPalette {
  const normalizedIdx =
    ((paletteIndex % FROG_PALETTES.length) + FROG_PALETTES.length) %
    FROG_PALETTES.length;
  const palette = FROG_PALETTES[normalizedIdx];
  rig.paletteIndex = normalizedIdx;
  rig.skinMat.color.setHex(palette.skin);
  rig.bellyMat.color.setHex(palette.belly);
  rig.spotMat.color.setHex(palette.spots);
  rig.stripeMat.color.setHex(palette.stripe);
  return palette;
}

/**
 * Creates a super cute, chubby, expressive 3D Frog ("ngộ nghĩnh, đáng yêu, cute")
 * with natural green frog markings, rosy blush cheeks, big sparkling eyes ("mắt to tròn long lanh"),
 * waving front paws, a cute lotus sprout on its head, vocal sac, and extendable tongue.
 */
export function createFrogRig(
  variantIndex: number,
  customPaletteIndex?: number
): FrogRig {
  const initialPaletteIdx =
    (customPaletteIndex !== undefined ? customPaletteIndex : 0) %
    FROG_PALETTES.length;
  const palette = FROG_PALETTES[initialPaletteIdx];
  const skinPatternMap = getFrogSkinPatternTexture();

  const skinMat = new THREE.MeshStandardMaterial({
    map: skinPatternMap,
    color: palette.skin,
    roughness: 0.26,
    metalness: 0.04,
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: palette.belly,
    roughness: 0.45,
    metalness: 0.02,
  });

  const spotMat = new THREE.MeshStandardMaterial({
    color: palette.spots,
    roughness: 0.32,
    metalness: 0.04,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: palette.stripe,
    roughness: 0.32,
    metalness: 0.06,
  });

  const blushCheekMat = new THREE.MeshStandardMaterial({
    color: 0xff7eb6,
    emissive: 0xff5ca0,
    emissiveIntensity: 0.22,
    roughness: 0.35,
    metalness: 0.02,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.05,
  });

  const irisMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.18,
    metalness: 0.28,
  });

  const pupilMat = new THREE.MeshBasicMaterial({
    color: 0x090d16,
  });

  const tympanumMat = new THREE.MeshStandardMaterial({
    color: 0x2f5e35,
    roughness: 0.4,
  });

  const tongueMat = new THREE.MeshStandardMaterial({
    color: 0xff4d88,
    roughness: 0.25,
    metalness: 0.05,
  });

  const mouthInMat = new THREE.MeshBasicMaterial({
    color: 0x9f1239,
  });

  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Soft Grounding Contact Shadow directly on the lily pad
  const shadowGeo = new THREE.PlaneGeometry(1.52, 1.52);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: getSoftContactShadowTexture(),
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.set(0, 0.02, 0.02);
  root.add(contactShadow);

  // Invisible Raycast Hit Proxy Sphere
  const hitProxyGeo = new THREE.SphereGeometry(0.95, 8, 6);
  const hitProxyMat = new THREE.MeshBasicMaterial({
    visible: false,
  });
  const hitProxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
  hitProxy.position.set(0, 0.62, 0.08);
  root.add(hitProxy);

  // 1. Chubby Cute Torso
  const torsoGeo = new THREE.SphereGeometry(0.56, 16, 12);
  torsoGeo.scale(1.14, 0.92, 1.15);
  const torso = new THREE.Mesh(torsoGeo, skinMat);
  torso.position.set(0, 0.48, 0);
  bodyGroup.add(torso);

  // 2. Round Plump Cream-Yellow Belly patch ("bụng tròn mũm mĩm")
  const bellyGeo = new THREE.SphereGeometry(0.51, 14, 10);
  bellyGeo.scale(1.04, 0.85, 1.1);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, 0.43, 0.16);
  bodyGroup.add(belly);

  // 3. Authentic Dorsolateral Golden-Green Ridges
  const ridgeGeo = new THREE.CapsuleGeometry(0.032, 0.65, 5, 8);
  ridgeGeo.rotateX(Math.PI * 0.42);
  [-1, 1].forEach((side) => {
    const ridge = new THREE.Mesh(ridgeGeo, stripeMat);
    ridge.position.set(side * 0.33, 0.77, -0.06);
    ridge.rotation.y = side * -0.14;
    bodyGroup.add(ridge);
  });

  // 4. Sculpted Dorsal Leopard Spots on Back
  const spotGeo = new THREE.SphereGeometry(0.11, 8, 6);
  spotGeo.scale(1.15, 0.32, 1.35);
  const spotOffsets = [
    [-0.17, 0.84, -0.08],
    [0.18, 0.83, -0.04],
    [0, 0.86, -0.28],
    [-0.15, 0.72, -0.42],
    [0.16, 0.73, -0.39],
    [-0.46, 0.56, -0.05],
    [0.46, 0.56, -0.05],
  ];
  spotOffsets.forEach(([sx, sy, sz]) => {
    const spot = new THREE.Mesh(spotGeo, spotMat);
    spot.position.set(sx, sy, sz);
    bodyGroup.add(spot);
  });

  // 5. Big Cute Head & Upper Jaw Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.77, 0.23);
  bodyGroup.add(headGroup);

  const upperHeadGeo = new THREE.SphereGeometry(0.49, 16, 12);
  upperHeadGeo.scale(1.24, 0.74, 1.14);
  const upperHead = new THREE.Mesh(upperHeadGeo, skinMat);
  upperHead.position.set(0, 0.11, 0.06);
  headGroup.add(upperHead);

  // Rosy Blush Cheeks ("má hồng phúng phính đáng yêu")
  const cheekGeo = new THREE.SphereGeometry(0.145, 10, 8);
  cheekGeo.scale(1.15, 0.78, 0.92);
  const leftCheek = new THREE.Mesh(cheekGeo, blushCheekMat);
  leftCheek.position.set(-0.46, 0.04, 0.31);
  leftCheek.rotation.y = -0.35;
  headGroup.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeo, blushCheekMat);
  rightCheek.position.set(0.46, 0.04, 0.31);
  rightCheek.rotation.y = 0.35;
  headGroup.add(rightCheek);

  // Cute Little Nostrils
  const nostrilGeo = new THREE.SphereGeometry(0.03, 6, 6);
  [-1, 1].forEach((side) => {
    const nostril = new THREE.Mesh(nostrilGeo, spotMat);
    nostril.position.set(side * 0.13, 0.24, 0.52);
    headGroup.add(nostril);
  });

  // Cute Little Lotus Sprout / Mini Flower Accessory on top of the head ("mầm sen non ngộ nghĩnh trên đầu")
  const headSproutGroup = new THREE.Group();
  headSproutGroup.position.set(0, 0.44, 0.04);
  headGroup.add(headSproutGroup);

  const sproutStemGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.22, 6);
  sproutStemGeo.translate(0, 0.11, 0);
  const sproutLeafMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16,
    roughness: 0.35,
  });
  const sproutStem = new THREE.Mesh(sproutStemGeo, sproutLeafMat);
  headSproutGroup.add(sproutStem);

  const sproutLeafGeo = new THREE.SphereGeometry(0.095, 8, 6);
  sproutLeafGeo.scale(1.35, 0.28, 0.72);
  [-1, 1].forEach((side) => {
    const leaf = new THREE.Mesh(sproutLeafGeo, sproutLeafMat);
    leaf.position.set(side * 0.095, 0.22, 0);
    leaf.rotation.z = side * 0.32;
    headSproutGroup.add(leaf);
  });

  if (variantIndex % 2 === 1) {
    // Tiny cute pink lotus bud on top of the sprout for half the frogs
    const budGeo = new THREE.SphereGeometry(0.065, 8, 6);
    budGeo.scale(0.85, 1.25, 0.85);
    const bud = new THREE.Mesh(budGeo, blushCheekMat);
    bud.position.set(0, 0.26, 0);
    headSproutGroup.add(bud);
  }

  const tympanumGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10);
  tympanumGeo.rotateZ(Math.PI / 2);
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(tympanumGeo, tympanumMat);
    ear.position.set(side * 0.51, 0.12, -0.06);
    ear.rotation.y = side * 0.25;
    headGroup.add(ear);
  });

  const mouthRoofGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.06, 12);
  mouthRoofGeo.scale(1.15, 1, 0.95);
  const mouthRoof = new THREE.Mesh(mouthRoofGeo, mouthInMat);
  mouthRoof.position.set(0, 0.0, 0.12);
  headGroup.add(mouthRoof);

  // 6. Big Expressive Sparkling Eyes ("Mắt to tròn long lanh dễ thương")
  const eyeSocketGeo = new THREE.SphereGeometry(0.255, 12, 10);
  const eyeWhiteGeo = new THREE.SphereGeometry(0.215, 12, 10);
  const irisGeo = new THREE.SphereGeometry(0.145, 10, 8);
  irisGeo.scale(1, 1, 0.55);
  const pupilGeo = new THREE.SphereGeometry(0.112, 10, 8);
  pupilGeo.scale(1, 1, 0.68);
  const primaryGlintGeo = new THREE.SphereGeometry(0.046, 8, 6);
  const secondaryGlintGeo = new THREE.SphereGeometry(0.026, 6, 6);
  const starBarGeo = new THREE.BoxGeometry(0.11, 0.018, 0.01);

  const sparklePureMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const sparkleWarmMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
  });

  const eyelidGeo = new THREE.SphereGeometry(
    0.228,
    12,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.55
  );

  const createEye = (side: -1 | 1) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * 0.3, 0.36, 0.15);

    const socket = new THREE.Mesh(eyeSocketGeo, skinMat);
    socket.position.set(0, -0.02, -0.03);
    eyeGroup.add(socket);

    const eyeball = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeball.position.set(0, 0.02, 0.04);
    eyeGroup.add(eyeball);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(0, 0.03, 0.212);

    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(0, 0, -0.02);
    pupil.add(iris);

    // Sparkling catchlight cluster ("mắt long lanh long lanh")
    const sparkleGroup = new THREE.Group();
    sparkleGroup.position.set(0, 0, 0.064);

    const mainGlint = new THREE.Mesh(primaryGlintGeo, sparklePureMat);
    mainGlint.position.set(side * 0.036, 0.04, 0.01);
    sparkleGroup.add(mainGlint);

    const subGlint = new THREE.Mesh(secondaryGlintGeo, sparkleWarmMat);
    subGlint.position.set(-side * 0.032, -0.03, 0.008);
    sparkleGroup.add(subGlint);

    const starCross = new THREE.Group();
    starCross.position.set(side * 0.036, 0.04, 0.025);
    const barH = new THREE.Mesh(starBarGeo, sparklePureMat);
    const barV = new THREE.Mesh(starBarGeo, sparklePureMat);
    barV.rotation.z = Math.PI / 2;
    starCross.add(barH, barV);
    sparkleGroup.add(starCross);

    pupil.add(sparkleGroup);
    eyeGroup.add(pupil);

    const eyelid = new THREE.Mesh(eyelidGeo, skinMat);
    eyelid.position.set(0, 0.02, 0.04);
    eyelid.rotation.x = -Math.PI * 0.65;
    eyeGroup.add(eyelid);

    headGroup.add(eyeGroup);
    return { pupil, eyelid, sparkleGroup };
  };

  const leftEye = createEye(-1);
  const rightEye = createEye(1);

  // 7. Articulated Lower Jaw + Round Cute Vocal Sac
  const jawGroup = new THREE.Group();
  jawGroup.position.set(0, -0.02, -0.05);
  headGroup.add(jawGroup);

  const lowerJawGeo = new THREE.SphereGeometry(0.44, 14, 10);
  lowerJawGeo.scale(1.2, 0.4, 1.08);
  const lowerJaw = new THREE.Mesh(lowerJawGeo, bellyMat);
  lowerJaw.position.set(0, -0.04, 0.14);
  jawGroup.add(lowerJaw);

  const vocalSacGeo = new THREE.SphereGeometry(0.3, 12, 10);
  const vocalSac = new THREE.Mesh(vocalSacGeo, bellyMat);
  vocalSac.position.set(0, -0.14, 0.19);
  vocalSac.scale.set(1, 0.55, 1);
  jawGroup.add(vocalSac);

  // 8. Extendable Pink Tongue
  const tongueGroup = new THREE.Group();
  tongueGroup.position.set(0, 0.0, 0.18);
  tongueGroup.visible = false;
  headGroup.add(tongueGroup);

  const shaftGeo = new THREE.CylinderGeometry(0.058, 0.046, 1, 8);
  shaftGeo.rotateX(Math.PI / 2);
  shaftGeo.translate(0, 0, 0.5);
  const tongueShaft = new THREE.Mesh(shaftGeo, tongueMat);
  tongueGroup.add(tongueShaft);

  const tipGeo = new THREE.SphereGeometry(0.13, 10, 8);
  const tongueTip = new THREE.Mesh(tipGeo, tongueMat);
  tongueGroup.add(tongueTip);

  // 9. Articulated Front Legs with Cute Chubby Paws (can wave & pat belly!)
  const frontLegGeo = new THREE.CapsuleGeometry(0.095, 0.32, 6, 8);
  const footGeo = new THREE.SphereGeometry(0.125, 8, 6);
  footGeo.scale(1.32, 0.38, 1.5);
  const toeGeo = new THREE.SphereGeometry(0.042, 6, 6);
  const bandGeo = new THREE.TorusGeometry(0.09, 0.018, 6, 10);
  bandGeo.rotateX(Math.PI / 2);

  const createFrontLeg = (side: -1 | 1) => {
    const fLeg = new THREE.Group();
    fLeg.position.set(side * 0.44, 0.37, 0.33);
    const arm = new THREE.Mesh(frontLegGeo, skinMat);
    arm.position.set(0, -0.15, 0.05);
    arm.rotation.x = -0.22;
    arm.rotation.z = side * -0.15;

    const band = new THREE.Mesh(bandGeo, spotMat);
    band.position.set(0, -0.14, 0.06);
    fLeg.add(band);

    const paw = new THREE.Mesh(footGeo, skinMat);
    paw.position.set(side * 0.04, -0.33, 0.14);

    [-0.075, 0, 0.075].forEach((tx) => {
      const toe = new THREE.Mesh(toeGeo, skinMat);
      toe.position.set(side * 0.04 + tx, -0.33, 0.28);
      fLeg.add(toe);
    });

    fLeg.add(arm, paw);
    bodyGroup.add(fLeg);
    return fLeg;
  };

  const leftFrontLeg = createFrontLeg(-1);
  const rightFrontLeg = createFrontLeg(1);

  // 10. Chubby Articulated Hind Legs with Transverse Bands
  const createHindLeg = (side: -1 | 1) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.49, 0.32, -0.16);

    const thighGeo = new THREE.SphereGeometry(0.25, 12, 10);
    thighGeo.scale(0.88, 1.22, 1.35);
    const thigh = new THREE.Mesh(thighGeo, skinMat);
    thigh.position.set(side * 0.08, 0.04, 0.05);
    thigh.rotation.z = side * 0.35;

    [-0.06, 0.09].forEach((zOff) => {
      const thighBandGeo = new THREE.SphereGeometry(0.14, 8, 6);
      thighBandGeo.scale(1.35, 0.32, 0.55);
      const tBand = new THREE.Mesh(thighBandGeo, spotMat);
      tBand.position.set(side * 0.12, 0.14, zOff);
      tBand.rotation.z = side * 0.35;
      legGroup.add(tBand);
    });

    const webFootGeo = new THREE.SphereGeometry(0.16, 10, 8);
    webFootGeo.scale(1.25, 0.32, 1.85);
    const webFoot = new THREE.Mesh(webFootGeo, skinMat);
    webFoot.position.set(side * 0.12, -0.26, 0.16);
    webFoot.rotation.y = side * -0.2;

    legGroup.add(thigh, webFoot);
    bodyGroup.add(legGroup);
    return legGroup;
  };

  const leftHindLeg = createHindLeg(-1);
  const rightHindLeg = createHindLeg(1);

  const rig: FrogRig = {
    root,
    bodyGroup,
    headGroup,
    jawGroup,
    vocalSac,
    leftCheek,
    rightCheek,
    headSproutGroup,
    leftPupil: leftEye.pupil,
    rightPupil: rightEye.pupil,
    leftSparkleGroup: leftEye.sparkleGroup,
    rightSparkleGroup: rightEye.sparkleGroup,
    leftEyelid: leftEye.eyelid,
    rightEyelid: rightEye.eyelid,
    leftFrontLeg,
    rightFrontLeg,
    leftHindLeg,
    rightHindLeg,
    tongueGroup,
    tongueShaft,
    tongueTip,
    hitProxy,
    skinMat,
    bellyMat,
    spotMat,
    stripeMat,
    paletteIndex: initialPaletteIdx,
  };

  hitProxy.userData.frogRig = rig;
  return rig;
}

let sharedLilyPadMat: THREE.MeshStandardMaterial | null = null;
function getSharedLilyPadMaterial(): THREE.MeshStandardMaterial {
  if (sharedLilyPadMat) return sharedLilyPadMat;
  sharedLilyPadMat = new THREE.MeshStandardMaterial({
    map: getLilyPadTexture(),
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.02,
  });
  return sharedLilyPadMat;
}

let sharedDewMat: THREE.MeshBasicMaterial | null = null;
function getSharedDewMaterial(): THREE.MeshBasicMaterial {
  if (sharedDewMat) return sharedDewMat;
  sharedDewMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.85,
  });
  return sharedDewMat;
}

/**
 * Creates a floating 3D Lotus Lily Pad optimized for integrated GPUs
 */
export function createLilyPadRig(
  radius: number,
  baseX: number,
  baseZ: number,
  seed: number
): LilyPadRig {
  const root = new THREE.Group();
  root.position.set(baseX, 0.04, baseZ);

  const padGroup = new THREE.Group();
  root.add(padGroup);

  const thetaLength = Math.PI * 1.88;
  const padGeo = new THREE.CylinderGeometry(
    radius,
    radius * 0.94,
    0.08,
    24,
    1,
    false,
    0.2,
    thetaLength
  );

  const posAttr = padGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const dist = Math.hypot(vx, vz) / radius;
    const angle = Math.atan2(vz, vx);
    const wave = Math.sin(angle * 9 + seed) * 0.028 * dist;
    const cup = dist * dist * 0.06;
    posAttr.setY(i, vy + cup + wave);
  }
  padGeo.computeVertexNormals();

  const padMesh = new THREE.Mesh(padGeo, getSharedLilyPadMaterial());
  padMesh.rotation.y = ((seed * 1.7) % 1.2) - 0.6;
  padGroup.add(padMesh);

  const dewGeo = new THREE.SphereGeometry(0.055, 6, 6);
  dewGeo.scale(1.15, 0.65, 1.15);
  const dewMat = getSharedDewMaterial();
  [0.8, 2.5].forEach((ang, dIdx) => {
    const rDist = radius * (0.58 + (dIdx % 2) * 0.16);
    const dew = new THREE.Mesh(dewGeo, dewMat);
    dew.position.set(
      Math.cos(ang + seed) * rDist,
      0.072,
      Math.sin(ang + seed) * rDist
    );
    padGroup.add(dew);
  });

  // Water ripple ring beneath lily pad
  const rippleGeo = new THREE.RingGeometry(radius * 0.96, radius * 1.14, 24);
  rippleGeo.rotateX(-Math.PI / 2);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rippleRing = new THREE.Mesh(rippleGeo, rippleMat);
  rippleRing.position.y = -0.02;
  root.add(rippleRing);

  return {
    root,
    padGroup,
    rippleRing,
    rippleMat,
    baseX,
    baseZ,
    radius,
    dipY: 0,
    dipVel: 0,
    ripplePhase: 0,
    phaseOffset: seed * 2.3,
  };
}

let sharedStandingLeafMat: THREE.MeshStandardMaterial | null = null;
/**
 * Creates a tall standing aerial Lotus Leaf (Lá sen vươn cao trên cuống)
 */
export function createStandingLotusLeaf(
  radius: number,
  stemHeight: number,
  tiltX: number,
  tiltZ: number
): THREE.Group {
  const group = new THREE.Group();

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.6,
  });
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, stemHeight, 6);
  stemGeo.translate(0, stemHeight * 0.5, 0);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  group.add(stem);

  const cupGeo = new THREE.CylinderGeometry(
    radius,
    radius * 0.25,
    radius * 0.32,
    20,
    2,
    false
  );
  const pos = cupGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const rRatio = Math.hypot(vx, vz) / radius;
    const ang = Math.atan2(vz, vx);
    const frill = Math.sin(ang * 9) * 0.08 * rRatio;
    pos.setY(i, vy * 0.45 + frill + rRatio * rRatio * 0.14);
  }
  cupGeo.computeVertexNormals();

  if (!sharedStandingLeafMat) {
    sharedStandingLeafMat = new THREE.MeshStandardMaterial({
      map: getLilyPadTexture(),
      roughness: 0.48,
      side: THREE.DoubleSide,
    });
  }
  const leaf = new THREE.Mesh(cupGeo, sharedStandingLeafMat);
  leaf.position.y = stemHeight;
  leaf.rotation.set(tiltX, 0, tiltZ);
  group.add(leaf);

  return group;
}

/**
 * Creates an articulated 3D Pond Fish optimized for integrated GPUs
 */
export function createFishRig(variantIndex: number): FishRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const fishColors = [
    { body: 0xf97316, fin: 0xfef08a, spot: 0xffffff },
    { body: 0xef4444, fin: 0xfde047, spot: 0xfef2f2 },
    { body: 0xfacc15, fin: 0xffffff, spot: 0xf97316 },
    { body: 0x38bdf8, fin: 0xe0f2fe, spot: 0xfacc15 },
  ];
  const palette = fishColors[variantIndex % fishColors.length];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: palette.body,
    roughness: 0.22,
    metalness: 0.2,
  });
  const spotMat = new THREE.MeshStandardMaterial({
    color: palette.spot,
    roughness: 0.25,
  });
  const finMat = new THREE.MeshBasicMaterial({
    color: palette.fin,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
  });

  const mainBodyGeo = new THREE.SphereGeometry(0.22, 12, 10);
  mainBodyGeo.scale(0.62, 0.85, 2.15);
  const mainBody = new THREE.Mesh(mainBodyGeo, bodyMat);
  bodyGroup.add(mainBody);

  const patchGeo = new THREE.SphereGeometry(0.14, 8, 6);
  patchGeo.scale(0.65, 0.5, 1.3);
  const patch = new THREE.Mesh(patchGeo, spotMat);
  patch.position.set(0, 0.11, 0.08);
  bodyGroup.add(patch);

  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 6, 6),
      eyeMat
    );
    eye.position.set(side * 0.1, 0.04, 0.34);
    bodyGroup.add(eye);
  });

  const dorsalGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
  dorsalGeo.scale(0.18, 1, 1.4);
  dorsalGeo.rotateX(-0.55);
  const dorsalFin = new THREE.Mesh(dorsalGeo, finMat);
  dorsalFin.position.set(0, 0.24, -0.05);
  bodyGroup.add(dorsalFin);

  const pecGeo = new THREE.SphereGeometry(0.14, 6, 6);
  pecGeo.scale(1.3, 0.08, 0.65);
  const leftPectoral = new THREE.Mesh(pecGeo, finMat);
  leftPectoral.position.set(-0.16, -0.06, 0.12);
  leftPectoral.rotation.z = -0.35;
  const rightPectoral = new THREE.Mesh(pecGeo, finMat);
  rightPectoral.position.set(0.16, -0.06, 0.12);
  rightPectoral.rotation.z = 0.35;
  bodyGroup.add(leftPectoral, rightPectoral);

  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0, -0.42);
  bodyGroup.add(tailGroup);

  const upperTailGeo = new THREE.SphereGeometry(0.18, 8, 6);
  upperTailGeo.scale(0.12, 1.15, 1.45);
  upperTailGeo.translate(0, 0.08, -0.18);
  upperTailGeo.rotateX(0.32);
  const upperTail = new THREE.Mesh(upperTailGeo, finMat);

  const lowerTailGeo = new THREE.SphereGeometry(0.15, 8, 6);
  lowerTailGeo.scale(0.12, 0.95, 1.25);
  lowerTailGeo.translate(0, -0.07, -0.16);
  lowerTailGeo.rotateX(-0.28);
  const lowerTail = new THREE.Mesh(lowerTailGeo, finMat);

  tailGroup.add(upperTail, lowerTail);

  return {
    root,
    bodyGroup,
    tailGroup,
    leftPectoral,
    rightPectoral,
  };
}

// Shared Insect Materials so 30–50 insects don't recompile shaders
const sharedInsectMats = {
  wingGlass: new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  dark: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
  }),
  eye: new THREE.MeshBasicMaterial({
    color: 0x0f172a,
  }),
  beeYellow: new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.35,
  }),
  dragonflyCyan: new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.25,
    metalness: 0.4,
  }),
  ladybugRed: new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.22,
  }),
  butterflyPink: new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.35,
    side: THREE.DoubleSide,
  }),
  butterflyAccent: new THREE.MeshBasicMaterial({
    color: 0xfef08a,
  }),
  flyBlue: new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.28,
    metalness: 0.4,
  }),
  flyEye: new THREE.MeshBasicMaterial({
    color: 0xf97316,
  }),
  beetleGreen: new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.22,
    metalness: 0.5,
  }),
};

/**
 * Creates 1 of 6 distinct 3D winged insects using shared materials and low-poly geometry
 */
export function createInsectRig(type: InsectType): InsectRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const leftWings: THREE.Object3D[] = [];
  const rightWings: THREE.Object3D[] = [];

  const wingGlassMat = sharedInsectMats.wingGlass;
  const darkMat = sharedInsectMats.dark;
  const eyeMat = sharedInsectMats.eye;

  if (type === 'bee') {
    const bodyGeo = new THREE.SphereGeometry(0.24, 10, 8);
    bodyGeo.scale(0.95, 0.88, 1.35);
    const body = new THREE.Mesh(bodyGeo, sharedInsectMats.beeYellow);
    bodyGroup.add(body);

    [-0.1, 0.08].forEach((zOff) => {
      const stripeGeo = new THREE.CylinderGeometry(0.235, 0.235, 0.08, 10);
      stripeGeo.rotateX(Math.PI / 2);
      const stripe = new THREE.Mesh(stripeGeo, darkMat);
      stripe.position.z = zOff;
      bodyGroup.add(stripe);
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), darkMat);
    head.position.set(0, 0.03, 0.28);
    bodyGroup.add(head);

    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeMat);
      eye.position.set(side * 0.1, 0.06, 0.36);
      bodyGroup.add(eye);

      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.14, 0.18, 0.04);
      const wingGeo = new THREE.SphereGeometry(0.22, 8, 6);
      wingGeo.scale(1.3, 0.08, 0.65);
      wingGeo.translate(side * 0.2, 0, 0);
      const wing = new THREE.Mesh(wingGeo, wingGlassMat);
      wingPivot.add(wing);
      bodyGroup.add(wingPivot);
      if (side < 0) leftWings.push(wingPivot);
      else rightWings.push(wingPivot);
    });
  } else if (type === 'dragonfly') {
    const cyanMat = sharedInsectMats.dragonflyCyan;
    const thorax = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      cyanMat
    );
    thorax.scale.set(0.9, 0.9, 1.3);
    bodyGroup.add(thorax);

    const tailGeo = new THREE.CylinderGeometry(0.05, 0.025, 0.68, 8);
    tailGeo.rotateX(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeo, cyanMat);
    tail.position.set(0, 0, -0.45);
    bodyGroup.add(tail);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), cyanMat);
    head.position.set(0, 0.04, 0.22);
    bodyGroup.add(head);

    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), eyeMat);
      eye.position.set(side * 0.09, 0.07, 0.26);
      bodyGroup.add(eye);

      [0.06, -0.08].forEach((zPos) => {
        const wingPivot = new THREE.Group();
        wingPivot.position.set(side * 0.1, 0.12, zPos);
        const wingGeo = new THREE.SphereGeometry(0.28, 8, 6);
        wingGeo.scale(1.6, 0.05, 0.32);
        wingGeo.translate(side * 0.34, 0, 0);
        const wing = new THREE.Mesh(wingGeo, wingGlassMat);
        wingPivot.add(wing);
        bodyGroup.add(wingPivot);
        if (side < 0) leftWings.push(wingPivot);
        else rightWings.push(wingPivot);
      });
    });
  } else if (type === 'ladybug') {
    const shellGeo = new THREE.SphereGeometry(
      0.26,
      12,
      8,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.62
    );
    shellGeo.scale(1.05, 0.9, 1.18);
    const shell = new THREE.Mesh(shellGeo, sharedInsectMats.ladybugRed);
    shell.position.y = -0.04;
    bodyGroup.add(shell);

    const underbelly = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.06, 10),
      darkMat
    );
    underbelly.position.y = -0.04;
    bodyGroup.add(underbelly);

    const spotGeo = new THREE.SphereGeometry(0.055, 6, 6);
    [
      [-0.12, 0.17, 0.05],
      [0.12, 0.17, 0.05],
      [-0.1, 0.15, -0.14],
      [0.1, 0.15, -0.14],
      [0, 0.21, -0.04],
    ].forEach(([x, y, z]) => {
      const s = new THREE.Mesh(spotGeo, darkMat);
      s.position.set(x, y, z);
      bodyGroup.add(s);
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), darkMat);
    head.position.set(0, 0.0, 0.26);
    bodyGroup.add(head);

    [-1, 1].forEach((side) => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.12, 0.12, -0.02);
      const wingGeo = new THREE.SphereGeometry(0.22, 8, 6);
      wingGeo.scale(1.3, 0.06, 0.58);
      wingGeo.translate(side * 0.22, 0, 0);
      const wing = new THREE.Mesh(wingGeo, wingGlassMat);
      wingPivot.add(wing);
      bodyGroup.add(wingPivot);
      if (side < 0) leftWings.push(wingPivot);
      else rightWings.push(wingPivot);
    });
  } else if (type === 'butterfly') {
    const wingMat = sharedInsectMats.butterflyPink;
    const accentMat = sharedInsectMats.butterflyAccent;

    const bodyGeo = new THREE.CapsuleGeometry(0.055, 0.38, 5, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, darkMat);
    bodyGroup.add(body);

    [-1, 1].forEach((side) => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.05, 0.05, 0);

      const foreWingGeo = new THREE.SphereGeometry(0.26, 8, 6);
      foreWingGeo.scale(1.35, 0.06, 0.95);
      foreWingGeo.translate(side * 0.28, 0, 0.08);
      const foreWing = new THREE.Mesh(foreWingGeo, wingMat);

      const hindWingGeo = new THREE.SphereGeometry(0.2, 8, 6);
      hindWingGeo.scale(1.15, 0.06, 0.85);
      hindWingGeo.translate(side * 0.22, -0.01, -0.14);
      const hindWing = new THREE.Mesh(hindWingGeo, wingMat);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 6, 6),
        accentMat
      );
      dot.scale.set(1, 0.3, 1);
      dot.position.set(side * 0.32, 0.02, 0.09);

      wingPivot.add(foreWing, hindWing, dot);
      bodyGroup.add(wingPivot);
      if (side < 0) leftWings.push(wingPivot);
      else rightWings.push(wingPivot);
    });
  } else if (type === 'fly') {
    const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
    bodyGeo.scale(1.0, 0.9, 1.2);
    const body = new THREE.Mesh(bodyGeo, sharedInsectMats.flyBlue);
    bodyGroup.add(body);

    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6),
        sharedInsectMats.flyEye
      );
      eye.position.set(side * 0.1, 0.07, 0.22);
      bodyGroup.add(eye);

      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.12, 0.16, 0.0);
      const wingGeo = new THREE.SphereGeometry(0.21, 8, 6);
      wingGeo.scale(1.3, 0.07, 0.65);
      wingGeo.translate(side * 0.2, 0, -0.04);
      const wing = new THREE.Mesh(wingGeo, wingGlassMat);
      wingPivot.add(wing);
      bodyGroup.add(wingPivot);
      if (side < 0) leftWings.push(wingPivot);
      else rightWings.push(wingPivot);
    });
  } else {
    const beetleMat = sharedInsectMats.beetleGreen;
    const shellGeo = new THREE.SphereGeometry(0.25, 10, 8);
    shellGeo.scale(0.95, 0.82, 1.3);
    const shell = new THREE.Mesh(shellGeo, beetleMat);
    bodyGroup.add(shell);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      beetleMat
    );
    head.position.set(0, 0.0, 0.28);
    bodyGroup.add(head);

    const hornGeo = new THREE.ConeGeometry(0.04, 0.18, 6);
    hornGeo.rotateX(Math.PI * 0.35);
    const horn = new THREE.Mesh(hornGeo, darkMat);
    horn.position.set(0, 0.08, 0.38);
    bodyGroup.add(horn);

    [-1, 1].forEach((side) => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.12, 0.14, 0.0);
      const wingGeo = new THREE.SphereGeometry(0.22, 8, 6);
      wingGeo.scale(1.3, 0.07, 0.6);
      wingGeo.translate(side * 0.22, 0, 0);
      const wing = new THREE.Mesh(wingGeo, wingGlassMat);
      wingPivot.add(wing);
      bodyGroup.add(wingPivot);
      if (side < 0) leftWings.push(wingPivot);
      else rightWings.push(wingPivot);
    });
  }

  return {
    root,
    bodyGroup,
    leftWings,
    rightWings,
    type,
  };
}

/**
 * Creates a lightweight 3D Lotus Flower for the pond background
 */
export function createLotusFlower(isPink: boolean, scale = 1): THREE.Group {
  const group = new THREE.Group();
  const outerPetalMat = new THREE.MeshStandardMaterial({
    color: isPink ? 0xf472b6 : 0xf8fafc,
    roughness: 0.38,
  });
  const innerPetalMat = new THREE.MeshStandardMaterial({
    color: isPink ? 0xfbcfe8 : 0xffffff,
    roughness: 0.32,
  });
  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.45,
  });

  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.12, 0.2, 10),
    centerMat
  );
  center.position.y = 0.13;
  group.add(center);

  const petalGeo = new THREE.SphereGeometry(0.19, 8, 6);
  petalGeo.scale(0.62, 1.5, 0.26);

  const rings = [
    { count: 8, radius: 0.29, tilt: 0.78, y: 0.12, mat: outerPetalMat },
    { count: 6, radius: 0.21, tilt: 0.52, y: 0.17, mat: innerPetalMat },
  ];

  rings.forEach((ring, rIdx) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + rIdx * 0.35;
      const pPivot = new THREE.Group();
      pPivot.rotation.y = angle;
      const petal = new THREE.Mesh(petalGeo, ring.mat);
      petal.position.set(0, ring.y, ring.radius);
      petal.rotation.x = ring.tilt;
      pPivot.add(petal);
      group.add(pPivot);
    }
  });

  group.scale.setScalar(scale);
  return group;
}
