"use client";

import { Canvas, useFrame, useThree, Vector3, Euler } from "@react-three/fiber";
import classNames from "classnames";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import {
  Physics,
  BallCollider,
  Vector3Tuple,
  CylinderCollider,
  CylinderArgs,
  RapierRigidBody,
  RigidBody,
  BallArgs,
} from "@react-three/rapier";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import { useMediaQuery } from "usehooks-ts";
import { Center, Environment, Lightformer } from "@react-three/drei";

import {
  BaseLogoModel,
  Bitcoin,
  BlackMaterial,
  blueColor,
  Eth,
  Headphones,
  Phone,
} from "./model";

const gravity: Vector3Tuple = [0, 0, 0];

const sceneFogArguments: [
  color: THREE.ColorRepresentation,
  near: number,
  far: number
] = ["#111", 2.5, 7];

const sceneCamera = { position: [0, 0, 5] as Vector3 };
const sceneSphereArguments: [
  radius: number,
  widthSegments: number,
  heightSegments: number
] = [7, 64, 64];

export default function Scene(): JSX.Element {
  const [isActive, setIsActive] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateIsActive = () => {
      const isFocused = !document.hidden && document.hasFocus();
      setIsActive(isFocused);
    };

    const container = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        setIsActive(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -100% 0px",
      }
    );

    if (container) {
      observer.observe(container);
    }

    // Initial check
    updateIsActive();

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);

  const canvaClasses = classNames(
    "fixed h-screen w-full transition-all",
    isActive ? "opacity-100" : "opacity-0"
  );

  return (
    <div ref={containerRef} className="absolute h-full w-full">
      <Canvas
        shadows
        frameloop={isActive ? "always" : "never"}
        camera={sceneCamera}
        className={canvaClasses}
      >
        <fog attach="fog" args={sceneFogArguments} />
        <mesh>
          <sphereGeometry args={sceneSphereArguments} />
          <meshPhysicalMaterial
            color="#666"
            side={THREE.BackSide}
            depthTest={false}
          />
        </mesh>
        <Effects />
        <EnvironmentSetup />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep="vary" paused={!isActive}>
            <Pointer />
            <Everything />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

function Effects() {
  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <Bloom mipmapBlur luminanceThreshold={0.5} intensity={1} />
      <SMAA />
    </EffectComposer>
  );
}

export function Everything() {
  return (
    <group dispose={null}>
      <BaseLogo />
      <Balls />
      <Boxes />
      <Cone />
      <Eth />
      <Phone />
      <Headphones />
      <Bitcoin />
    </group>
  );
}

function Boxes() {
  const boxes = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, index) => {
        return (
          <PhysicsMesh scale={0.5} gravityEffect={0.03} key={index}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <BlackMaterial />
            </mesh>
          </PhysicsMesh>
        );
      }),
    []
  );

  return <group>{boxes}</group>;
}

function Balls() {
  const boxes = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, index) => {
        return (
          <PhysicsMesh scale={0.25} gravityEffect={0.004} key={index}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.25, 64, 64]} />
              <meshPhysicalMaterial color={blueColor} />
            </mesh>
          </PhysicsMesh>
        );
      }),
    []
  );

  return <group>{boxes}</group>;
}

function Cone() {
  const cone = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, index) => {
        return (
          <PhysicsMesh scale={0.4} gravityEffect={0.03} key={index}>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.25, 0.5, 3]} />
              <BlackMaterial />
            </mesh>
          </PhysicsMesh>
        );
      }),
    []
  );

  return <group>{cone}</group>;
}

function EnvironmentSetup() {
  const onLightUpdated = useCallback(
    (
      self: THREE.Mesh<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.Material | THREE.Material[]
      >
    ) => self.lookAt(0, 0, 0),
    []
  );
  return (
    <Environment>
      <Lightformer
        intensity={5}
        position={[-50, 2, 0]}
        scale={[70, 20, 70]}
        onUpdate={onLightUpdated}
      />
      <Lightformer
        intensity={5}
        position={[50, 2, 0]}
        scale={[70, 20, 70]}
        onUpdate={onLightUpdated}
      />
      <Lightformer
        intensity={5}
        position={[0, 2, 50]}
        scale={[70, 20, 70]}
        onUpdate={onLightUpdated}
      />
      <Lightformer
        intensity={5}
        position={[0, 2, -50]}
        scale={[70, 20, 70]}
        onUpdate={onLightUpdated}
      />
    </Environment>
  );
}

const baseLogoRotation: Euler = [Math.PI / 2, 0, 0];
const baseLogoPosition: [x: number, y: number, z: number] = [0, 0, -10];

function BaseLogo() {
  const logoRef = useRef<THREE.Group>(null);
  const doneRef = useRef<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 769px)");

  useFrame(({ pointer }) => {
    if (!logoRef.current) return;

    if (doneRef.current) {
      logoRef.current.rotation.y = THREE.MathUtils.lerp(
        logoRef.current.rotation.y,
        pointer.x,
        0.05
      );
      logoRef.current.rotation.x = THREE.MathUtils.lerp(
        logoRef.current.rotation.x,
        -pointer.y,
        0.05
      );
    } else {
      logoRef.current.rotation.y = THREE.MathUtils.lerp(
        logoRef.current.rotation.y,
        0,
        0.05
      );
    }
    logoRef.current.position.z = THREE.MathUtils.lerp(
      logoRef.current.position.z,
      0,
      0.05
    );

    // lerp never gets to 0
    if (logoRef.current.position.z > -0.01) {
      doneRef.current = true;
    }
  });

  const cylinderArguments: CylinderArgs = useMemo(
    () => [10, isMobile ? 1.1 : 2],
    [isMobile]
  );

  return (
    <RigidBody type="kinematicPosition" colliders={false}>
      <CylinderCollider rotation={baseLogoRotation} args={cylinderArguments} />
      <group ref={logoRef} position={baseLogoPosition}>
        <Center scale={isMobile ? 0.075 : 0.13}>
          <BaseLogoModel />
        </Center>
      </group>
    </RigidBody>
  );
}

const ballArguments: BallArgs = [1];

export function PhysicsMesh({
  vec = new THREE.Vector3(),
  r = THREE.MathUtils.randFloatSpread,
  scale = 1,
  gravityEffect = 0.2,
  children,
}: {
  vec?: THREE.Vector3;
  r?: (a: number) => number;
  scale?: number;
  gravityEffect?: number;
  children: React.ReactNode;
}) {
  const rigidBodyApiRef = useRef<RapierRigidBody>(null);
  const { viewport } = useThree();

  const randomNumberBetween = (min: number, max: number) => {
    const posOrNeg = Math.random() > 0.5 ? 1 : -1;
    const num = Math.min(Math.random() * (max - min) + min, 14);
    return posOrNeg * num;
  };

  const pos = useMemo(
    () =>
      new THREE.Vector3(
        randomNumberBetween(viewport.width * 0.5, viewport.width * 2),
        randomNumberBetween(viewport.height * 0.5, viewport.height * 2),
        randomNumberBetween(viewport.width * 0.5, viewport.width * 2)
      ),
    [viewport.height, viewport.width]
  );
  const rot = useMemo(
    () => new THREE.Vector3(r(Math.PI), r(Math.PI), r(Math.PI)),
    [r]
  );

  useFrame(() => {
    if (!rigidBodyApiRef.current) return;
    const vector = rigidBodyApiRef.current.translation();
    const vector3 = new THREE.Vector3(vector.x, vector.y, vector.z);
    rigidBodyApiRef.current.applyImpulse(
      vec.copy(vector3).negate().multiplyScalar(gravityEffect),
      true
    );
  });

  return (
    <RigidBody
      colliders={false}
      linearDamping={4}
      angularDamping={1}
      friction={0.1}
      position={pos.toArray()}
      rotation={rot.toArray()}
      ref={rigidBodyApiRef}
      scale={scale}
    >
      <BallCollider args={ballArguments} />
      {children}
    </RigidBody>
  );
}

const pointerPosition: Vector3 = [0, 0, 0];
const pointerLightPosition: Vector3 = [0, 0, 10];

function Pointer() {
  const vec = new THREE.Vector3();
  const rigidBodyApiRef = useRef<RapierRigidBody>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const isMobile = useMediaQuery("(max-width: 769px)");

  useFrame(({ pointer, viewport }) => {
    rigidBodyApiRef.current?.setNextKinematicTranslation(
      vec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      )
    );
    light.current?.position.set(0, 0, 10);
    light.current?.lookAt(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0
    );
  });

  const ballColliderArgs: BallArgs = useMemo(
    () => [isMobile ? 1 : 2],
    [isMobile]
  );

  return (
    <>
      <RigidBody
        position={pointerPosition}
        type="kinematicPosition"
        colliders={false}
        ref={rigidBodyApiRef}
      >
        <BallCollider args={ballColliderArgs} />
      </RigidBody>

      <directionalLight
        ref={light}
        position={pointerLightPosition}
        intensity={10}
        color={blueColor}
      />
    </>
  );
}
