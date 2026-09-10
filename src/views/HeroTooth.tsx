import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { HERO_TOOTH } from "../domain/types";
import type { Exam } from "../domain/types";

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function Molar({
  current,
  lastVisit,
  timeline,
}: {
  current: Exam;
  lastVisit: Exam;
  timeline: number;
}) {
  const group = useRef<Group>(null);
  const gum = useRef<Mesh>(null);
  const bleed = useRef<Mesh>(null);

  const lastDistal = lastVisit.teeth[HERO_TOOTH]?.sites.DB.pd ?? 3;
  const nowDistal = current.teeth[HERO_TOOTH]?.sites.DB.pd ?? lastDistal;
  const bleeding = Boolean(current.teeth[HERO_TOOTH]?.sites.DB.bop);
  const pd = lerp(lastDistal, nowDistal, timeline);

  const gumY = useMemo(() => 0.15 - (pd - 2) * 0.07, [pd]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.18;
    }
    if (bleed.current) {
      const pulse = bleeding ? 0.06 + Math.sin(performance.now() / 180) * 0.03 : 0;
      bleed.current.scale.setScalar(pulse > 0 ? 1 + pulse : 0.0001);
      bleed.current.visible = bleeding;
    }
    if (gum.current) {
      gum.current.position.y += (gumY - gum.current.position.y) * 0.08;
    }
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshPhysicalMaterial
          color="#f4efe6"
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.12}
          transmission={0.08}
          thickness={0.4}
        />
      </mesh>
      <mesh position={[-0.22, 0.92, 0.18]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshPhysicalMaterial color="#f7f2ea" roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0.22, 0.92, 0.18]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshPhysicalMaterial color="#f7f2ea" roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[-0.18, 0.88, -0.2]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshPhysicalMaterial color="#f7f2ea" roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0.18, 0.88, -0.2]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshPhysicalMaterial color="#f7f2ea" roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[-0.16, -0.35, 0.08]} rotation={[0.2, 0, 0.12]}>
        <cylinderGeometry args={[0.12, 0.07, 1.1, 24]} />
        <meshPhysicalMaterial color="#f0e6d8" roughness={0.35} />
      </mesh>
      <mesh position={[0.16, -0.35, 0.08]} rotation={[0.2, 0, -0.12]}>
        <cylinderGeometry args={[0.12, 0.07, 1.1, 24]} />
        <meshPhysicalMaterial color="#f0e6d8" roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.28, -0.14]} rotation={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.06, 1.0, 24]} />
        <meshPhysicalMaterial color="#f0e6d8" roughness={0.35} />
      </mesh>
      <mesh ref={gum} position={[0, gumY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.22, 24, 64]} />
        <meshPhysicalMaterial color="#d48b93" roughness={0.45} sheen={1} sheenColor="#f3c2c7" />
      </mesh>
      <mesh ref={bleed} position={[0.55, 0.05, 0.15]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#c23b3b" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function HeroTooth({
  current,
  lastVisit,
  timeline,
}: {
  current: Exam;
  lastVisit: Exam;
  timeline: number;
}) {
  const lastDistal = lastVisit.teeth[HERO_TOOTH]?.sites.DB.pd ?? 3;
  const nowDistal = current.teeth[HERO_TOOTH]?.sites.DB.pd ?? lastDistal;
  const shown = Math.round(lerp(lastDistal, nowDistal, timeline));

  return (
    <div className="hero-stage">
      <Canvas camera={{ position: [1.8, 1.1, 2.4], fov: 40 }} shadows>
        <color attach="background" args={["#090c10"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} castShadow />
        <directionalLight position={[-3, 1, -2]} intensity={0.4} color="#8fb7d2" />
        <Molar current={current} lastVisit={lastVisit} timeline={timeline} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="timeline" style={{ top: "auto", bottom: "28%", left: "24px", right: "auto", width: "auto" }}>
        {lastDistal} mm → {shown} mm
      </div>
    </div>
  );
}
