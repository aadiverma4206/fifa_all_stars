import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function FootballLighting({ theme = 'dark' }) {
  const pointLightRef = useRef();

  useFrame((state) => {
    if (!pointLightRef.current) return;
    const t = state.clock.getElapsedTime();
    pointLightRef.current.position.x = Math.sin(t * 0.4) * 3;
    pointLightRef.current.position.y = Math.cos(t * 0.3) * 2;
    pointLightRef.current.position.z = Math.sin(t * 0.5) * 3 + 2;
  });

  const isDark = theme === 'dark';

  return (
    <>
      {/* Ambient Fill Light */}
      <ambientLight intensity={isDark ? 0.6 : 0.9} />

      {/* Main Key Directional Light */}
      <directionalLight
        position={[4, 5, 4]}
        intensity={isDark ? 2.2 : 2.8}
        color={isDark ? '#ffffff' : '#f8fafc'}
        castShadow
      />

      {/* Rim Accent Light (Sport Green / Emerald) */}
      <directionalLight
        position={[-5, -2, -3]}
        intensity={isDark ? 1.8 : 1.2}
        color="#22c55e"
      />

      {/* Soft Back Fill Light */}
      <directionalLight
        position={[0, -4, 2]}
        intensity={isDark ? 0.5 : 0.8}
        color="#38bdf8"
      />

      {/* Dynamic Animated Point Light */}
      <pointLight
        ref={pointLightRef}
        intensity={isDark ? 1.5 : 1.0}
        distance={8}
        color="#22c55e"
      />
    </>
  );
}

export default FootballLighting;
