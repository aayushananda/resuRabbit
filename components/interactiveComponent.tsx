"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

type Props = {};

export default function interactiveComponent({}: Props) {
  return (
    <div className="h-full w-full">
      <Canvas
        className="h-full w-full"
        camera={{ position: [1.5, 1, 1.4], fov: 55 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Scene() {
  return (
    <group>
      <mesh>
        <meshBasicMaterial color="#6300B3" />
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  );
}
