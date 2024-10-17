import { Center, useGLTF } from "@react-three/drei";
import { Euler, useFrame, Vector3 } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PhysicsMesh } from ".";

export const blueColor = "#105eff";

const blackColor = new THREE.Color(0.08, 0.08, 0.08);
const phoneWidth = 1.8;
const phoneHeight = 0.86;
const phonePosition: Vector3 = [0, 0, 0.06];
const phoneRotation: Euler = [Math.PI / 2, 0, 0];
const phoneDimension: [width?: number | undefined, height?: number] = [
  phoneWidth,
  phoneHeight,
];

export function MetalMaterial() {
  return <meshPhysicalMaterial color="white" metalness={0.8} roughness={0.3} />;
}

export function BlackMaterial() {
  return (
    <meshPhysicalMaterial color={blackColor} metalness={0.8} roughness={0.5} />
  );
}

export function BaseLogoModel() {
  const { nodes } = useGLTF("/three-hero/logo.glb");
  const model = nodes.Base_Logo as THREE.Mesh;
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 2; // Di chuyển lên xuống theo thời gian
    }
  });

  return (
    <Center>
      <mesh
        ref={meshRef}
        scale={3.2}
        geometry={model.geometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={blueColor}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
    </Center>
  );
}

export function Eth() {
  const { nodes } = useGLTF("/three-hero/eth.glb");
  const model = nodes.ETH as THREE.Mesh;
  return (
    <PhysicsMesh>
      <mesh geometry={model.geometry} castShadow receiveShadow scale={0.25}>
        <MetalMaterial />
      </mesh>
    </PhysicsMesh>
  );
}

export function Bitcoin() {
  const { nodes } = useGLTF("/three-hero/bitcoin.glb");
  console.log(nodes);
  const model = nodes.Plane_Material003_0 as THREE.Mesh;
  console.log(model);
  return (
    <PhysicsMesh>
      <mesh geometry={model?.geometry} castShadow receiveShadow scale={0.08}>
        <MetalMaterial />
      </mesh>
    </PhysicsMesh>
  );
}

export function Headphones() {
  const { nodes } = useGLTF("/three-hero/headphones.glb");
  const model = nodes.Headphones as THREE.Mesh;
  return (
    <PhysicsMesh>
      <mesh geometry={model.geometry} castShadow receiveShadow scale={0.2}>
        <BlackMaterial />
      </mesh>
    </PhysicsMesh>
  );
}

export function Phone() {
  const { nodes } = useGLTF("/three-hero/phone.glb");
  const model = nodes.Cylinder as THREE.Mesh;
  return (
    <PhysicsMesh>
      <mesh
        geometry={model.geometry}
        castShadow
        receiveShadow
        rotation={phoneRotation}
      >
        <BlackMaterial />
      </mesh>
      <mesh position={phonePosition}>
        <planeGeometry args={phoneDimension} />
        <MetalMaterial />
      </mesh>
    </PhysicsMesh>
  );
}
