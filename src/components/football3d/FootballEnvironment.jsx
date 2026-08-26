import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';

export function FootballEnvironment({ theme = 'dark' }) {
  return (
    <>
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={theme === 'dark' ? 0.65 : 0.45}
        scale={8}
        blur={2.5}
        far={4.5}
        color={theme === 'dark' ? '#000000' : '#475569'}
      />
    </>
  );
}

export default FootballEnvironment;
