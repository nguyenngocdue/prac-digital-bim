import * as THREE from "three";
import { useMemo } from "react";

type ProArrowProps = {
  origin: THREE.Vector3;
  direction: THREE.Vector3; // normalized
  length?: number;
  radius?: number;
  headLength?: number;
  headRadius?: number;
  color?: number;
};

export function ProArrow({
  origin,
  direction,
  length = 2.2,
  radius = 0.035,
  headLength = 0.55,
  headRadius = 0.10,
  color = 0x22c55e,
}: ProArrowProps) {
  const dir = useMemo(() => direction.clone().normalize(), [direction]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    // default arrow points +Y, rotate to direction
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);

  // thân
  const shaftLen = Math.max(0.001, length - headLength);

  const shaftPos = useMemo(() => new THREE.Vector3(0, shaftLen * 0.5, 0), [shaftLen]);
  const headPos = useMemo(
    () => new THREE.Vector3(0, shaftLen + headLength * 0.5, 0),
    [shaftLen, headLength]
  );

  return (
    <group position={origin} quaternion={quat} renderOrder={999}>
      {/* Shaft */}
      <mesh position={shaftPos} frustumCulled={false}>
        <cylinderGeometry args={[radius, radius, shaftLen, 20, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.25}
          transparent
          opacity={0.95}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Head */}
      <mesh position={headPos} frustumCulled={false}>
        <coneGeometry args={[headRadius, headLength, 24, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.25}
          roughness={0.2}
          transparent
          opacity={0.98}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
