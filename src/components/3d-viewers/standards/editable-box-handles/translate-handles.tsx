import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

interface TranslateHandlesProps {
  boundingBox: { box: THREE.Box3; center: THREE.Vector3 } | null;
  show: boolean;
  onTranslateStart?: () => void;
  onTranslate?: (axis: 'x' | 'y' | 'z', delta: number) => void;
  onTranslateEnd?: () => void;
  setCursor: (cursor: string) => void;
}

/**
 * TranslateHandles Component - Hiển thị 3 axes để translate object
 */
export const TranslateHandles = ({
  boundingBox,
  show,
  onTranslateStart,
  onTranslate,
  onTranslateEnd,
  setCursor,
}: TranslateHandlesProps) => {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [activeAxis, setActiveAxis] = useState<'x' | 'y' | 'z' | null>(null);
  const [hoveredAxis, setHoveredAxis] = useState<'x' | 'y' | 'z' | null>(null);
  
  const dragStartRef = useRef<{ point: THREE.Vector3; axis: 'x' | 'y' | 'z' } | null>(null);
  const planeRef = useRef<THREE.Plane>(new THREE.Plane());
  const intersectPointRef = useRef<THREE.Vector3>(new THREE.Vector3());

  if (!show || !boundingBox) return null;

  const center = boundingBox.center;
  const boxSize = boundingBox.box.getSize(new THREE.Vector3());
  // Tính axisLength dựa trên kích thước object
  const axisLength = Math.max(1.5, Math.min(boxSize.x, boxSize.z) * 0.8);
  const arrowSize = axisLength * 0.12;

  // Axes configuration
  const axes = useMemo(() => [
    { 
      axis: 'x' as const, 
      color: '#ef4444', 
      direction: new THREE.Vector3(1, 0, 0),
      start: [center.x, center.y, center.z] as [number, number, number],
      end: [center.x + axisLength, center.y, center.z] as [number, number, number],
    },
    { 
      axis: 'y' as const, 
      color: '#22c55e', 
      direction: new THREE.Vector3(0, 1, 0),
      start: [center.x, center.y, center.z] as [number, number, number],
      end: [center.x, center.y + axisLength, center.z] as [number, number, number],
    },
    { 
      axis: 'z' as const, 
      color: '#3b82f6', 
      direction: new THREE.Vector3(0, 0, 1),
      start: [center.x, center.y, center.z] as [number, number, number],
      end: [center.x, center.y, center.z + axisLength] as [number, number, number],
    },
  ], [center, axisLength]);

  const handlePointerDown = (axis: 'x' | 'y' | 'z', direction: THREE.Vector3) => (event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    setActiveAxis(axis);
    onTranslateStart?.();
    
    // Setup drag plane perpendicular to camera but containing the axis
    const axisDir = direction.clone().normalize();
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const perpDir = new THREE.Vector3().crossVectors(axisDir, camDir).normalize();
    const normal = new THREE.Vector3().crossVectors(perpDir, axisDir).normalize();
    
    planeRef.current.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(center.x, center.y, center.z));
    
    // Get initial intersection point
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      ),
      camera
    );
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(planeRef.current, point);
    
    dragStartRef.current = { point: point.clone(), axis };
  };

  const handlePointerMove = (event: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !activeAxis) return;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      ),
      camera
    );
    
    raycaster.ray.intersectPlane(planeRef.current, intersectPointRef.current);
    
    const delta = intersectPointRef.current.clone().sub(dragStartRef.current.point);
    const axisConfig = axes.find(a => a.axis === activeAxis);
    if (!axisConfig) return;
    
    // Project delta onto axis direction
    const axisDelta = delta.dot(axisConfig.direction);
    
    onTranslate?.(activeAxis, axisDelta);
    
    // Update drag start for next frame
    dragStartRef.current.point.copy(intersectPointRef.current);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setActiveAxis(null);
      dragStartRef.current = null;
      onTranslateEnd?.();
    }
  };

  // Setup global pointer events
  useFrame(() => {
    if (isDragging) {
      const onMove = handlePointerMove.bind(null);
      const onUp = handlePointerUp.bind(null);
      
      gl.domElement.addEventListener('pointermove', onMove as any);
      gl.domElement.addEventListener('pointerup', onUp);
      
      return () => {
        gl.domElement.removeEventListener('pointermove', onMove as any);
        gl.domElement.removeEventListener('pointerup', onUp);
      };
    }
  });

  return (
    <group>
      {/* Center cube for XZ plane movement */}
      <mesh 
        position={[center.x, center.y, center.z]}
        onPointerDown={(event) => {
          event.stopPropagation();
          // TODO: implement XZ plane drag
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setCursor("move");
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setCursor("auto");
        }}
      >
        <boxGeometry args={[axisLength * 0.15, axisLength * 0.15, axisLength * 0.15]} />
        <meshBasicMaterial color="#f472b6" opacity={0.9} transparent depthTest={false} depthWrite={false} />
      </mesh>

      {/* Axes */}
      {axes.map(({ axis, color, direction, start, end }) => {
        const isHovered = hoveredAxis === axis;
        const isActive = activeAxis === axis;
        const opacity = isActive ? 1 : isHovered ? 1 : 0.85;
        const lineWidth = isActive || isHovered ? 6 : 5;
        
        return (
          <group key={axis}>
            {/* Axis line */}
            <Line
              points={[start, end]}
              color={color}
              lineWidth={lineWidth}
              transparent
              opacity={opacity}
              depthTest={false}
            />
            
            {/* Arrow cone - to hon */}
            <mesh 
              position={end}
              rotation={
                axis === 'x' ? [0, 0, -Math.PI / 2] :
                axis === 'y' ? [0, 0, 0] :
                [Math.PI / 2, 0, 0]
              }
            >
              <coneGeometry args={[arrowSize, arrowSize * 2.5, 12]} />
              <meshBasicMaterial color={color} opacity={opacity} transparent depthTest={false} depthWrite={false} />
            </mesh>
            
            {/* Hit area - to hon de de click */}
            <mesh
              position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]}
              onPointerDown={handlePointerDown(axis, direction)}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHoveredAxis(axis);
                setCursor("grab");
              }}
              onPointerOut={(event) => {
                event.stopPropagation();
                setHoveredAxis(null);
                setCursor("auto");
              }}
            >
              <boxGeometry args={
                axis === 'x' ? [axisLength, 0.35, 0.35] :
                axis === 'y' ? [0.35, axisLength, 0.35] :
                [0.35, 0.35, axisLength]
              } />
              <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
