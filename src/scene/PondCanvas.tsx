import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  FrogAnimState,
  GamePhase,
  InsectType,
  RoundPlan,
  StudentStatus,
} from '../game/types';
import {
  applyFrogPalette,
  createFishRig,
  createFrogRig,
  createInsectRig,
  createLilyPadRig,
  createLotusFlower,
  createStandingLotusLeaf,
  FishRig,
  FROG_PALETTES,
  FrogRig,
  InsectRig,
  LilyPadRig,
} from './proceduralModels';
import {
  createBluePondWaterTexture,
  createBrightDaylightSkyTexture,
  createPatrolDragonflyRig,
  createRollingSnailRig,
  PatrolDragonflyRig,
  RollingSnailRig,
} from './pondCritters';
import { audioManager } from '../audio/AudioManager';

interface PondCanvasProps {
  phase: GamePhase;
  frogCount: number;
  frogPalettes: number[];
  roundPlan: RoundPlan | null;
  onTickTimer: (remainingMs: number) => void;
  onRemainingCountChange: (remaining: number) => void;
  onRoundRevealStart: () => void;
  onRoundComplete: () => void;
  onFrogColorChanged: (
    frogIndex: number,
    nextPaletteIndex: number,
    paletteName: string,
    hexCss: string
  ) => void;
}

interface ActiveFrogActor {
  index: number;
  rig: FrogRig;
  padIndex: number;
  targetPadIndex: number;
  state: FrogAnimState;
  stateTimer: number;
  stateDuration: number;
  blinkTimer: number;
  isBlinking: boolean;
  croakCooldown: number;
  hopCooldown: number;
  snailSnackCooldown: number;
  cuteWiggleTimer: number;
  cuteWiggleCooldown: number;
  lookTargetPos: THREE.Vector3;
  currentLookPos: THREE.Vector3;
  targetStudentId: string | null;
  targetSnailIndex: number | null;
  jumpPreyFlyerIndex: number | null;
  jumpPreyStudentId: string | null;
  hasSnappedJumpPrey: boolean;
  jumpStartPos: THREE.Vector3;
  jumpApexPos: THREE.Vector3;
  jumpEndPos: THREE.Vector3;
  jumpYaw: number;
}

interface ActiveFishActor {
  index: number;
  rig: FishRig;
  state: 'SWIMMING' | 'LEAPING';
  stateTimer: number;
  stateDuration: number;
  swimAngle: number;
  swimRadiusX: number;
  swimRadiusZ: number;
  swimCenterX: number;
  swimCenterZ: number;
  swimSpeed: number;
  leapCooldown: number;
  leapStartPos: THREE.Vector3;
  leapApexPos: THREE.Vector3;
  leapEndPos: THREE.Vector3;
  targetStudentId: string | null;
  hasSnappedPrey: boolean;
}

interface ActiveDragonflyActor {
  index: number;
  rig: PatrolDragonflyRig;
  state: 'PATROL_ACROSS' | 'HOVERING' | 'EATEN_RESPAWN';
  stateTimer: number;
  stateDuration: number;
  startPos: THREE.Vector3;
  controlPos: THREE.Vector3;
  endPos: THREE.Vector3;
  wingPhase: number;
  trailTimer: number;
  flairColorHex: string;
}

interface ActiveSnailActor {
  index: number;
  rig: RollingSnailRig;
  padIndex: number;
  state: 'ROLLING' | 'PEEKING' | 'CAUGHT_BY_FROG' | 'RESPAWNING';
  stateTimer: number;
  orbitAngle: number;
  orbitRadius: number;
  rollSpeed: number;
  caughtStartPos: THREE.Vector3;
}

interface ActiveInsectActor {
  id: string;
  name: string;
  type: InsectType;
  status: StudentStatus;
  isWinner: boolean;
  rig: InsectRig;
  pos: THREE.Vector3;
  homePos: THREE.Vector3;
  vel: THREE.Vector3;
  seed: number;
  freqX: number;
  freqY: number;
  freqZ: number;
  ampX: number;
  ampY: number;
  ampZ: number;
  wingPhase: number;
  caughtProgress: number;
  caughtStartPos: THREE.Vector3;
  caughtMouthPos: THREE.Vector3;
  labelEl: HTMLDivElement | null;
}

interface CatchParticleBurst {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  age: number;
  maxAge: number;
  isWaterSplash?: boolean;
}

// Pre-allocated math scratch objects outside the render loop (Zero GC)
const _projVec = new THREE.Vector3();
const _worldMouthPos = new THREE.Vector3();
const _localTargetPos = new THREE.Vector3();
const _diffVec = new THREE.Vector3();
const _tempVec = new THREE.Vector3();
const _tempVec2 = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _pointerNdc = new THREE.Vector2();

const INSECT_BADGE_COLORS: Record<InsectType, string> = {
  bee: '#facc15',
  dragonfly: '#22d3ee',
  ladybug: '#f87171',
  butterfly: '#f472b6',
  fly: '#60a5fa',
  beetle: '#34d399',
};

function computeLilyPadLayout(
  count: number
): { x: number; z: number; radius: number }[] {
  const clamped = Math.max(1, Math.min(8, count));
  if (clamped === 1) {
    return [{ x: 0, z: 2.7, radius: 1.42 }];
  }
  if (clamped === 2) {
    return [
      { x: -2.85, z: 2.6, radius: 1.3 },
      { x: 2.85, z: 2.6, radius: 1.3 },
    ];
  }
  if (clamped === 3) {
    return [
      { x: -4.15, z: 2.35, radius: 1.24 },
      { x: 0, z: 2.85, radius: 1.28 },
      { x: 4.15, z: 2.35, radius: 1.24 },
    ];
  }
  if (clamped <= 5) {
    const result: { x: number; z: number; radius: number }[] = [];
    const span = clamped === 4 ? 9.6 : 11.2;
    for (let i = 0; i < clamped; i++) {
      const t = i / (clamped - 1) - 0.5;
      const x = t * span;
      const z = 2.8 - Math.abs(t) * 1.1 + (i % 2 === 0 ? 0.15 : -0.15);
      result.push({ x, z, radius: clamped === 4 ? 1.14 : 1.04 });
    }
    return result;
  }

  const result: { x: number; z: number; radius: number }[] = [];
  const span = 12.2;
  for (let i = 0; i < clamped; i++) {
    const t = i / (clamped - 1) - 0.5;
    const x = t * span;
    const isFrontRow = i % 2 === 0;
    const z = (isFrontRow ? 3.15 : 1.55) - Math.abs(t) * 0.65;
    result.push({ x, z, radius: 0.96 });
  }
  return result;
}

function computeSteppingStonePads(
  count: number
): { x: number; z: number; radius: number }[] {
  if (count === 1) {
    return [
      { x: -2.8, z: 2.25, radius: 1.15 },
      { x: 2.8, z: 2.25, radius: 1.15 },
    ];
  }
  if (count === 2) {
    return [
      { x: 0, z: 2.95, radius: 1.18 },
      { x: -1.65, z: 1.35, radius: 1.05 },
      { x: 1.65, z: 1.35, radius: 1.05 },
    ];
  }
  if (count <= 5) {
    return [
      { x: -2.3, z: 1.25, radius: 1.02 },
      { x: 0, z: 1.15, radius: 1.04 },
      { x: 2.3, z: 1.25, radius: 1.02 },
    ];
  }
  return [
    { x: -3.2, z: 0.65, radius: 0.92 },
    { x: 0, z: 0.55, radius: 0.94 },
    { x: 3.2, z: 0.65, radius: 0.92 },
  ];
}

export const PondCanvas: React.FC<PondCanvasProps> = ({
  phase,
  frogCount,
  frogPalettes,
  roundPlan,
  onTickTimer,
  onRemainingCountChange,
  onRoundRevealStart,
  onRoundComplete,
  onFrogColorChanged,
}) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);

  const phaseRef = useRef<GamePhase>(phase);
  const frogCountRef = useRef<number>(frogCount);
  const frogPalettesRef = useRef<number[]>(frogPalettes);
  const roundPlanRef = useRef<RoundPlan | null>(roundPlan);

  const callbacksRef = useRef({
    onTickTimer,
    onRemainingCountChange,
    onRoundRevealStart,
    onRoundComplete,
    onFrogColorChanged,
  });
  callbacksRef.current = {
    onTickTimer,
    onRemainingCountChange,
    onRoundRevealStart,
    onRoundComplete,
    onFrogColorChanged,
  };

  const timerStateRef = useRef({
    totalDurationMs: 15000,
    deadlineMs: 0,
    remainingMsOnPause: 15000,
    elapsedMs: 0,
    roundFinalized: false,
    revealStartedAtMs: 0,
    lastReportedRemainingBucket: -1,
    lastReportedStudentCount: -1,
  });

  const sceneActorsRef = useRef<{
    scene: THREE.Scene | null;
    FrogsGroup: THREE.Group | null;
    FishGroup: THREE.Group | null;
    DragonflyGroup: THREE.Group | null;
    SnailGroup: THREE.Group | null;
    InsectsGroup: THREE.Group | null;
    EffectsGroup: THREE.Group | null;
    lilyPads: LilyPadRig[];
    frogs: ActiveFrogActor[];
    fishes: ActiveFishActor[];
    dragonflies: ActiveDragonflyActor[];
    snails: ActiveSnailActor[];
    insects: ActiveInsectActor[];
    bursts: CatchParticleBurst[];
    keyLight: THREE.DirectionalLight | null;
    camera: THREE.PerspectiveCamera | null;
    rebuildFrogsAndPads: ((count: number) => void) | null;
    spawnRoundInsects: ((plan: RoundPlan | null) => void) | null;
    syncFrogPalettes: ((palettes: number[]) => void) | null;
  }>({
    scene: null,
    FrogsGroup: null,
    FishGroup: null,
    DragonflyGroup: null,
    SnailGroup: null,
    InsectsGroup: null,
    EffectsGroup: null,
    lilyPads: [],
    frogs: [],
    fishes: [],
    dragonflies: [],
    snails: [],
    insects: [],
    bursts: [],
    keyLight: null,
    camera: null,
    rebuildFrogsAndPads: null,
    spawnRoundInsects: null,
    syncFrogPalettes: null,
  });

  // Sync phase transitions
  useEffect(() => {
    const prevPhase = phaseRef.current;
    phaseRef.current = phase;
    const tState = timerStateRef.current;

    if (phase === 'PLAYING' && prevPhase !== 'PLAYING') {
      if (prevPhase === 'PAUSED') {
        tState.deadlineMs = performance.now() + tState.remainingMsOnPause;
      } else if (roundPlanRef.current) {
        const durMs = roundPlanRef.current.durationSec * 1000;
        tState.totalDurationMs = durMs;
        tState.remainingMsOnPause = durMs;
        tState.deadlineMs = performance.now() + durMs;
        tState.elapsedMs = 0;
        tState.roundFinalized = false;
        tState.revealStartedAtMs = 0;
        tState.lastReportedRemainingBucket = -1;
      }
    } else if (phase === 'PAUSED' && prevPhase === 'PLAYING') {
      tState.remainingMsOnPause = Math.max(
        0,
        tState.deadlineMs - performance.now()
      );
    } else if (phase === 'SETUP') {
      tState.roundFinalized = false;
      if (sceneActorsRef.current.spawnRoundInsects) {
        sceneActorsRef.current.spawnRoundInsects(null);
      }
    }
  }, [phase]);

  // Rebuild frogs & lily pads when frogCount changes
  useEffect(() => {
    frogCountRef.current = frogCount;
    if (sceneActorsRef.current.rebuildFrogsAndPads) {
      sceneActorsRef.current.rebuildFrogsAndPads(frogCount);
    }
  }, [frogCount]);

  // Sync frog palettes when updated from UI or click
  useEffect(() => {
    frogPalettesRef.current = frogPalettes;
    if (sceneActorsRef.current.syncFrogPalettes) {
      sceneActorsRef.current.syncFrogPalettes(frogPalettes);
    }
  }, [frogPalettes]);

  // Spawn insects when a new RoundPlan is created
  useEffect(() => {
    roundPlanRef.current = roundPlan;
    if (roundPlan && sceneActorsRef.current.spawnRoundInsects) {
      const durMs = roundPlan.durationSec * 1000;
      const tState = timerStateRef.current;
      tState.totalDurationMs = durMs;
      tState.remainingMsOnPause = durMs;
      tState.deadlineMs = performance.now() + durMs;
      tState.elapsedMs = 0;
      tState.roundFinalized = false;
      tState.revealStartedAtMs = 0;
      tState.lastReportedRemainingBucket = -1;
      tState.lastReportedStudentCount = roundPlan.students.length;

      if (
        sceneActorsRef.current.rebuildFrogsAndPads &&
        sceneActorsRef.current.frogs.length !== roundPlan.frogCount
      ) {
        sceneActorsRef.current.rebuildFrogsAndPads(roundPlan.frogCount);
      }
      sceneActorsRef.current.spawnRoundInsects(roundPlan);
    }
  }, [roundPlan]);

  // Main WebGL initialization
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const gpuInfo = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return { isSoftware: true, isIntegrated: true };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return {
        isSoftware: /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(
          gpu
        ),
        isIntegrated:
          /Intel|Iris|UHD|HD Graphics|Radeon.*Graphics|Vega|Mali|Adreno/i.test(
            gpu
          ),
      };
    })();
    const isSoftwareGl = gpuInfo.isSoftware;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // +15% brighter, natural daylight exposure
    renderer.toneMappingExposure = 1.26;

    let currentPixelRatio = isSoftwareGl
      ? 1
      : gpuInfo.isIntegrated
      ? Math.min(window.devicePixelRatio, 1.1)
      : Math.min(window.devicePixelRatio, 1.25);

    renderer.setPixelRatio(currentPixelRatio);
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.shadowMap.enabled = false;
    mountEl.appendChild(renderer.domElement);

    // Scene with +15% Brighter Natural Daylight Sky & Reflection Texture
    const scene = new THREE.Scene();
    const skyEnvTexture = createBrightDaylightSkyTexture();
    scene.background = skyEnvTexture;
    scene.environment = skyEnvTexture;
    scene.fog = new THREE.FogExp2(0x2176ae, 0.014);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      43,
      mountEl.clientWidth / mountEl.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 5.25, 13.8);
    camera.lookAt(0, 1.85, 0);

    // 3-Point Natural Daylight Lighting Rig (+15% brighter sky fill)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0c4a6e, 1.22);
    hemiLight.position.set(0, 22, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.05);
    keyLight.position.set(7.5, 15, 9.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.92);
    rimLight.position.set(-8.5, 9.5, -7.5);
    scene.add(rimLight);

    // Crystal-Clear Blue Pond Water Surface ("cảnh nước ở dưới là màu xanh dương")
    const waterTexture = createBluePondWaterTexture(renderer);
    const waterGeo = new THREE.PlaneGeometry(64, 44, 24, 18);
    waterGeo.rotateX(-Math.PI / 2);

    const waterUniforms = {
      uTime: { value: 0 },
    };
    const waterMat = new THREE.MeshStandardMaterial({
      map: waterTexture,
      color: 0x0288d1,
      roughness: 0.2,
      metalness: 0.14,
    });
    waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waterUniforms.uTime;
      shader.vertexShader =
        `uniform float uTime;\n` +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float wave1 = sin(transformed.x * 0.72 + uTime * 2.2) * cos(transformed.z * 0.65 + uTime * 1.6) * 0.048;
          float wave2 = sin((transformed.x - transformed.z) * 1.35 - uTime * 2.6) * 0.025;
          transformed.y += wave1 + wave2;
          `
        );
    };

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterMesh);

    // ====================================================================
    // DECORATIVE ENVIRONMENT: FLOATING PADS, STANDING AERIAL LOTUS LEAVES,
    // LOTUS FLOWERS, BAMBOO WATERFALL STREAM, REEDS, ROCKS & FIREFLIES
    // ====================================================================
    const decorGroup = new THREE.Group();
    scene.add(decorGroup);

    const bgPads = [
      { x: -7.6, z: -2.1, r: 1.18, flower: true, pink: true },
      { x: -5.3, z: -4.2, r: 1.0, flower: false, pink: false },
      { x: -2.1, z: -4.9, r: 1.26, flower: true, pink: false },
      { x: 2.3, z: -4.7, r: 1.2, flower: true, pink: true },
      { x: 5.7, z: -3.9, r: 0.96, flower: false, pink: false },
      { x: 7.9, z: -1.9, r: 1.2, flower: true, pink: true },
      { x: -8.7, z: 1.4, r: 0.92, flower: false, pink: false },
      { x: 8.7, z: 1.5, r: 0.92, flower: false, pink: false },
    ];
    bgPads.forEach((bp, idx) => {
      const rig = createLilyPadRig(bp.r, bp.x, bp.z, idx + 20);
      decorGroup.add(rig.root);
      if (bp.flower) {
        const lotus = createLotusFlower(bp.pink, 1.1);
        lotus.position.set(bp.x + 0.15, 0.08, bp.z - 0.1);
        decorGroup.add(lotus);
      }
    });

    // Tall Standing Aerial Lotus Leaves
    const standingLeaves: THREE.Group[] = [];
    const standingSpecs = [
      { x: -8.2, z: -3.2, r: 0.95, h: 1.65, tx: 0.12, tz: -0.14 },
      { x: -6.4, z: -4.8, r: 1.08, h: 1.95, tx: 0.15, tz: 0.1 },
      { x: -3.5, z: -5.3, r: 0.88, h: 1.45, tx: 0.08, tz: -0.12 },
      { x: 3.6, z: -5.2, r: 1.02, h: 1.85, tx: 0.14, tz: 0.12 },
      { x: 6.8, z: -4.5, r: 0.92, h: 1.55, tx: 0.1, tz: 0.16 },
      { x: 8.5, z: -2.9, r: 1.06, h: 1.78, tx: 0.12, tz: 0.14 },
    ];
    standingSpecs.forEach((sp) => {
      const leaf = createStandingLotusLeaf(sp.r, sp.h, sp.tx, sp.tz);
      leaf.position.set(sp.x, -0.05, sp.z);
      decorGroup.add(leaf);
      standingLeaves.push(leaf);
    });

    // Flowing Bamboo & Rock Waterfall Stream at Back Left Bank
    const streamGroup = new THREE.Group();
    streamGroup.position.set(-4.6, 0, -5.4);
    streamGroup.rotation.y = 0.35;
    decorGroup.add(streamGroup);

    const streamRockGeo = new THREE.DodecahedronGeometry(0.62, 0);
    const streamRockMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.78,
      metalness: 0.08,
    });
    [
      [-0.7, 0.35, -0.3, 1.3, 0.85, 1.1],
      [0.7, 0.4, -0.25, 1.25, 0.9, 1.15],
      [0, 0.85, -0.75, 1.5, 1.1, 1.2],
      [-0.45, 0.15, 0.3, 0.9, 0.55, 0.85],
      [0.5, 0.15, 0.35, 0.85, 0.5, 0.8],
    ].forEach(([rx, ry, rz, sx, sy, sz]) => {
      const rMesh = new THREE.Mesh(streamRockGeo, streamRockMat);
      rMesh.position.set(rx, ry, rz);
      rMesh.scale.set(sx, sy, sz);
      streamGroup.add(rMesh);
    });

    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.45,
    });
    const bambooSpout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.15, 1.45, 8),
      bambooMat
    );
    bambooSpout.position.set(0, 1.18, -0.45);
    bambooSpout.rotation.x = Math.PI * 0.38;
    streamGroup.add(bambooSpout);

    const waterfallMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const waterfallGeo = new THREE.CylinderGeometry(
      0.09,
      0.24,
      1.15,
      8,
      2,
      true
    );
    const waterfallMesh = new THREE.Mesh(waterfallGeo, waterfallMat);
    waterfallMesh.position.set(0, 0.48, 0.22);
    waterfallMesh.rotation.x = 0.28;
    streamGroup.add(waterfallMesh);

    const streamDropCount = 20;
    const streamDropPos = new Float32Array(streamDropCount * 3);
    for (let i = 0; i < streamDropCount; i++) {
      const progress = i / streamDropCount;
      streamDropPos[i * 3] = -4.6 + (Math.random() - 0.5) * 0.45;
      streamDropPos[i * 3 + 1] = (1 - progress) * 1.05;
      streamDropPos[i * 3 + 2] = -5.15 + progress * 0.55;
    }
    const streamDropGeo = new THREE.BufferGeometry();
    streamDropGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(streamDropPos, 3)
    );
    const streamDropMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const streamDrops = new THREE.Points(streamDropGeo, streamDropMat);
    decorGroup.add(streamDrops);

    // Instanced Reeds + Cattail Heads (24 stalks)
    const reedCount = 24;
    const stalkGeo = new THREE.CylinderGeometry(0.032, 0.055, 2.9, 6);
    stalkGeo.translate(0, 1.45, 0);
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
    });
    const reedInstanced = new THREE.InstancedMesh(
      stalkGeo,
      stalkMat,
      reedCount
    );

    const cattailGeo = new THREE.CapsuleGeometry(0.068, 0.42, 4, 6);
    cattailGeo.translate(0, 2.35, 0);
    const cattailMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.85,
    });
    const cattailInstanced = new THREE.InstancedMesh(
      cattailGeo,
      cattailMat,
      reedCount
    );

    for (let i = 0; i < reedCount; i++) {
      const side = i < reedCount / 2 ? -1 : 1;
      const localIdx = i % (reedCount / 2);
      const rx = side * (6.2 + (localIdx % 6) * 0.85 + Math.sin(i) * 0.3);
      const rz = -3.8 - Math.floor(localIdx / 6) * 1.1 + Math.cos(i) * 0.3;
      _dummyObj.position.set(rx, -0.1, rz);
      _dummyObj.rotation.set(
        (Math.sin(i * 1.7) - 0.5) * 0.12,
        i * 0.5,
        (Math.cos(i * 2.3) - 0.5) * 0.15
      );
      const s = 0.78 + (i % 4) * 0.12;
      _dummyObj.scale.set(s, s, s);
      _dummyObj.updateMatrix();
      reedInstanced.setMatrixAt(i, _dummyObj.matrix);
      cattailInstanced.setMatrixAt(i, _dummyObj.matrix);
    }
    reedInstanced.computeBoundingSphere();
    cattailInstanced.computeBoundingSphere();
    decorGroup.add(reedInstanced, cattailInstanced);

    // Shore stones
    [
      [-9.5, -3.5, 1.4],
      [-7.2, -5.4, 1.15],
      [7.4, -5.2, 1.25],
      [9.6, -3.4, 1.5],
    ].forEach(([rx, rz, rs]) => {
      const rock = new THREE.Mesh(streamRockGeo, streamRockMat);
      rock.position.set(rx, 0.05, rz);
      rock.scale.set(rs * 1.3, rs * 0.65, rs);
      decorGroup.add(rock);
    });

    // Ambient distant fireflies above background lotus flowers
    const fireflyCount = 16;
    const fireflyPos = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPos[i * 3] = (Math.random() - 0.5) * 18;
      fireflyPos[i * 3 + 1] = 0.6 + Math.random() * 2.4;
      fireflyPos[i * 3 + 2] = -2.2 - Math.random() * 3.8;
    }
    const fireflyGeo = new THREE.BufferGeometry();
    fireflyGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(fireflyPos, 3)
    );
    const fireflyMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.13,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    decorGroup.add(fireflies);

    // Dynamic Groups
    const FrogsGroup = new THREE.Group();
    const FishGroup = new THREE.Group();
    const DragonflyGroup = new THREE.Group();
    const SnailGroup = new THREE.Group();
    const InsectsGroup = new THREE.Group();
    const EffectsGroup = new THREE.Group();
    scene.add(
      FrogsGroup,
      FishGroup,
      DragonflyGroup,
      SnailGroup,
      InsectsGroup,
      EffectsGroup
    );

    const actors = sceneActorsRef.current;
    actors.scene = scene;
    actors.FrogsGroup = FrogsGroup;
    actors.FishGroup = FishGroup;
    actors.DragonflyGroup = DragonflyGroup;
    actors.SnailGroup = SnailGroup;
    actors.InsectsGroup = InsectsGroup;
    actors.EffectsGroup = EffectsGroup;
    actors.keyLight = keyLight;
    actors.camera = camera;

    // Shared ring geometries for bursts/splashes (zero runtime geometry allocation)
    const sharedSplashRingGeo = new THREE.RingGeometry(0.18, 0.36, 20);
    const sharedSparkleRingGeo = new THREE.RingGeometry(0.14, 0.28, 20);

    // Helper: Spawn celebratory sparkle ring burst or water splash ring
    const spawnCatchBurst = (
      worldPos: THREE.Vector3,
      colorHex: string,
      isWaterSplash = false
    ) => {
      const geo = isWaterSplash ? sharedSplashRingGeo : sharedSparkleRingGeo;
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(worldPos);
      if (isWaterSplash) {
        mesh.position.y = 0.03;
        mesh.rotation.x = -Math.PI / 2;
      } else {
        mesh.lookAt(camera.position);
      }
      EffectsGroup.add(mesh);
      actors.bursts.push({
        mesh,
        mat,
        age: 0,
        maxAge: isWaterSplash ? 0.65 : 0.42,
        isWaterSplash,
      });
    };

    // ====================================================================
    // SPAWN 4 WILD FLYERS (DRAGONFLIES "CHUỒN CHUỒN" & HONEYBEES "ONG MẬT")
    // THAT FLY OVER THE POND SO FROGS CAN LEAP UP AND EAT THEM MID-AIR!
    // ====================================================================
    actors.dragonflies = [];
    const dfFlairColors = ['#38bdf8', '#fde047', '#fca5a5', '#fde047'];
    for (let dIdx = 0; dIdx < 4; dIdx++) {
      const dfRig = createPatrolDragonflyRig(dIdx);
      dfRig.root.scale.setScalar(dIdx % 2 === 1 ? 0.98 : 1.08);
      const startX = dIdx % 2 === 0 ? -8.5 : 8.5;
      const startY = 1.35 + (dIdx % 3) * 0.35;
      const startZ = 0.6 + (dIdx % 3) * 1.05;
      dfRig.root.position.set(startX, startY, startZ);
      DragonflyGroup.add(dfRig.root);

      actors.dragonflies.push({
        index: dIdx,
        rig: dfRig,
        state: 'PATROL_ACROSS',
        stateTimer: dIdx * 0.95,
        stateDuration: 3.6 + dIdx * 0.55,
        startPos: new THREE.Vector3(startX, startY, startZ),
        controlPos: new THREE.Vector3(
          (dIdx - 1.5) * 2.1,
          startY + 0.45,
          2.25
        ),
        endPos: new THREE.Vector3(-startX, startY + 0.1, startZ + 0.4),
        wingPhase: dIdx * Math.PI * 0.5,
        trailTimer: 0,
        flairColorHex: dfFlairColors[dIdx % dfFlairColors.length],
      });
    }

    // Spawn 4 lively pond fish (Cá chép / Koi bơi dưới nước và nhảy lên đớp mồi)
    actors.fishes = [];
    const fishOrbits = [
      { cx: -3.2, cz: 0.4, rx: 2.6, rz: 1.5, speed: 0.95 },
      { cx: 3.1, cz: 0.5, rx: 2.5, rz: 1.45, speed: -1.05 },
      { cx: 0.0, cz: -1.4, rx: 3.8, rz: 1.4, speed: 0.82 },
      { cx: 0.2, cz: 3.85, rx: 4.2, rz: 0.95, speed: -0.88 },
    ];
    fishOrbits.forEach((orb, idx) => {
      const fishRig = createFishRig(idx);
      fishRig.root.position.set(orb.cx, -0.14, orb.cz);
      FishGroup.add(fishRig.root);
      actors.fishes.push({
        index: idx,
        rig: fishRig,
        state: 'SWIMMING',
        stateTimer: 0,
        stateDuration: 0.72,
        swimAngle: idx * 1.6,
        swimRadiusX: orb.rx,
        swimRadiusZ: orb.rz,
        swimCenterX: orb.cx,
        swimCenterZ: orb.cz,
        swimSpeed: orb.speed,
        leapCooldown: 3.2 + idx * 2.1,
        leapStartPos: new THREE.Vector3(),
        leapApexPos: new THREE.Vector3(),
        leapEndPos: new THREE.Vector3(),
        targetStudentId: null,
        hasSnappedPrey: false,
      });
    });

    // Helper: Rebuild Frogs, Lily Pads & Little Rolling Snails ("những con ốc nhỏ lăn")
    const rebuildFrogsAndPads = (count: number) => {
      while (FrogsGroup.children.length > 0) {
        FrogsGroup.remove(FrogsGroup.children[0]);
      }
      while (SnailGroup.children.length > 0) {
        SnailGroup.remove(SnailGroup.children[0]);
      }
      actors.lilyPads = [];
      actors.frogs = [];
      actors.snails = [];

      const mainLayout = computeLilyPadLayout(count);
      const extraLayout = computeSteppingStonePads(count);
      const frogScale = count >= 6 ? 0.78 : count >= 4 ? 0.88 : 0.96;

      // 1. Create main lily pads & frogs
      mainLayout.forEach((padSpec, idx) => {
        const padRig = createLilyPadRig(
          padSpec.radius,
          padSpec.x,
          padSpec.z,
          idx + 1
        );
        FrogsGroup.add(padRig.root);
        actors.lilyPads.push(padRig);

        const customPaletteIdx =
          frogPalettesRef.current[idx] !== undefined
            ? frogPalettesRef.current[idx]
            : 0;

        const frogRig = createFrogRig(idx, customPaletteIdx);
        frogRig.root.scale.setScalar(frogScale);
        frogRig.root.position.set(padSpec.x, 0.08, padSpec.z);
        const initialYaw = -padSpec.x * 0.045;
        frogRig.root.rotation.y = initialYaw;
        FrogsGroup.add(frogRig.root);

        actors.frogs.push({
          index: idx,
          rig: frogRig,
          padIndex: idx,
          targetPadIndex: idx,
          state: 'IDLE',
          stateTimer: 0,
          stateDuration: 1,
          blinkTimer: 1.2 + idx * 0.65,
          isBlinking: false,
          croakCooldown: 2.2 + idx * 1.5,
          hopCooldown: 11.0 + idx * 5.5,
          snailSnackCooldown: 2.4 + idx * 1.8,
          cuteWiggleTimer: 0.9,
          cuteWiggleCooldown: 2.8 + idx * 1.3,
          lookTargetPos: new THREE.Vector3(padSpec.x, 1.2, padSpec.z + 1.2),
          currentLookPos: new THREE.Vector3(padSpec.x, 1.2, padSpec.z + 1.2),
          targetStudentId: null,
          targetSnailIndex: null,
          jumpPreyFlyerIndex: null,
          jumpPreyStudentId: null,
          hasSnappedJumpPrey: false,
          jumpStartPos: new THREE.Vector3(padSpec.x, 0.08, padSpec.z),
          jumpApexPos: new THREE.Vector3(padSpec.x, 1.2, padSpec.z),
          jumpEndPos: new THREE.Vector3(padSpec.x, 0.08, padSpec.z),
          jumpYaw: initialYaw,
        });
      });

      // 2. Create stepping-stone lily pads so frogs can leap between lily pads
      extraLayout.forEach((padSpec, extraIdx) => {
        const padIndex = mainLayout.length + extraIdx;
        const padRig = createLilyPadRig(
          padSpec.radius,
          padSpec.x,
          padSpec.z,
          padIndex + 1
        );
        FrogsGroup.add(padRig.root);
        actors.lilyPads.push(padRig);
      });

      // 3. Spawn Little Rolling Snails ("những con ốc nhỏ lăn") on the lily pads
      const snailCount = Math.min(actors.lilyPads.length, Math.max(3, count + 1));
      for (let sIdx = 0; sIdx < snailCount; sIdx++) {
        const padIdx = sIdx % actors.lilyPads.length;
        const pad = actors.lilyPads[padIdx];
        const snailRig = createRollingSnailRig(sIdx);
        snailRig.root.scale.setScalar(0.92);
        const angle = sIdx * 1.9;
        const orbitR = pad.radius * 0.62;
        snailRig.root.position.set(
          pad.baseX + Math.cos(angle) * orbitR,
          0.11,
          pad.baseZ + Math.sin(angle) * orbitR
        );
        SnailGroup.add(snailRig.root);

        actors.snails.push({
          index: sIdx,
          rig: snailRig,
          padIndex: padIdx,
          state: 'ROLLING',
          stateTimer: sIdx * 0.8,
          orbitAngle: angle,
          orbitRadius: orbitR,
          rollSpeed: (sIdx % 2 === 0 ? 1 : -1) * (1.25 + (sIdx % 3) * 0.25),
          caughtStartPos: new THREE.Vector3(),
        });
      }
    };

    const syncFrogPalettes = (palettes: number[]) => {
      actors.frogs.forEach((frog, idx) => {
        if (
          palettes[idx] !== undefined &&
          frog.rig.paletteIndex !== palettes[idx]
        ) {
          applyFrogPalette(frog.rig, palettes[idx]);
        }
      });
    };

    const spawnRoundInsects = (plan: RoundPlan | null) => {
      while (InsectsGroup.children.length > 0) {
        InsectsGroup.remove(InsectsGroup.children[0]);
      }
      while (EffectsGroup.children.length > 0) {
        EffectsGroup.remove(EffectsGroup.children[0]);
      }
      actors.insects = [];
      actors.bursts = [];

      if (labelsContainerRef.current) {
        labelsContainerRef.current.innerHTML = '';
      }

      actors.frogs.forEach((f) => {
        f.state = 'IDLE';
        f.stateTimer = 0;
        f.targetStudentId = null;
        f.targetSnailIndex = null;
        f.jumpPreyFlyerIndex = null;
        f.jumpPreyStudentId = null;
        f.hasSnappedJumpPrey = false;
        f.rig.tongueGroup.visible = false;
        f.rig.jawGroup.rotation.x = 0;
      });

      actors.fishes.forEach((fish) => {
        fish.targetStudentId = null;
        fish.hasSnappedPrey = false;
      });

      if (!plan) return;

      const total = plan.students.length;
      const cols = Math.max(1, Math.ceil(Math.sqrt(total * 1.8)));
      const rows = Math.max(1, Math.ceil(total / cols));

      const fontSizeClass =
        total <= 12
          ? 'text-sm md:text-base px-3 py-1'
          : total <= 35
          ? 'text-xs md:text-sm px-2.5 py-0.5'
          : 'text-[11px] md:text-xs px-2 py-0.5';

      plan.students.forEach((student, idx) => {
        const rig = createInsectRig(student.insectType);
        const insectScale = total > 45 ? 0.68 : total > 20 ? 0.78 : 0.88;
        rig.root.scale.setScalar(insectScale);

        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const normX = cols === 1 ? 0 : col / (cols - 1) - 0.5;
        const normY = rows === 1 ? 0 : row / (rows - 1) - 0.5;

        const homeX = normX * 9.2 + (Math.random() - 0.5) * 0.9;
        const homeY = 2.65 + normY * 1.65 + (Math.random() - 0.5) * 0.35;
        const homeZ = 0.8 + ((idx % 3) - 1) * 0.85;

        rig.root.position.set(homeX, homeY, homeZ);
        InsectsGroup.add(rig.root);

        let labelEl: HTMLDivElement | null = null;
        if (labelsContainerRef.current) {
          labelEl = document.createElement('div');
          labelEl.className = `absolute top-0 left-0 pointer-events-none select-none whitespace-nowrap rounded-md font-bold tracking-tight text-white shadow-md border border-white/25 flex items-center gap-1.5 transition-opacity duration-150 ${fontSizeClass}`;
          labelEl.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
          labelEl.style.willChange = 'transform, opacity';

          const badgeDot = document.createElement('span');
          badgeDot.className = 'w-2 h-2 rounded-full shrink-0';
          badgeDot.style.backgroundColor =
            INSECT_BADGE_COLORS[student.insectType];

          const nameSpan = document.createElement('span');
          nameSpan.textContent = student.name;

          labelEl.appendChild(badgeDot);
          labelEl.appendChild(nameSpan);
          labelsContainerRef.current.appendChild(labelEl);
        }

        actors.insects.push({
          id: student.id,
          name: student.name,
          type: student.insectType,
          status: 'FLYING',
          isWinner: student.id === plan.winner.id,
          rig,
          pos: new THREE.Vector3(homeX, homeY, homeZ),
          homePos: new THREE.Vector3(homeX, homeY, homeZ),
          vel: new THREE.Vector3(),
          seed: idx * 1.37 + Math.random() * 5,
          freqX: 0.75 + Math.random() * 0.55,
          freqY: 1.1 + Math.random() * 0.65,
          freqZ: 0.6 + Math.random() * 0.4,
          ampX: 1.25 + Math.random() * 0.9,
          ampY: 0.38 + Math.random() * 0.25,
          ampZ: 0.55 + Math.random() * 0.35,
          wingPhase: Math.random() * Math.PI * 2,
          caughtProgress: 0,
          caughtStartPos: new THREE.Vector3(),
          caughtMouthPos: new THREE.Vector3(),
          labelEl,
        });
      });
    };

    actors.rebuildFrogsAndPads = rebuildFrogsAndPads;
    actors.spawnRoundInsects = spawnRoundInsects;
    actors.syncFrogPalettes = syncFrogPalettes;

    rebuildFrogsAndPads(frogCountRef.current);
    if (roundPlanRef.current) {
      spawnRoundInsects(roundPlanRef.current);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ====================================================================
    // RAYCASTING: CLICK ON ANY 3D FROG TO CYCLE ITS COLOR PALETTE
    // ====================================================================
    const raycaster = new THREE.Raycaster();
    let lastHoverCheckMs = 0;

    const getHitFrogActor = (
      clientX: number,
      clientY: number
    ): ActiveFrogActor | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_pointerNdc, camera);

      const hitProxies = actors.frogs.map((f) => f.rig.hitProxy);
      const intersects = raycaster.intersectObjects(hitProxies, false);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const found = actors.frogs.find((f) => f.rig.hitProxy === hitMesh);
        return found || null;
      }
      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheckMs < 45) return;
      lastHoverCheckMs = now;
      const frog = getHitFrogActor(e.clientX, e.clientY);
      renderer.domElement.style.cursor = frog ? 'pointer' : 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      const frog = getHitFrogActor(e.clientX, e.clientY);
      if (!frog) return;

      const nextPaletteIdx = (frog.rig.paletteIndex + 1) % FROG_PALETTES.length;
      const newPalette = applyFrogPalette(frog.rig, nextPaletteIdx);

      // Instead of jumping away when clicked, the frog stays on its lily pad and does an adorable happy wiggle & paw wave!
      frog.cuteWiggleTimer = 1.25;
      frog.rig.vocalSac.scale.set(1.4, 1.25, 1.4);
      frog.rig.leftCheek.scale.set(1.45, 1.1, 1.25);
      frog.rig.rightCheek.scale.set(1.45, 1.1, 1.25);

      const pad = actors.lilyPads[frog.padIndex];
      if (pad) {
        pad.dipVel = -0.95;
        pad.ripplePhase = 0;
      }

      _tempVec.copy(frog.rig.root.position);
      _tempVec.y += 0.65;
      spawnCatchBurst(_tempVec, newPalette.hexCss);
      audioManager.playFrogColorChange(nextPaletteIdx);

      callbacksRef.current.onFrogColorChanged(
        frog.index,
        nextPaletteIdx,
        newPalette.nameVi,
        newPalette.hexCss
      );
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerdown', handlePointerDown);

    // Resize listener
    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      camera.aspect = w / h;
      const aspectFactor = w / Math.max(1, h);
      camera.position.z = aspectFactor < 1.25 ? 16.5 : 13.8;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Software WebGL frame pacing helper
    let frameId = 0;
    let isDisposed = false;
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let lastFrameTimeMs = performance.now();
    let elapsedVisualTime = 0;
    let fpsSampleCount = 0;
    let fpsAccumulatedMs = 0;

    function tick() {
      if (isDisposed) return;

      const nowMs = performance.now();
      const rawDtMs = nowMs - lastFrameTimeMs;
      const rawDt = rawDtMs / 1000;
      lastFrameTimeMs = nowMs;
      const dt = Math.min(rawDt, 0.05);

      // Adaptive Dynamic Resolution Scaler for weak / integrated GPUs
      if (!isSoftwareGl && rawDtMs < 120) {
        fpsSampleCount++;
        fpsAccumulatedMs += rawDtMs;
        if (fpsSampleCount >= 45) {
          const avgFrameMs = fpsAccumulatedMs / fpsSampleCount;
          if (avgFrameMs > 22 && currentPixelRatio > 0.85) {
            currentPixelRatio = Math.max(0.8, currentPixelRatio - 0.15);
            renderer.setPixelRatio(currentPixelRatio);
          }
          fpsSampleCount = 0;
          fpsAccumulatedMs = 0;
        }
      }

      const currentPhase = phaseRef.current;
      const plan = roundPlanRef.current;
      const tState = timerStateRef.current;

      if (currentPhase !== 'PAUSED') {
        elapsedVisualTime += dt;
      }

      // ====================================================================
      // 0. UPDATE FLOWING BLUE WATER, STANDING LOTUS SWAY & WATERFALL STREAM
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        waterUniforms.uTime.value = elapsedVisualTime;
        waterTexture.offset.x = (waterTexture.offset.x - dt * 0.14) % 1;
        waterTexture.offset.y =
          (waterTexture.offset.y +
            Math.cos(elapsedVisualTime * 0.35) * dt * 0.04) %
          1;

        waterfallMesh.scale.x = 1 + Math.sin(elapsedVisualTime * 14) * 0.08;
        waterfallMesh.scale.z = 1 + Math.cos(elapsedVisualTime * 12) * 0.08;
        const dropAttr = streamDropGeo.attributes
          .position as THREE.BufferAttribute;
        for (let i = 0; i < streamDropCount; i++) {
          let y = dropAttr.getY(i) - dt * 1.9;
          let z = dropAttr.getZ(i) + dt * 0.85;
          if (y < 0.02) {
            y = 1.05;
            z = -5.15 + (Math.random() - 0.5) * 0.15;
          }
          dropAttr.setY(i, y);
          dropAttr.setZ(i, z);
        }
        dropAttr.needsUpdate = true;

        standingLeaves.forEach((leaf, idx) => {
          leaf.rotation.z =
            Math.sin(elapsedVisualTime * 1.4 + idx * 1.1) * 0.045;
          leaf.rotation.x =
            Math.cos(elapsedVisualTime * 1.1 + idx * 0.9) * 0.035;
        });

        const ffAttr = fireflyGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < fireflyCount; i++) {
          const baseY = ffAttr.getY(i);
          ffAttr.setY(
            i,
            baseY + Math.sin(elapsedVisualTime * 2.2 + i * 1.3) * 0.0025
          );
        }
        ffAttr.needsUpdate = true;
      }

      const targetCamZ =
        currentPhase === 'REVEALING' || currentPhase === 'RESULT'
          ? 12.6
          : camera.aspect < 1.25
          ? 16.5
          : 13.8;
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        targetCamZ,
        3.5,
        dt
      );
      keyLight.intensity = THREE.MathUtils.damp(
        keyLight.intensity,
        currentPhase === 'RESULT' ? 2.25 : 2.05,
        3.0,
        dt
      );

      // ====================================================================
      // 1. REAL-TIME MONOTONIC TIMER & CATCH SCHEDULER (PLAYING PHASE)
      // ====================================================================
      if (currentPhase === 'PLAYING' && plan) {
        const remainingMs = Math.max(0, tState.deadlineMs - nowMs);
        tState.elapsedMs = tState.totalDurationMs - remainingMs;

        const bucket = Math.ceil(remainingMs / 50);
        if (bucket !== tState.lastReportedRemainingBucket) {
          tState.lastReportedRemainingBucket = bucket;
          callbacksRef.current.onTickTimer(remainingMs);
        }

        const secondsCeil = Math.ceil(remainingMs / 1000);
        if (secondsCeil <= 5 && secondsCeil >= 1) {
          audioManager.playCountdownTick(secondsCeil);
        }

        const activeFrogs = actors.frogs;
        const activeFishes = actors.fishes;

        for (let i = 0; i < plan.catchSchedule.length; i++) {
          const item = plan.catchSchedule[i];
          if (item.started || item.completed) continue;
          if (tState.elapsedMs >= item.triggerElapsedMs) {
            const targetInsect = actors.insects.find(
              (ins) => ins.id === item.studentId && ins.status === 'FLYING'
            );
            if (!targetInsect) continue;

            // 1A. Very rarely a Fish leaps out of the water to catch the scheduled insect
            const freeFish =
              i % 9 === 7
                ? activeFishes.find(
                    (fish) =>
                      fish.state === 'SWIMMING' && !fish.targetStudentId
                  )
                : null;

            if (freeFish) {
              item.started = true;
              targetInsect.status = 'TARGETED';
              freeFish.state = 'LEAPING';
              freeFish.stateTimer = 0;
              const avgGapMs =
                tState.totalDurationMs / Math.max(1, plan.catchSchedule.length);
              freeFish.stateDuration = Math.min(
                0.68,
                Math.max(0.32, (avgGapMs / 1000) * 0.9)
              );
              freeFish.targetStudentId = targetInsect.id;
              freeFish.hasSnappedPrey = false;
              freeFish.leapStartPos.copy(freeFish.rig.root.position);
              freeFish.leapStartPos.y = -0.05;
              freeFish.leapApexPos.copy(targetInsect.pos);
              const dx = targetInsect.pos.x - freeFish.leapStartPos.x;
              const dz = targetInsect.pos.z - freeFish.leapStartPos.z;
              freeFish.leapEndPos.set(
                targetInsect.pos.x + THREE.MathUtils.clamp(dx * 0.45, -2.2, 2.2),
                -0.12,
                THREE.MathUtils.clamp(
                  targetInsect.pos.z + dz * 0.35,
                  -2.5,
                  4.2
                )
              );
              spawnCatchBurst(freeFish.leapStartPos, '#bae6fd', true);
              audioManager.playFishSplash();
              continue;
            }

            // Find an available frog
            let chosenFrog = activeFrogs[item.frogIndex % activeFrogs.length];
            if (
              chosenFrog &&
              (chosenFrog.state === 'PREPARE_CATCH' ||
                chosenFrog.state === 'TONGUE_CATCH' ||
                chosenFrog.state === 'JUMP')
            ) {
              const freeFrog = activeFrogs.find(
                (f) =>
                  f.state !== 'PREPARE_CATCH' &&
                  f.state !== 'TONGUE_CATCH' &&
                  f.state !== 'JUMP'
              );
              if (freeFrog) chosenFrog = freeFrog;
            }

            if (chosenFrog) {
              if (chosenFrog.targetSnailIndex !== null) {
                const sn = actors.snails[chosenFrog.targetSnailIndex];
                if (sn && sn.state === 'CAUGHT_BY_FROG') {
                  sn.state = 'ROLLING';
                  sn.rig.root.scale.setScalar(0.92);
                }
                chosenFrog.targetSnailIndex = null;
              }
              chosenFrog.jumpPreyFlyerIndex = null;

              if (chosenFrog.targetStudentId) {
                const prevIns = actors.insects.find(
                  (ins) => ins.id === chosenFrog.targetStudentId
                );
                if (prevIns && prevIns.status !== 'CAUGHT') {
                  prevIns.status = 'CAUGHT';
                  prevIns.rig.root.visible = false;
                  if (prevIns.labelEl) prevIns.labelEl.style.opacity = '0';
                }
              }
              if (chosenFrog.jumpPreyStudentId) {
                const prevJumpIns = actors.insects.find(
                  (ins) => ins.id === chosenFrog.jumpPreyStudentId
                );
                if (prevJumpIns && prevJumpIns.status !== 'CAUGHT') {
                  prevJumpIns.status = 'CAUGHT';
                  prevJumpIns.rig.root.visible = false;
                  if (prevJumpIns.labelEl)
                    prevJumpIns.labelEl.style.opacity = '0';
                }
                chosenFrog.jumpPreyStudentId = null;
              }

              chosenFrog.padIndex = chosenFrog.targetPadIndex;
              const avgGapMs =
                tState.totalDurationMs / Math.max(1, plan.catchSchedule.length);

              // Frogs stay mostly on their lily pads and catch with their cute pink tongue; only very rarely hop up!
              const shouldFrogLeapMidAir =
                avgGapMs >= 950 &&
                i % 10 === 8 &&
                (targetInsect.type === 'bee' ||
                  targetInsect.type === 'dragonfly');

              if (shouldFrogLeapMidAir) {
                item.started = true;
                targetInsect.status = 'TARGETED';
                chosenFrog.jumpPreyStudentId = targetInsect.id;
                chosenFrog.hasSnappedJumpPrey = false;

                // Pick a landing lily pad
                const occupiedPads = new Set<number>();
                actors.frogs.forEach((f) => {
                  occupiedPads.add(f.padIndex);
                  occupiedPads.add(f.targetPadIndex);
                });
                let destPadIdx = chosenFrog.padIndex;
                for (let pIdx = 0; pIdx < actors.lilyPads.length; pIdx++) {
                  if (!occupiedPads.has(pIdx)) {
                    destPadIdx = pIdx;
                    break;
                  }
                }
                const startPad = actors.lilyPads[chosenFrog.padIndex];
                const destPad = actors.lilyPads[destPadIdx];
                chosenFrog.targetPadIndex = destPadIdx;
                chosenFrog.jumpStartPos.set(
                  startPad ? startPad.baseX : chosenFrog.rig.root.position.x,
                  0.08,
                  startPad ? startPad.baseZ : chosenFrog.rig.root.position.z
                );
                chosenFrog.jumpEndPos.set(
                  destPad ? destPad.baseX : chosenFrog.rig.root.position.x,
                  0.08,
                  destPad ? destPad.baseZ : chosenFrog.rig.root.position.z
                );
                chosenFrog.jumpApexPos.copy(targetInsect.pos);
                chosenFrog.jumpYaw = Math.atan2(
                  targetInsect.pos.x - chosenFrog.jumpStartPos.x,
                  targetInsect.pos.z - chosenFrog.jumpStartPos.z
                );
                chosenFrog.state = 'PREPARE_JUMP';
                chosenFrog.stateTimer = 0;
                chosenFrog.stateDuration = 0.09;
              } else {
                item.started = true;
                targetInsect.status = 'TARGETED';
                chosenFrog.targetStudentId = targetInsect.id;
                chosenFrog.state = 'PREPARE_CATCH';
                chosenFrog.stateTimer = 0;
                chosenFrog.stateDuration = Math.min(
                  0.16,
                  Math.max(0.05, (avgGapMs / 1000) * 0.28)
                );
              }
            }
          }
        }

        let uncaughtCount = 0;
        for (let i = 0; i < actors.insects.length; i++) {
          if (actors.insects[i].status !== 'CAUGHT') uncaughtCount++;
        }
        if (uncaughtCount !== tState.lastReportedStudentCount) {
          tState.lastReportedStudentCount = uncaughtCount;
          callbacksRef.current.onRemainingCountChange(uncaughtCount);
        }

        if (remainingMs <= 0 && !tState.roundFinalized) {
          tState.roundFinalized = true;
          tState.revealStartedAtMs = nowMs;
          callbacksRef.current.onTickTimer(0);

          actors.insects.forEach((ins) => {
            if (!ins.isWinner) {
              ins.status = 'CAUGHT';
              ins.rig.root.visible = false;
              if (ins.labelEl) ins.labelEl.style.opacity = '0';
            } else {
              ins.status = 'WINNER';
              ins.rig.root.visible = true;
            }
          });
          callbacksRef.current.onRemainingCountChange(1);

          actors.frogs.forEach((f) => {
            f.padIndex = f.targetPadIndex;
            f.targetStudentId = null;
            f.targetSnailIndex = null;
            f.jumpPreyFlyerIndex = null;
            f.jumpPreyStudentId = null;
            f.rig.tongueGroup.visible = false;
            f.rig.jawGroup.rotation.x = 0;
            f.state = 'CELEBRATE';
            f.stateTimer = (f.index % 3) * 0.18;
          });

          callbacksRef.current.onRoundRevealStart();
        }
      }

      if (currentPhase === 'REVEALING' && tState.revealStartedAtMs > 0) {
        if (nowMs - tState.revealStartedAtMs >= 850) {
          tState.revealStartedAtMs = 0;
          callbacksRef.current.onRoundComplete();
        }
      }

      // ====================================================================
      // 2. UPDATE LILY PADS (MAIN + STEPPING STONES)
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        actors.lilyPads.forEach((pad) => {
          const stiffness = 65;
          const damping = 7.5;
          const force = -stiffness * pad.dipY - damping * pad.dipVel;
          pad.dipVel += force * dt;
          pad.dipY += pad.dipVel * dt;

          const waveBob =
            Math.sin(elapsedVisualTime * 1.6 + pad.phaseOffset) * 0.03;
          pad.padGroup.position.y = pad.dipY + waveBob;
          pad.padGroup.rotation.z =
            Math.cos(elapsedVisualTime * 1.3 + pad.phaseOffset) * 0.025;

          pad.ripplePhase = (pad.ripplePhase + dt * 0.65) % 1;
          const rScale = 1 + pad.ripplePhase * 0.45;
          pad.rippleRing.scale.set(rScale, rScale, 1);
          pad.rippleMat.opacity = (1 - pad.ripplePhase) * 0.38;
        });
      }

      // ====================================================================
      // 2B. UPDATE WILD DRAGONFLIES & HONEYBEES FLYING ACROSS THE LOTUS POND
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        actors.dragonflies.forEach((df) => {
          df.stateTimer += dt;
          df.wingPhase += dt * 58;
          df.trailTimer -= dt;

          if (df.state === 'EATEN_RESPAWN') {
            df.rig.root.visible = false;
            if (df.stateTimer >= 2.2) {
              df.state = 'PATROL_ACROSS';
              df.stateTimer = 0;
              df.stateDuration = 3.4 + Math.random() * 1.6;
              const side = df.index % 2 === 0 ? -1 : 1;
              df.startPos.set(
                side * 8.6,
                1.25 + Math.random() * 0.85,
                0.8 + Math.random() * 2.5
              );
              df.controlPos.set(
                (Math.random() - 0.5) * 4.2,
                1.2 + Math.random() * 0.8,
                1.6 + Math.random() * 1.8
              );
              df.endPos.set(
                -side * 8.2,
                1.3 + Math.random() * 0.8,
                0.5 + Math.random() * 2.6
              );
              df.rig.root.position.copy(df.startPos);
              df.rig.root.scale.setScalar(df.rig.isBee ? 0.98 : 1.08);
              df.rig.root.visible = true;
            }
            return;
          }

          df.rig.root.visible = true;
          const foreFlap = Math.sin(df.wingPhase) * 0.54;
          const hindFlap = Math.cos(df.wingPhase) * 0.54;
          df.rig.foreLeftWing.rotation.z = foreFlap;
          df.rig.foreRightWing.rotation.z = -foreFlap;
          df.rig.hindLeftWing.rotation.z = hindFlap;
          df.rig.hindRightWing.rotation.z = -hindFlap;

          df.rig.tailGroup.rotation.x =
            Math.sin(elapsedVisualTime * 6 + df.index) * 0.08;
          const haloPulse =
            1 + Math.sin(elapsedVisualTime * 8 + df.index) * 0.22;
          df.rig.flairRing.scale.set(haloPulse, haloPulse, 1);
          df.rig.flairMat.opacity =
            0.35 + Math.sin(elapsedVisualTime * 7 + df.index) * 0.2;

          if (df.state === 'PATROL_ACROSS') {
            const p = Math.min(1, df.stateTimer / df.stateDuration);
            const invP = 1 - p;

            const prevX = df.rig.root.position.x;
            const prevZ = df.rig.root.position.z;

            const nx =
              invP * invP * df.startPos.x +
              2 * invP * p * df.controlPos.x +
              p * p * df.endPos.x;
            const ny =
              invP * invP * df.startPos.y +
              2 * invP * p * df.controlPos.y +
              p * p * df.endPos.y +
              Math.sin(elapsedVisualTime * 5.2 + df.index) * 0.08;
            const nz =
              invP * invP * df.startPos.z +
              2 * invP * p * df.controlPos.z +
              p * p * df.endPos.z;

            df.rig.root.position.set(nx, ny, nz);

            const vx = nx - prevX;
            const vz = nz - prevZ;
            if (Math.abs(vx) + Math.abs(vz) > 0.0001) {
              const desiredYaw = Math.atan2(vx, vz);
              df.rig.root.rotation.y = THREE.MathUtils.damp(
                df.rig.root.rotation.y,
                desiredYaw,
                10,
                dt
              );
              df.rig.bodyGroup.rotation.z = THREE.MathUtils.damp(
                df.rig.bodyGroup.rotation.z,
                -vx * 1.4,
                8,
                dt
              );
            }

            if (df.trailTimer <= 0 && Math.abs(nx) < 7.2) {
              df.trailTimer = 0.45;
              _tempVec2.copy(df.rig.root.position);
              _tempVec2.y -= 0.05;
              spawnCatchBurst(_tempVec2, df.flairColorHex, false);
            }

            if (p >= 1) {
              df.state = 'HOVERING';
              df.stateTimer = 0;
              df.stateDuration = 1.1 + Math.random() * 1.3;
            }
          } else if (df.state === 'HOVERING') {
            df.rig.root.position.y +=
              Math.sin(elapsedVisualTime * 7.5 + df.index) * 0.004;
            df.rig.bodyGroup.rotation.z = THREE.MathUtils.damp(
              df.rig.bodyGroup.rotation.z,
              0,
              8,
              dt
            );
            if (df.stateTimer >= df.stateDuration) {
              df.state = 'PATROL_ACROSS';
              df.stateTimer = 0;
              df.stateDuration = 3.5 + Math.random() * 1.6;
              df.startPos.copy(df.rig.root.position);
              const nextSide = df.startPos.x > 0 ? -1 : 1;
              df.endPos.set(
                nextSide * (7.2 + Math.random() * 2.0),
                1.15 + Math.random() * 1.0,
                0.5 + Math.random() * 3.0
              );
              df.controlPos.set(
                (Math.random() - 0.5) * 4.5,
                1.2 + Math.random() * 0.9,
                1.2 + Math.random() * 2.2
              );
            }
          }
        });
      }

      // ====================================================================
      // 2C. UPDATE LITTLE ROLLING SNAILS ON LILY PADS ("những con ốc nhỏ lăn")
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        actors.snails.forEach((snail) => {
          const pad = actors.lilyPads[snail.padIndex];
          if (!pad) return;
          const padSurfaceY = 0.09 + pad.padGroup.position.y;
          snail.stateTimer += dt;

          if (snail.state === 'ROLLING') {
            snail.rig.root.visible = true;
            snail.orbitAngle += dt * snail.rollSpeed * 0.55;
            const sx =
              pad.baseX + Math.cos(snail.orbitAngle) * snail.orbitRadius;
            const sz =
              pad.baseZ + Math.sin(snail.orbitAngle) * snail.orbitRadius;
            const tangentYaw =
              snail.orbitAngle +
              (snail.rollSpeed > 0 ? Math.PI / 2 : -Math.PI / 2);

            snail.rig.root.position.set(sx, padSurfaceY, sz);
            snail.rig.root.rotation.y = tangentYaw;

            snail.rig.shellGroup.rotation.x +=
              dt * Math.abs(snail.rollSpeed) * 5.2;

            snail.rig.leftTentacle.scale.y = THREE.MathUtils.damp(
              snail.rig.leftTentacle.scale.y,
              0.65,
              8,
              dt
            );
            snail.rig.rightTentacle.scale.y = snail.rig.leftTentacle.scale.y;

            if (snail.stateTimer >= 3.2 + (snail.index % 3) * 0.9) {
              snail.state = 'PEEKING';
              snail.stateTimer = 0;
            }
          } else if (snail.state === 'PEEKING') {
            snail.rig.root.position.y = padSurfaceY;
            snail.rig.leftTentacle.scale.y = THREE.MathUtils.damp(
              snail.rig.leftTentacle.scale.y,
              1.15,
              8,
              dt
            );
            snail.rig.rightTentacle.scale.y = snail.rig.leftTentacle.scale.y;
            snail.rig.leftTentacle.rotation.z =
              0.28 + Math.sin(elapsedVisualTime * 5 + snail.index) * 0.15;
            snail.rig.rightTentacle.rotation.z =
              -0.28 + Math.cos(elapsedVisualTime * 5 + snail.index) * 0.15;

            if (snail.stateTimer >= 1.2) {
              snail.state = 'ROLLING';
              snail.stateTimer = 0;
            }
          } else if (snail.state === 'RESPAWNING') {
            snail.rig.root.visible = false;
            if (snail.stateTimer >= 2.2) {
              snail.padIndex =
                (snail.padIndex + 1) % Math.max(1, actors.lilyPads.length);
              const newPad = actors.lilyPads[snail.padIndex];
              snail.orbitRadius = newPad.radius * 0.62;
              snail.state = 'ROLLING';
              snail.stateTimer = 0;
              snail.rig.root.scale.setScalar(0.92);
              snail.rig.root.visible = true;
            }
          }
        });
      }

      // ====================================================================
      // 3. UPDATE INSECTS
      // ====================================================================
      const w = mountEl?.clientWidth || window.innerWidth;
      const h = mountEl?.clientHeight || window.innerHeight;

      if (currentPhase !== 'PAUSED') {
        const timeUrgency =
          currentPhase === 'PLAYING' && tState.totalDurationMs > 0
            ? Math.min(1, tState.elapsedMs / tState.totalDurationMs)
            : 0;

        const centerPull = timeUrgency > 0.7 ? (timeUrgency - 0.7) * 1.1 : 0;

        for (let i = 0; i < actors.insects.length; i++) {
          const ins = actors.insects[i];
          if (ins.status === 'CAUGHT') {
            ins.rig.root.visible = false;
            if (ins.labelEl) ins.labelEl.style.opacity = '0';
            continue;
          }

          ins.wingPhase += dt * (ins.type === 'butterfly' ? 18 : 42);
          const flapAngle =
            Math.sin(ins.wingPhase) * (ins.type === 'butterfly' ? 0.65 : 0.48);
          ins.rig.leftWings.forEach((wObj) => {
            wObj.rotation.z = flapAngle;
          });
          ins.rig.rightWings.forEach((wObj) => {
            wObj.rotation.z = -flapAngle;
          });

          if (
            ins.status === 'WINNER' ||
            currentPhase === 'REVEALING' ||
            currentPhase === 'RESULT'
          ) {
            _tempVec.set(0, 3.15, 2.2);
            ins.pos.lerp(_tempVec, 1 - Math.exp(-5.5 * dt));
            ins.rig.root.position.copy(ins.pos);
            ins.rig.bodyGroup.rotation.set(
              0,
              Math.sin(elapsedVisualTime * 2) * 0.25,
              0
            );
          } else {
            const t = elapsedVisualTime + ins.seed;
            const targetX =
              ins.homePos.x * (1 - centerPull * 0.45) +
              Math.sin(t * ins.freqX) * ins.ampX;
            const targetY =
              ins.homePos.y +
              Math.sin(t * ins.freqY * 1.3) * ins.ampY +
              Math.cos(t * 0.7) * 0.15;
            const targetZ =
              ins.homePos.z + Math.cos(t * ins.freqZ) * ins.ampZ;

            _tempVec.set(targetX, targetY, targetZ);

            for (let j = 0; j < actors.insects.length; j++) {
              if (i === j) continue;
              const other = actors.insects[j];
              if (other.status === 'CAUGHT') continue;
              const dx = ins.pos.x - other.pos.x;
              const dy = ins.pos.y - other.pos.y;
              const distSq = dx * dx + dy * dy;
              const minSep = 1.35;
              if (distSq < minSep * minSep && distSq > 0.0001) {
                const dist = Math.sqrt(distSq);
                const push = ((minSep - dist) / minSep) * 1.4;
                _tempVec.x += (dx / dist) * push;
                _tempVec.y += (dy / dist) * push * 0.6;
              }
            }

            _tempVec.x = THREE.MathUtils.clamp(_tempVec.x, -6.2, 6.2);
            _tempVec.y = THREE.MathUtils.clamp(_tempVec.y, 1.85, 4.45);
            _tempVec.z = THREE.MathUtils.clamp(_tempVec.z, -0.6, 2.4);

            const followSpeed = ins.status === 'TARGETED' ? 2.2 : 4.2;
            _diffVec.copy(_tempVec).sub(ins.pos);
            ins.pos.addScaledVector(
              _diffVec,
              1 - Math.exp(-followSpeed * dt)
            );
            ins.rig.root.position.copy(ins.pos);

            const yaw = Math.atan2(_diffVec.x, _diffVec.z + 0.5) * 0.35;
            ins.rig.bodyGroup.rotation.y = THREE.MathUtils.damp(
              ins.rig.bodyGroup.rotation.y,
              yaw,
              6,
              dt
            );
            ins.rig.bodyGroup.rotation.z = THREE.MathUtils.damp(
              ins.rig.bodyGroup.rotation.z,
              -_diffVec.x * 0.15,
              6,
              dt
            );
          }
        }
      }

      // ====================================================================
      // 4. UPDATE FROGS: SPARKLING EYES, HEAD TRACKING, ACROBATIC MID-AIR
      // LEAP-CATCH OF BEES/DRAGONFLIES ("bay lên ăn mồi như ong, chuồn chuồn")
      // & ROLLING SNAIL HUNTING
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        actors.frogs.forEach((frog) => {
          const pad = actors.lilyPads[frog.padIndex];
          const padTopY = 0.08 + (pad ? pad.padGroup.position.y : 0);

          frog.stateTimer += dt;
          frog.blinkTimer -= dt;
          frog.croakCooldown -= dt;
          frog.hopCooldown -= dt;
          frog.snailSnackCooldown -= dt;
          frog.cuteWiggleCooldown -= dt;
          if (frog.cuteWiggleTimer > 0) {
            frog.cuteWiggleTimer = Math.max(0, frog.cuteWiggleTimer - dt);
          }

          // Twinkling / Glimmering eye sparkles ("mắt to tròn long lanh dễ thương")
          const sparklePulse =
            0.96 + Math.sin(elapsedVisualTime * 9.5 + frog.index * 1.9) * 0.28;
          frog.rig.leftSparkleGroup.scale.setScalar(sparklePulse);
          frog.rig.rightSparkleGroup.scale.setScalar(sparklePulse);
          frog.rig.leftSparkleGroup.rotation.z =
            Math.sin(elapsedVisualTime * 3.8 + frog.index) * 0.25;
          frog.rig.rightSparkleGroup.rotation.z =
            -frog.rig.leftSparkleGroup.rotation.z;

          if (frog.blinkTimer <= 0) {
            if (!frog.isBlinking) {
              frog.isBlinking = true;
              frog.blinkTimer = 0.13;
            } else {
              frog.isBlinking = false;
              frog.blinkTimer = 2.4 + Math.random() * 2.8;
            }
          }
          // Happy squinting eyes during cute wiggle or eating
          const isHappySquinting =
            frog.cuteWiggleTimer > 0 || frog.state === 'EAT_REACT';
          const targetLidRot = frog.isBlinking
            ? -0.05
            : isHappySquinting
            ? -Math.PI * 0.46
            : -Math.PI * 0.65;
          frog.rig.leftEyelid.rotation.x = THREE.MathUtils.damp(
            frog.rig.leftEyelid.rotation.x,
            targetLidRot,
            24,
            dt
          );
          frog.rig.rightEyelid.rotation.x = frog.rig.leftEyelid.rotation.x;

          // Chubby breathing + cute belly jiggle when happy
          const wigglePhase = elapsedVisualTime * 15 + frog.index * 2.1;
          const isWiggling = frog.cuteWiggleTimer > 0;
          const breathe =
            1 +
            Math.sin(elapsedVisualTime * 3.2 + frog.index) * 0.032 +
            (isWiggling ? Math.sin(wigglePhase) * 0.065 : 0);
          const chubbyWidth =
            1 +
            Math.cos(elapsedVisualTime * 3.2 + frog.index) * 0.02 +
            (isWiggling ? -Math.sin(wigglePhase) * 0.055 : 0);
          frog.rig.bodyGroup.scale.set(chubbyWidth, breathe, chubbyWidth);

          // Cute side-to-side chubby body sway & front paw waving ("lắc lư mũm mĩm, vẫy tay đáng yêu")
          const targetBodyRoll = isWiggling
            ? Math.sin(wigglePhase * 0.85) * 0.14
            : Math.sin(elapsedVisualTime * 1.8 + frog.index * 1.4) * 0.035;
          frog.rig.bodyGroup.rotation.z = THREE.MathUtils.damp(
            frog.rig.bodyGroup.rotation.z,
            targetBodyRoll,
            10,
            dt
          );

          if (isWiggling || frog.state === 'EAT_REACT') {
            // Wave front paws / pat chubby belly happily!
            frog.rig.leftFrontLeg.rotation.x =
              -0.55 + Math.sin(wigglePhase * 1.1) * 0.38;
            frog.rig.rightFrontLeg.rotation.x =
              -0.55 - Math.sin(wigglePhase * 1.1) * 0.38;
            frog.rig.leftFrontLeg.rotation.z =
              0.25 + Math.cos(wigglePhase) * 0.2;
            frog.rig.rightFrontLeg.rotation.z =
              -0.25 - Math.cos(wigglePhase) * 0.2;
          } else {
            frog.rig.leftFrontLeg.rotation.x = THREE.MathUtils.damp(
              frog.rig.leftFrontLeg.rotation.x,
              0,
              10,
              dt
            );
            frog.rig.rightFrontLeg.rotation.x = THREE.MathUtils.damp(
              frog.rig.rightFrontLeg.rotation.x,
              0,
              10,
              dt
            );
            frog.rig.leftFrontLeg.rotation.z = THREE.MathUtils.damp(
              frog.rig.leftFrontLeg.rotation.z,
              0,
              10,
              dt
            );
            frog.rig.rightFrontLeg.rotation.z = THREE.MathUtils.damp(
              frog.rig.rightFrontLeg.rotation.z,
              0,
              10,
              dt
            );
          }

          const targetIns = frog.targetStudentId
            ? actors.insects.find((ins) => ins.id === frog.targetStudentId)
            : null;
          const jumpStudentIns = frog.jumpPreyStudentId
            ? actors.insects.find((ins) => ins.id === frog.jumpPreyStudentId)
            : null;
          const jumpWildFlyer =
            frog.jumpPreyFlyerIndex !== null
              ? actors.dragonflies[frog.jumpPreyFlyerIndex]
              : null;
          const targetSnail =
            frog.targetSnailIndex !== null
              ? actors.snails[frog.targetSnailIndex]
              : null;

          // Determine what the frog's sparkling eyes and head are tracking
          if (targetIns) {
            frog.lookTargetPos.copy(targetIns.pos);
          } else if (jumpStudentIns) {
            frog.lookTargetPos.copy(jumpStudentIns.pos);
          } else if (jumpWildFlyer && jumpWildFlyer.state !== 'EATEN_RESPAWN') {
            frog.lookTargetPos.copy(jumpWildFlyer.rig.root.position);
          } else if (targetSnail && targetSnail.state !== 'RESPAWNING') {
            frog.lookTargetPos.copy(targetSnail.rig.root.position);
          } else {
            let foundSnail: ActiveSnailActor | null = null;
            let bestDist = 4.2;
            for (let s = 0; s < actors.snails.length; s++) {
              const sn = actors.snails[s];
              if (sn.state === 'ROLLING' || sn.state === 'PEEKING') {
                const dSnail = sn.rig.root.position.distanceTo(
                  frog.rig.root.position
                );
                if (dSnail < bestDist) {
                  bestDist = dSnail;
                  foundSnail = sn;
                }
              }
            }

            if (
              foundSnail &&
              Math.sin(elapsedVisualTime * 1.4 + frog.index) > 0.2
            ) {
              frog.lookTargetPos.copy(foundSnail.rig.root.position);
            } else if (actors.insects.length > 0) {
              const flying = actors.insects.filter(
                (ins) => ins.status !== 'CAUGHT'
              );
              if (flying.length > 0) {
                const pick =
                  flying[
                    (frog.index + Math.floor(elapsedVisualTime * 1.4)) %
                      flying.length
                  ];
                frog.lookTargetPos.copy(pick.pos);
              }
            } else if (actors.dragonflies.length > 0) {
              const df =
                actors.dragonflies[frog.index % actors.dragonflies.length];
              if (df.state !== 'EATEN_RESPAWN') {
                frog.lookTargetPos.copy(df.rig.root.position);
              }
            }
          }

          frog.currentLookPos.lerp(frog.lookTargetPos, 1 - Math.exp(-10 * dt));

          // Active Eye Pupil + Cute Curious Head Tilt Tracking toward prey ("nghiêng đầu ngơ ngác đáng yêu")
          const relX = frog.currentLookPos.x - frog.rig.root.position.x;
          const relY = frog.currentLookPos.y - (frog.rig.root.position.y + 0.85);
          const relZ = frog.currentLookPos.z - frog.rig.root.position.z;

          const dxLook = THREE.MathUtils.clamp(relX * 0.034, -0.068, 0.068);
          const dyLook = THREE.MathUtils.clamp(relY * 0.03, -0.058, 0.068);
          frog.rig.leftPupil.position.set(dxLook, 0.03 + dyLook, 0.212);
          frog.rig.rightPupil.position.set(dxLook, 0.03 + dyLook, 0.212);

          const headYaw = THREE.MathUtils.clamp(relX * 0.16, -0.38, 0.38);
          const headPitch = THREE.MathUtils.clamp(
            -relY * 0.12 + (relZ < 0 ? 0.05 : 0),
            -0.28,
            0.26
          );
          // Cute inquisitive head tilt ("nghiêng đầu")
          const curiousHeadTilt =
            Math.sin(elapsedVisualTime * 2.1 + frog.index * 1.7) * 0.13 +
            THREE.MathUtils.clamp(-relX * 0.04, -0.1, 0.1) +
            (isWiggling ? Math.cos(wigglePhase * 0.85) * 0.12 : 0);

          frog.rig.headGroup.rotation.y = THREE.MathUtils.damp(
            frog.rig.headGroup.rotation.y,
            headYaw,
            10,
            dt
          );
          frog.rig.headGroup.rotation.x = THREE.MathUtils.damp(
            frog.rig.headGroup.rotation.x,
            headPitch,
            10,
            dt
          );
          frog.rig.headGroup.rotation.z = THREE.MathUtils.damp(
            frog.rig.headGroup.rotation.z,
            curiousHeadTilt,
            8,
            dt
          );

          // Sway the cute little lotus sprout on top of the frog's head!
          frog.rig.headSproutGroup.rotation.z =
            -frog.rig.headGroup.rotation.z * 1.4 +
            Math.sin(elapsedVisualTime * 4.5 + frog.index) * 0.14;
          frog.rig.headSproutGroup.rotation.x =
            Math.cos(elapsedVisualTime * 3.6 + frog.index) * 0.08;

          if (frog.state === 'IDLE') {
            if (pad) {
              frog.rig.root.position.x = THREE.MathUtils.damp(
                frog.rig.root.position.x,
                pad.baseX,
                10,
                dt
              );
              frog.rig.root.position.z = THREE.MathUtils.damp(
                frog.rig.root.position.z,
                pad.baseZ,
                10,
                dt
              );
              const restYaw = -pad.baseX * 0.045;
              frog.rig.root.rotation.y = THREE.MathUtils.damp(
                frog.rig.root.rotation.y,
                restYaw,
                6,
                dt
              );
            }
            // Tiny joyful bounce in place on the lily pad when wiggling cutely
            const cuteBounceY = isWiggling
              ? Math.abs(Math.sin(wigglePhase * 0.85)) * 0.11
              : 0;
            frog.rig.root.position.y = padTopY + cuteBounceY;
            frog.rig.tongueGroup.visible = false;

            // Trigger periodic cute wiggle & paw wave on the lily pad
            if (frog.cuteWiggleCooldown <= 0) {
              frog.cuteWiggleCooldown = 3.6 + Math.random() * 4.2;
              frog.cuteWiggleTimer = 1.05;
            }

            if (frog.croakCooldown <= 0 && currentPhase === 'PLAYING') {
              frog.croakCooldown = 4.5 + Math.random() * 5.5;
              audioManager.playFrogCroak(frog.index);
              frog.rig.vocalSac.scale.set(1.48, 1.38, 1.48);
              frog.rig.leftCheek.scale.set(1.42, 1.08, 1.25);
              frog.rig.rightCheek.scale.set(1.42, 1.08, 1.25);
              frog.rig.jawGroup.rotation.x = 0.22;
              frog.cuteWiggleTimer = Math.max(frog.cuteWiggleTimer, 0.65);
            } else {
              frog.rig.vocalSac.scale.lerp(
                _tempVec.set(1, 0.55, 1),
                1 - Math.exp(-8 * dt)
              );
              const targetCheekScale = isWiggling ? 1.28 : 1.0;
              frog.rig.leftCheek.scale.lerp(
                _tempVec.set(
                  1.15 * targetCheekScale,
                  0.78 * targetCheekScale,
                  0.92 * targetCheekScale
                ),
                1 - Math.exp(-8 * dt)
              );
              frog.rig.rightCheek.scale.copy(frog.rig.leftCheek.scale);
              frog.rig.jawGroup.rotation.x = THREE.MathUtils.damp(
                frog.rig.jawGroup.rotation.x,
                isWiggling ? 0.14 : 0,
                10,
                dt
              );
            }

            // Frog searches for and snaps a nearby little rolling snail ("Con ếch tìm những con ốc nhỏ lăn")
            if (
              frog.snailSnackCooldown <= 0 &&
              !frog.targetStudentId &&
              (currentPhase === 'SETUP' || currentPhase === 'PLAYING')
            ) {
              frog.snailSnackCooldown = 4.2 + Math.random() * 4.5;
              const targetableSnail = actors.snails.find((sn) => {
                if (sn.state !== 'ROLLING' && sn.state !== 'PEEKING')
                  return false;
                const dist = sn.rig.root.position.distanceTo(
                  frog.rig.root.position
                );
                return dist <= 3.6;
              });

              if (targetableSnail) {
                targetableSnail.state = 'CAUGHT_BY_FROG';
                targetableSnail.stateTimer = 0;
                targetableSnail.caughtStartPos.copy(
                  targetableSnail.rig.root.position
                );
                frog.targetSnailIndex = targetableSnail.index;
                frog.state = 'PREPARE_CATCH';
                frog.stateTimer = 0;
                frog.stateDuration = 0.15;
              }
            }

            // Frogs only rarely hop ("lâu lâu mới nhảy nhẹ hoặc đớp ong/chuồn chuồn, không nhảy nhiều")
            if (
              frog.state === 'IDLE' &&
              frog.hopCooldown <= 0 &&
              (currentPhase === 'PLAYING' || currentPhase === 'SETUP')
            ) {
              frog.hopCooldown = 14.0 + Math.random() * 14.0;

              const occupiedPads = new Set<number>();
              actors.frogs.forEach((f) => {
                occupiedPads.add(f.padIndex);
                occupiedPads.add(f.targetPadIndex);
              });

              const candidatePads: number[] = [];
              for (let pIdx = 0; pIdx < actors.lilyPads.length; pIdx++) {
                if (!occupiedPads.has(pIdx)) {
                  const pCandidate = actors.lilyPads[pIdx];
                  const dist = Math.hypot(
                    pCandidate.baseX - frog.rig.root.position.x,
                    pCandidate.baseZ - frog.rig.root.position.z
                  );
                  if (dist <= 6.2) {
                    candidatePads.push(pIdx);
                  }
                }
              }

              // Check if there is a wild Bee or Dragonfly flying nearby for an occasional aerial snack
              const targetedFlyers = new Set<number>();
              actors.frogs.forEach((f) => {
                if (f.jumpPreyFlyerIndex !== null) {
                  targetedFlyers.add(f.jumpPreyFlyerIndex);
                }
              });
              const nearbyFlyer = actors.dragonflies.find(
                (df) =>
                  df.state !== 'EATEN_RESPAWN' &&
                  !targetedFlyers.has(df.index) &&
                  Math.hypot(
                    df.rig.root.position.x - frog.rig.root.position.x,
                    df.rig.root.position.z - frog.rig.root.position.z
                  ) <= 4.5
              );

              if (pad) {
                const chosenPadIdx =
                  candidatePads.length > 0
                    ? candidatePads[
                        Math.floor(Math.random() * candidatePads.length)
                      ]
                    : frog.padIndex;
                const destPad = actors.lilyPads[chosenPadIdx];
                frog.targetPadIndex = chosenPadIdx;
                frog.jumpStartPos.set(pad.baseX, padTopY, pad.baseZ);
                frog.jumpEndPos.set(destPad.baseX, 0.08, destPad.baseZ);

                if (nearbyFlyer) {
                  frog.jumpPreyFlyerIndex = nearbyFlyer.index;
                  frog.jumpPreyStudentId = null;
                  frog.hasSnappedJumpPrey = false;
                  frog.jumpApexPos.copy(nearbyFlyer.rig.root.position);
                  frog.jumpYaw = Math.atan2(
                    nearbyFlyer.rig.root.position.x - pad.baseX,
                    nearbyFlyer.rig.root.position.z - pad.baseZ
                  );
                } else {
                  frog.jumpPreyFlyerIndex = null;
                  frog.jumpPreyStudentId = null;
                  frog.hasSnappedJumpPrey = false;
                  frog.jumpApexPos.set(
                    (pad.baseX + destPad.baseX) * 0.5,
                    0.85,
                    (pad.baseZ + destPad.baseZ) * 0.5
                  );
                  frog.jumpYaw =
                    chosenPadIdx !== frog.padIndex
                      ? Math.atan2(
                          destPad.baseX - pad.baseX,
                          destPad.baseZ - pad.baseZ
                        )
                      : frog.rig.root.rotation.y;
                }
              }

              frog.state = 'PREPARE_JUMP';
              frog.stateTimer = 0;
              frog.stateDuration = 0.16;
            }
          } else if (frog.state === 'PREPARE_JUMP') {
            frog.rig.root.position.y = padTopY - 0.06;
            frog.rig.bodyGroup.scale.set(1.08, 0.8, 1.08);
            frog.rig.root.rotation.y = THREE.MathUtils.damp(
              frog.rig.root.rotation.y,
              frog.jumpYaw,
              16,
              dt
            );
            if (frog.stateTimer >= frog.stateDuration) {
              frog.state = 'JUMP';
              frog.stateTimer = 0;
              const isAerialHunt =
                frog.jumpPreyFlyerIndex !== null ||
                frog.jumpPreyStudentId !== null;
              const jumpDist = frog.jumpStartPos.distanceTo(frog.jumpEndPos);
              frog.stateDuration = isAerialHunt
                ? 0.52
                : jumpDist > 0.2
                ? THREE.MathUtils.clamp(0.32 + jumpDist * 0.045, 0.34, 0.54)
                : 0.32;
              if (pad) {
                pad.dipVel = -1.25;
                pad.ripplePhase = 0;
              }
              audioManager.playFrogJump();
            }
          } else if (frog.state === 'JUMP') {
            const p = Math.min(1, frog.stateTimer / frog.stateDuration);
            const isAerialHunt =
              frog.jumpPreyFlyerIndex !== null ||
              frog.jumpPreyStudentId !== null;

            // Update apex dynamically while ascending toward a flying bee or dragonfly
            if (p < 0.5) {
              if (jumpStudentIns && jumpStudentIns.status !== 'CAUGHT') {
                frog.jumpApexPos.copy(jumpStudentIns.pos);
              } else if (
                jumpWildFlyer &&
                jumpWildFlyer.state !== 'EATEN_RESPAWN'
              ) {
                frog.jumpApexPos.copy(jumpWildFlyer.rig.root.position);
              }
            }

            if (isAerialHunt) {
              // 3D Quadratic Bezier arc leaping right up to the flying bee/dragonfly's position!
              const invP = 1 - p;
              frog.rig.root.position.x =
                invP * invP * frog.jumpStartPos.x +
                2 * invP * p * frog.jumpApexPos.x +
                p * p * frog.jumpEndPos.x;
              frog.rig.root.position.y =
                invP * invP * frog.jumpStartPos.y +
                2 * invP * p * Math.max(1.35, frog.jumpApexPos.y - 0.35) +
                p * p * frog.jumpEndPos.y;
              frog.rig.root.position.z =
                invP * invP * frog.jumpStartPos.z +
                2 * invP * p * frog.jumpApexPos.z +
                p * p * frog.jumpEndPos.z;

              // Open mouth & flick short tongue near apex (p = 0.35..0.68) to eat the bee/dragonfly mid-air!
              if (p > 0.3 && p < 0.72) {
                frog.rig.jawGroup.rotation.x = 0.72;
                frog.rig.tongueGroup.visible = true;
                frog.rig.tongueShaft.scale.set(1, 1, 0.48);
                frog.rig.tongueTip.position.set(0, 0, 0.48);
              } else {
                frog.rig.jawGroup.rotation.x = 0;
                frog.rig.tongueGroup.visible = false;
              }

              // Snap the flying bee/dragonfly at apex (p >= 0.48)
              if (p >= 0.48 && !frog.hasSnappedJumpPrey) {
                frog.hasSnappedJumpPrey = true;
                if (jumpStudentIns && jumpStudentIns.status !== 'CAUGHT') {
                  audioManager.playCatchPop();
                  spawnCatchBurst(
                    jumpStudentIns.pos,
                    INSECT_BADGE_COLORS[jumpStudentIns.type]
                  );
                  jumpStudentIns.status = 'CAUGHT';
                  jumpStudentIns.rig.root.visible = false;
                  if (jumpStudentIns.labelEl) {
                    jumpStudentIns.labelEl.style.opacity = '0';
                  }
                  if (plan) {
                    const sched = plan.catchSchedule.find(
                      (s) => s.studentId === jumpStudentIns.id
                    );
                    if (sched) sched.completed = true;
                  }
                  frog.jumpPreyStudentId = null;
                } else if (
                  jumpWildFlyer &&
                  jumpWildFlyer.state !== 'EATEN_RESPAWN'
                ) {
                  if (currentPhase === 'PLAYING') {
                    audioManager.playCatchPop();
                  }
                  spawnCatchBurst(
                    jumpWildFlyer.rig.root.position,
                    jumpWildFlyer.flairColorHex
                  );
                  jumpWildFlyer.state = 'EATEN_RESPAWN';
                  jumpWildFlyer.stateTimer = 0;
                  jumpWildFlyer.rig.root.visible = false;
                  frog.jumpPreyFlyerIndex = null;
                }
              }
            } else {
              // Standard pad-to-pad parabolic jump
              const jumpDist = frog.jumpStartPos.distanceTo(frog.jumpEndPos);
              const arcHeight =
                jumpDist > 0.2
                  ? Math.min(1.45, 0.65 + jumpDist * 0.16)
                  : 0.65;
              const arc = Math.sin(p * Math.PI) * arcHeight;

              frog.rig.root.position.x = THREE.MathUtils.lerp(
                frog.jumpStartPos.x,
                frog.jumpEndPos.x,
                p
              );
              frog.rig.root.position.z = THREE.MathUtils.lerp(
                frog.jumpStartPos.z,
                frog.jumpEndPos.z,
                p
              );
              frog.rig.root.position.y = padTopY + arc;
            }

            const targetYaw =
              p < 0.75 ? frog.jumpYaw : -frog.jumpEndPos.x * 0.045;
            frog.rig.root.rotation.y = THREE.MathUtils.damp(
              frog.rig.root.rotation.y,
              targetYaw,
              12,
              dt
            );

            frog.rig.bodyGroup.rotation.x = Math.cos(p * Math.PI) * -0.36;
            frog.rig.leftHindLeg.rotation.x = Math.sin(p * Math.PI) * 0.82;
            frog.rig.rightHindLeg.rotation.x = frog.rig.leftHindLeg.rotation.x;

            if (p >= 1) {
              frog.padIndex = frog.targetPadIndex;
              frog.jumpPreyFlyerIndex = null;
              frog.jumpPreyStudentId = null;
              frog.rig.tongueGroup.visible = false;
              frog.rig.jawGroup.rotation.x = 0;

              const landedPad = actors.lilyPads[frog.padIndex];
              frog.state = 'LAND';
              frog.stateTimer = 0;
              frog.stateDuration = 0.18;
              frog.rig.bodyGroup.rotation.x = 0;
              frog.rig.leftHindLeg.rotation.x = 0;
              frog.rig.rightHindLeg.rotation.x = 0;
              if (landedPad) {
                landedPad.dipVel = -1.75;
                landedPad.ripplePhase = 0;
                _tempVec2.set(landedPad.baseX, 0.03, landedPad.baseZ);
                spawnCatchBurst(_tempVec2, '#7dd3fc', true);
              }
              audioManager.playLilyPadLand();
            }
          } else if (frog.state === 'LAND') {
            frog.rig.root.position.y = padTopY;
            frog.rig.bodyGroup.scale.set(1.12, 0.84, 1.12);
            if (pad) {
              frog.rig.root.rotation.y = THREE.MathUtils.damp(
                frog.rig.root.rotation.y,
                -pad.baseX * 0.045,
                14,
                dt
              );
            }
            if (frog.stateTimer >= frog.stateDuration) {
              frog.state = 'IDLE';
              frog.stateTimer = 0;
            }
          } else if (frog.state === 'PREPARE_CATCH') {
            frog.rig.root.position.y = padTopY;
            frog.rig.jawGroup.rotation.x = THREE.MathUtils.damp(
              frog.rig.jawGroup.rotation.x,
              0.72,
              22,
              dt
            );
            const activePreyPos = targetIns
              ? targetIns.pos
              : targetSnail
              ? targetSnail.caughtStartPos
              : null;
            if (activePreyPos) {
              const desiredYaw = THREE.MathUtils.clamp(
                (activePreyPos.x - frog.rig.root.position.x) * 0.18,
                -0.65,
                0.65
              );
              frog.rig.root.rotation.y = THREE.MathUtils.damp(
                frog.rig.root.rotation.y,
                desiredYaw,
                18,
                dt
              );
            }
            if (frog.stateTimer >= frog.stateDuration) {
              frog.state = 'TONGUE_CATCH';
              frog.stateTimer = 0;
              const avgGapMs = plan
                ? tState.totalDurationMs / Math.max(1, plan.catchSchedule.length)
                : 400;
              frog.stateDuration = targetIns
                ? Math.min(0.24, Math.max(0.11, (avgGapMs / 1000) * 0.55))
                : 0.24;
              if (targetIns) {
                targetIns.caughtStartPos.copy(targetIns.pos);
              } else if (targetSnail) {
                targetSnail.caughtStartPos.copy(targetSnail.rig.root.position);
              }
            }
          } else if (frog.state === 'TONGUE_CATCH') {
            frog.rig.root.position.y = padTopY;
            frog.rig.jawGroup.rotation.x = 0.75;

            if (!targetIns && !targetSnail) {
              frog.rig.tongueGroup.visible = false;
              frog.state = 'IDLE';
              frog.stateTimer = 0;
            } else if (targetIns) {
              const p = Math.min(1, frog.stateTimer / frog.stateDuration);
              const extendRatio = p < 0.5 ? p * 2 : (1 - p) * 2;

              frog.rig.tongueGroup.visible = true;
              frog.rig.tongueGroup.getWorldPosition(_worldMouthPos);

              if (p >= 0.5) {
                if (targetIns.caughtProgress === 0) {
                  targetIns.caughtProgress = 0.01;
                  audioManager.playCatchPop();
                  spawnCatchBurst(
                    targetIns.caughtStartPos,
                    INSECT_BADGE_COLORS[targetIns.type]
                  );
                }
                const pullT = (p - 0.5) * 2;
                targetIns.pos.lerpVectors(
                  targetIns.caughtStartPos,
                  _worldMouthPos,
                  pullT
                );
                targetIns.rig.root.position.copy(targetIns.pos);
                targetIns.rig.root.scale.setScalar((1 - pullT * 0.85) * 0.8);
                if (targetIns.labelEl) {
                  targetIns.labelEl.style.opacity = String(
                    Math.max(0, 1 - pullT * 1.4)
                  );
                }
              }

              _localTargetPos.copy(targetIns.caughtStartPos);
              frog.rig.headGroup.worldToLocal(_localTargetPos);
              _diffVec.copy(_localTargetPos).sub(frog.rig.tongueGroup.position);
              const fullDist = Math.max(0.1, _diffVec.length());
              const currentLen = Math.max(0.05, fullDist * extendRatio);

              frog.rig.tongueGroup.lookAt(targetIns.caughtStartPos);
              frog.rig.tongueShaft.scale.set(1, 1, currentLen);
              frog.rig.tongueTip.position.set(0, 0, currentLen);

              if (p >= 1) {
                targetIns.status = 'CAUGHT';
                targetIns.rig.root.visible = false;
                if (targetIns.labelEl) {
                  targetIns.labelEl.style.opacity = '0';
                }
                if (plan) {
                  const sched = plan.catchSchedule.find(
                    (s) => s.studentId === targetIns.id
                  );
                  if (sched) sched.completed = true;
                }

                frog.targetStudentId = null;
                frog.rig.tongueGroup.visible = false;
                frog.state = 'EAT_REACT';
                frog.stateTimer = 0;
                frog.stateDuration = 0.14;
              }
            } else if (targetSnail) {
              const p = Math.min(1, frog.stateTimer / frog.stateDuration);
              const extendRatio = p < 0.5 ? p * 2 : (1 - p) * 2;

              frog.rig.tongueGroup.visible = true;
              frog.rig.tongueGroup.getWorldPosition(_worldMouthPos);

              if (p >= 0.5) {
                if (targetSnail.stateTimer === 0) {
                  targetSnail.stateTimer = 0.01;
                  if (currentPhase === 'PLAYING') {
                    audioManager.playCatchPop();
                  }
                  spawnCatchBurst(targetSnail.caughtStartPos, '#fde047');
                }
                const pullT = (p - 0.5) * 2;
                targetSnail.rig.root.position.lerpVectors(
                  targetSnail.caughtStartPos,
                  _worldMouthPos,
                  pullT
                );
                targetSnail.rig.root.scale.setScalar((1 - pullT * 0.85) * 0.92);
              }

              _localTargetPos.copy(targetSnail.caughtStartPos);
              frog.rig.headGroup.worldToLocal(_localTargetPos);
              _diffVec.copy(_localTargetPos).sub(frog.rig.tongueGroup.position);
              const fullDist = Math.max(0.1, _diffVec.length());
              const currentLen = Math.max(0.05, fullDist * extendRatio);

              frog.rig.tongueGroup.lookAt(targetSnail.caughtStartPos);
              frog.rig.tongueShaft.scale.set(1, 1, currentLen);
              frog.rig.tongueTip.position.set(0, 0, currentLen);

              if (p >= 1) {
                targetSnail.state = 'RESPAWNING';
                targetSnail.stateTimer = 0;
                targetSnail.rig.root.visible = false;
                frog.targetSnailIndex = null;
                frog.rig.tongueGroup.visible = false;
                frog.state = 'EAT_REACT';
                frog.stateTimer = 0;
                frog.stateDuration = 0.16;
              }
            }
          } else if (frog.state === 'EAT_REACT') {
            frog.rig.root.position.y = padTopY;
            frog.rig.jawGroup.rotation.x = THREE.MathUtils.damp(
              frog.rig.jawGroup.rotation.x,
              Math.sin(frog.stateTimer * 28) * 0.18,
              25,
              dt
            );
            const gulp = Math.sin(
              (frog.stateTimer / frog.stateDuration) * Math.PI
            );
            frog.rig.bodyGroup.scale.set(
              1 + gulp * 0.16,
              1 - gulp * 0.08,
              1 + gulp * 0.16
            );
            frog.rig.leftCheek.scale.set(
              1.15 + gulp * 0.45,
              0.78 + gulp * 0.35,
              0.92 + gulp * 0.35
            );
            frog.rig.rightCheek.scale.copy(frog.rig.leftCheek.scale);
            if (frog.stateTimer >= frog.stateDuration) {
              frog.state = 'IDLE';
              frog.stateTimer = 0;
              frog.cuteWiggleTimer = 0.75;
            }
          } else if (frog.state === 'CELEBRATE') {
            const cycle = (frog.stateTimer * 3.4) % (Math.PI * 2);
            const hop = Math.max(0, Math.sin(cycle));
            frog.rig.root.position.y = padTopY + hop * 0.28;
            frog.rig.jawGroup.rotation.x = hop * 0.28;
            frog.rig.leftFrontLeg.rotation.x = -0.8 + Math.sin(cycle * 2) * 0.35;
            frog.rig.rightFrontLeg.rotation.x = -0.8 - Math.sin(cycle * 2) * 0.35;
            if (pad) {
              frog.rig.root.rotation.y =
                -pad.baseX * 0.045 + Math.sin(frog.stateTimer * 4) * 0.18;
            }
          }
        });
      }

      // ====================================================================
      // 4B. UPDATE POND FISH: SWIMMING & OCCASIONALLY LEAPING
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        actors.fishes.forEach((fish) => {
          const wagFreq = fish.state === 'LEAPING' ? 28 : 11;
          const wagAmp = fish.state === 'LEAPING' ? 0.48 : 0.28;
          fish.rig.tailGroup.rotation.y =
            Math.sin(elapsedVisualTime * wagFreq + fish.index * 1.7) * wagAmp;

          if (fish.state === 'SWIMMING') {
            fish.swimAngle += dt * fish.swimSpeed * 0.55;
            fish.leapCooldown -= dt;

            const nextX =
              fish.swimCenterX +
              Math.cos(fish.swimAngle) * fish.swimRadiusX +
              Math.sin(fish.swimAngle * 2.1) * 0.45;
            const nextZ =
              fish.swimCenterZ +
              Math.sin(fish.swimAngle) * fish.swimRadiusZ;

            const dx = nextX - fish.rig.root.position.x;
            const dz = nextZ - fish.rig.root.position.z;

            fish.rig.root.position.set(
              nextX,
              -0.14 + Math.sin(elapsedVisualTime * 2.5 + fish.index) * 0.03,
              nextZ
            );

            if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
              const targetYaw = Math.atan2(dx, dz);
              fish.rig.root.rotation.y = THREE.MathUtils.damp(
                fish.rig.root.rotation.y,
                targetYaw,
                8,
                dt
              );
            }
            fish.rig.bodyGroup.rotation.x = THREE.MathUtils.damp(
              fish.rig.bodyGroup.rotation.x,
              0,
              8,
              dt
            );

            if (
              fish.leapCooldown <= 0 &&
              (currentPhase === 'SETUP' || currentPhase === 'PLAYING')
            ) {
              fish.leapCooldown = 12.0 + Math.random() * 11.0;
              fish.state = 'LEAPING';
              fish.stateTimer = 0;
              fish.stateDuration = 0.68;
              fish.targetStudentId = null;
              fish.hasSnappedPrey = false;
              fish.leapStartPos.copy(fish.rig.root.position);
              fish.leapStartPos.y = -0.05;

              const forwardYaw = fish.rig.root.rotation.y;
              const jumpDist = 2.1;
              fish.leapEndPos.set(
                THREE.MathUtils.clamp(
                  fish.leapStartPos.x + Math.sin(forwardYaw) * jumpDist,
                  -6.5,
                  6.5
                ),
                -0.14,
                THREE.MathUtils.clamp(
                  fish.leapStartPos.z + Math.cos(forwardYaw) * jumpDist,
                  -2.8,
                  4.3
                )
              );
              fish.leapApexPos.set(
                (fish.leapStartPos.x + fish.leapEndPos.x) * 0.5,
                1.45 + Math.random() * 0.55,
                (fish.leapStartPos.z + fish.leapEndPos.z) * 0.5
              );

              spawnCatchBurst(fish.leapStartPos, '#bae6fd', true);
              if (currentPhase === 'PLAYING') {
                audioManager.playFishSplash();
              }
            }
          } else if (fish.state === 'LEAPING') {
            fish.stateTimer += dt;
            const p = Math.min(1, fish.stateTimer / fish.stateDuration);

            const targetIns = fish.targetStudentId
              ? actors.insects.find((ins) => ins.id === fish.targetStudentId)
              : null;

            if (targetIns && p < 0.5) {
              fish.leapApexPos.copy(targetIns.pos);
            }

            const invP = 1 - p;
            const curX =
              invP * invP * fish.leapStartPos.x +
              2 * invP * p * fish.leapApexPos.x +
              p * p * fish.leapEndPos.x;
            const curY =
              invP * invP * fish.leapStartPos.y +
              2 * invP * p * fish.leapApexPos.y +
              p * p * fish.leapEndPos.y;
            const curZ =
              invP * invP * fish.leapStartPos.z +
              2 * invP * p * fish.leapApexPos.z +
              p * p * fish.leapEndPos.z;

            const prevX = fish.rig.root.position.x;
            const prevY = fish.rig.root.position.y;
            const prevZ = fish.rig.root.position.z;

            fish.rig.root.position.set(curX, curY, curZ);

            const vx = curX - prevX;
            const vy = curY - prevY;
            const vz = curZ - prevZ;
            const horizSpeed = Math.hypot(vx, vz);
            if (horizSpeed > 0.0001) {
              fish.rig.root.rotation.y = Math.atan2(vx, vz);
            }
            fish.rig.bodyGroup.rotation.x = -Math.atan2(
              vy,
              Math.max(0.01, horizSpeed)
            );

            if (p >= 0.5 && !fish.hasSnappedPrey) {
              fish.hasSnappedPrey = true;
              if (targetIns) {
                audioManager.playCatchPop();
                spawnCatchBurst(
                  targetIns.pos,
                  INSECT_BADGE_COLORS[targetIns.type]
                );
                targetIns.status = 'CAUGHT';
                targetIns.rig.root.visible = false;
                if (targetIns.labelEl) {
                  targetIns.labelEl.style.opacity = '0';
                }
                if (plan) {
                  const sched = plan.catchSchedule.find(
                    (s) => s.studentId === targetIns.id
                  );
                  if (sched) sched.completed = true;
                }
              } else {
                spawnCatchBurst(fish.leapApexPos, '#fef08a', false);
              }
            }

            if (p >= 1) {
              spawnCatchBurst(fish.leapEndPos, '#7dd3fc', true);
              if (currentPhase === 'PLAYING') {
                audioManager.playLilyPadLand();
              }
              fish.state = 'SWIMMING';
              fish.stateTimer = 0;
              fish.targetStudentId = null;
              fish.rig.bodyGroup.rotation.x = 0;
            }
          }
        });
      }

      // ====================================================================
      // 5. UPDATE CATCH PARTICLE BURSTS & WATER SPLASH RINGS
      // ====================================================================
      if (currentPhase !== 'PAUSED') {
        for (let i = actors.bursts.length - 1; i >= 0; i--) {
          const b = actors.bursts[i];
          b.age += dt;
          if (b.age >= b.maxAge) {
            EffectsGroup.remove(b.mesh);
            b.mat.dispose();
            actors.bursts.splice(i, 1);
          } else {
            const p = b.age / b.maxAge;
            const s = 1 + p * (b.isWaterSplash ? 3.8 : 2.8);
            b.mesh.scale.set(s, s, 1);
            b.mat.opacity = (1 - p) * (b.isWaterSplash ? 0.65 : 0.9);
          }
        }
      }

      // ====================================================================
      // 6. PROJECT 3D INSECT ANCHORS TO 2D DOM NAME LABELS
      // ====================================================================
      for (let i = 0; i < actors.insects.length; i++) {
        const ins = actors.insects[i];
        const el = ins.labelEl;
        if (!el) continue;

        if (ins.status === 'CAUGHT' || currentPhase === 'RESULT') {
          el.style.opacity = '0';
          continue;
        }

        _projVec.copy(ins.rig.root.position);
        _projVec.y += 0.42;
        _projVec.project(camera);

        const screenX = (_projVec.x * 0.5 + 0.5) * w;
        const screenY = (-_projVec.y * 0.5 + 0.5) * h;

        const isRevealingWinner =
          currentPhase === 'REVEALING' && ins.isWinner;
        const scale = isRevealingWinner ? 1.35 : 1;

        el.style.transform = `translate3d(${screenX.toFixed(
          1
        )}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -100%) scale(${scale})`;

        if (ins.status === 'FLYING' || ins.status === 'WINNER') {
          el.style.opacity = '1';
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvasEl.removeEventListener('pointermove', handlePointerMove);
      canvasEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      skyEnvTexture.dispose();
      waterTexture.dispose();
      renderer.dispose();
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dedicated WebGL Mount Container */}
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Crisp 2D Projected Vietnamese Name Labels Layer */}
      <div
        ref={labelsContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      />
    </div>
  );
};
