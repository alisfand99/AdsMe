"use client";

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Grid, Line, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";

import type { CanvasSceneAdjustments } from "@/lib/canvas/canvas-adjustments";
import { cn } from "@/lib/utils";

const SUBJECT_Y = 0.85;
const LIGHT_RADIUS = 4.4;
const BASE_CAM_DIST = 4.35;

function shootCameraWorld(
  yawDeg: number,
  pitchDeg: number,
  zoom: number
): THREE.Vector3 {
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const pitch = THREE.MathUtils.degToRad(pitchDeg);
  const r =
    BASE_CAM_DIST / THREE.MathUtils.clamp(zoom, 0.55, 1.45);
  const cp = Math.cos(pitch);
  const x = r * cp * Math.sin(yaw);
  const y = r * Math.sin(pitch) + SUBJECT_Y;
  const z = r * cp * Math.cos(yaw);
  return new THREE.Vector3(x, y, z);
}

function lightWorldFromAngles(
  azDeg: number,
  elDeg: number,
  radius: number
): THREE.Vector3 {
  const az = THREE.MathUtils.degToRad(azDeg);
  const el = THREE.MathUtils.degToRad(elDeg);
  const h = radius * Math.cos(el);
  const x = h * Math.sin(az);
  const y = radius * Math.sin(el) + SUBJECT_Y;
  const z = h * Math.cos(az);
  return new THREE.Vector3(x, y, z);
}

function anglesFromPointOnSphere(
  p: THREE.Vector3,
  center: THREE.Vector3
): { az: number; el: number } {
  const lx = p.x - center.x;
  const ly = p.y - center.y;
  const lz = p.z - center.z;
  const r = Math.sqrt(lx * lx + ly * ly + lz * lz);
  if (r < 1e-4) {
    return { az: 45, el: 38 };
  }
  const elRaw = Math.asin(THREE.MathUtils.clamp(ly / r, -1, 1));
  const el = THREE.MathUtils.radToDeg(elRaw);
  let az = THREE.MathUtils.radToDeg(Math.atan2(lx, lz));
  if (az < 0) az += 360;
  return {
    az,
    el: THREE.MathUtils.clamp(el, 8, 82),
  };
}

function intersectRaySphere(
  ray: THREE.Ray,
  center: THREE.Vector3,
  radius: number
): THREE.Vector3 | null {
  const oc = ray.origin.clone().sub(center);
  const b = oc.dot(ray.direction);
  const c = oc.dot(oc) - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  if (t < 0) return null;
  return ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
}

type SceneProps = {
  adjustments: CanvasSceneAdjustments;
  onChange: (next: CanvasSceneAdjustments) => void;
  interactive: boolean;
};

function SubjectCube({ rollDeg }: { rollDeg: number }) {
  const roll = THREE.MathUtils.degToRad(rollDeg);
  const s = 1.12;
  const h = s / 2 + 0.03;
  const fs = 0.1;
  const tc = "#94a3b8";
  return (
    <group position={[0, SUBJECT_Y, 0]} rotation={[0, 0, roll]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial
          color="#8b93a0"
          metalness={0.42}
          roughness={0.42}
        />
      </mesh>
      <Text position={[0, 0, h]} fontSize={fs} color={tc} anchorX="center" anchorY="middle">
        F
      </Text>
      <Text
        position={[0, 0, -h]}
        rotation={[0, Math.PI, 0]}
        fontSize={fs}
        color={tc}
        anchorX="center"
        anchorY="middle"
      >
        B
      </Text>
      <Text
        position={[h, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={fs}
        color={tc}
        anchorX="center"
        anchorY="middle"
      >
        R
      </Text>
      <Text
        position={[-h, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={fs}
        color={tc}
        anchorX="center"
        anchorY="middle"
      >
        L
      </Text>
      <Text
        position={[0, h, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fs}
        color={tc}
        anchorX="center"
        anchorY="middle"
      >
        U
      </Text>
      <Text
        position={[0, -h, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={fs}
        color={tc}
        anchorX="center"
        anchorY="middle"
      >
        D
      </Text>
    </group>
  );
}

function ShootCameraGizmo({
  cam,
  target,
}: {
  cam: THREE.Vector3;
  target: THREE.Vector3;
}) {
  const q = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(target, cam).normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir
    );
  }, [cam, target]);

  return (
    <group position={cam} quaternion={q}>
      <mesh castShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.38]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.55}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.14, 0.2, 10]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#1d4ed8"
          emissiveIntensity={0.28}
        />
      </mesh>
    </group>
  );
}

function DraggableLightOrb({
  position,
  center,
  radius,
  interactive,
  onDragAngles,
  onOrbitLockChange,
}: {
  position: THREE.Vector3;
  center: THREE.Vector3;
  radius: number;
  interactive: boolean;
  onDragAngles: (az: number, el: number) => void;
  onOrbitLockChange: (locked: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!interactive) return;
      e.stopPropagation();
      dragging.current = true;
      pointerId.current = e.pointerId;
      onOrbitLockChange(true);
      gl.domElement.setPointerCapture(e.pointerId);
    },
    [gl.domElement, interactive, onOrbitLockChange]
  );

  const moveFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(x, y), camera);
      const hit = intersectRaySphere(ray.ray, center, radius);
      if (!hit) return;
      const { az, el } = anglesFromPointOnSphere(hit, center);
      onDragAngles(az, el);
    },
    [camera, center, gl.domElement, onDragAngles, radius]
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || e.pointerId !== pointerId.current) return;
      e.stopPropagation();
      moveFromClient(e.clientX, e.clientY);
    },
    [moveFromClient]
  );

  const endDrag = useCallback(
    (e?: ThreeEvent<PointerEvent>) => {
      if (e && e.pointerId !== pointerId.current) return;
      dragging.current = false;
      pointerId.current = null;
      onOrbitLockChange(false);
      try {
        if (e?.pointerId != null) {
          gl.domElement.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }
    },
    [gl.domElement, onOrbitLockChange]
  );

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        if (dragging.current) endDrag(e);
      }}
    >
      <sphereGeometry args={[0.22, 20, 20]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={interactive ? 0.55 : 0.2}
        metalness={0.15}
        roughness={0.35}
      />
    </mesh>
  );
}

function SceneInner({ adjustments, onChange, interactive }: SceneProps) {
  const [orbitLocked, setOrbitLocked] = useState(false);
  const lightCenter = useMemo(
    () => new THREE.Vector3(0, SUBJECT_Y, 0),
    []
  );
  const target = useMemo(
    () => new THREE.Vector3(0, SUBJECT_Y, 0),
    []
  );

  const camPos = useMemo(
    () =>
      shootCameraWorld(
        adjustments.orbitYawDeg,
        adjustments.orbitPitchDeg,
        adjustments.framingZoom
      ),
    [
      adjustments.framingZoom,
      adjustments.orbitPitchDeg,
      adjustments.orbitYawDeg,
    ]
  );

  const lightPos = useMemo(
    () =>
      lightWorldFromAngles(
        adjustments.lightAzimuthDeg,
        adjustments.lightElevationDeg,
        LIGHT_RADIUS
      ),
    [adjustments.lightAzimuthDeg, adjustments.lightElevationDeg]
  );

  const lineCam = useMemo(
    () => [
      [camPos.x, camPos.y, camPos.z] as [number, number, number],
      [0, SUBJECT_Y, 0] as [number, number, number],
    ],
    [camPos.x, camPos.y, camPos.z]
  );

  const lineLight = useMemo(
    () => [
      [lightPos.x, lightPos.y, lightPos.z] as [number, number, number],
      [0, SUBJECT_Y, 0] as [number, number, number],
    ],
    [lightPos.x, lightPos.y, lightPos.z]
  );

  const soft = 1 - adjustments.lightHardness;
  const dirIntensity = 0.65 + adjustments.lightHardness * 1.1;

  const onDragAngles = useCallback(
    (az: number, el: number) => {
      onChange({
        ...adjustments,
        lightAzimuthDeg: az,
        lightElevationDeg: el,
      });
    },
    [adjustments, onChange]
  );

  return (
    <>
      <color attach="background" args={["#0a0a0c"]} />
      <ambientLight intensity={0.22 + soft * 0.38} />

      <directionalLight
        position={[lightPos.x, lightPos.y, lightPos.z]}
        intensity={dirIntensity}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-far={24}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#141418" roughness={0.92} metalness={0.05} />
      </mesh>

      <Grid
        args={[14, 14]}
        cellSize={0.45}
        cellThickness={0.6}
        cellColor="#2a2a32"
        sectionSize={2.7}
        sectionThickness={1}
        sectionColor="#3f3f4a"
        fadeDistance={18}
        fadeStrength={1.1}
        infiniteGrid
        position={[0, 0.002, 0]}
      />

      <SubjectCube rollDeg={adjustments.subjectRollDeg} />

      <Line
        points={lineCam}
        color="#3b82f6"
        opacity={0.4}
        transparent
        lineWidth={1}
      />

      <ShootCameraGizmo cam={camPos} target={target} />

      <Line
        points={lineLight}
        color="#fbbf24"
        opacity={0.45}
        transparent
        lineWidth={1}
      />

      <DraggableLightOrb
        position={lightPos}
        center={lightCenter}
        radius={LIGHT_RADIUS}
        interactive={interactive}
        onDragAngles={onDragAngles}
        onOrbitLockChange={setOrbitLocked}
      />

      <OrbitControls
        makeDefault
        target={[0, SUBJECT_Y, 0]}
        enablePan={false}
        enableRotate={!orbitLocked}
        minDistance={2.8}
        maxDistance={14}
        maxPolarAngle={Math.PI * 0.92}
        minPolarAngle={0.12}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

type Scene3DSchematicProps = {
  adjustments: CanvasSceneAdjustments;
  onChange: (next: CanvasSceneAdjustments) => void;
  interactive: boolean;
  className?: string;
};

export function Scene3DSchematic({
  adjustments,
  onChange,
  interactive,
  className,
}: Scene3DSchematicProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border-b border-white/10 bg-[#08080a]",
        className
      )}
    >
      <p className="pointer-events-none absolute left-2 top-2 z-10 max-w-[90%] text-[9px] leading-tight text-muted-foreground/90 max-lg:left-1 max-lg:top-1 max-lg:max-w-[85%] max-lg:text-[7px] max-lg:leading-tight">
        {interactive ? (
          <>
            Cube: F/B/L/R/U/D = product faces · Orbit view · Drag sun = key light
          </>
        ) : (
          <>Preview only — enable scene tools to edit light</>
        )}
      </p>
      <div className="h-[min(200px,28dvh)] w-full min-h-[160px] max-lg:h-[min(112px,20dvh)] max-lg:min-h-[96px]">
        <Canvas
          shadows
          camera={{ position: [5.2, 3.4, 5.4], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "low-power",
          }}
          dpr={[1, 1.75]}
        >
          <SceneInner
            adjustments={adjustments}
            onChange={onChange}
            interactive={interactive}
          />
        </Canvas>
      </div>
    </div>
  );
}
