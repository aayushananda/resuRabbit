"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Html,
} from "@react-three/drei";
import { Rabbit } from "./rabbit";

type Props = {
  position?: [number, number, number];
  scale?: number;
};

export default function interactiveComponent({
  position = [0.5, -0.3, 0],
  scale = 0.35,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="h-full w-full relative">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded z-50">
          {error}
        </div>
      )}
      <Canvas
        className="h-full w-full"
        camera={{ position: [1, 0.5, 3.5], fov: 40 }}
        onError={() => setError("Failed to initialize 3D scene")}
      >
        <Suspense>
          <Scene position={position} scale={scale} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Scene({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position}>
      <OrbitControls enablePan={false} enableZoom={false} />
      <Environment files={"/hdr/warehouse-256.hdr"}/>
      <Rabbit
        scale={scale}
        position={[0, -0.2, 0]}
        rotation={[0, -Math.PI / 5, 0]}
      />
      <ContactShadows
        opacity={1}
        position={[0, -0.21, 0]}
        scale={6}
        blur={1.5}
        far={1}
        color="#000000"
        resolution={1024}
      />
    </group>
  );
}
