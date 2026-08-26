import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThemeStore } from '../../store/useThemeStore';
import { useFootballAnimation } from './useFootballAnimation';
import FootballModel from './FootballModel';
import FootballLighting from './FootballLighting';
import FootballParticles from './FootballParticles';
import FootballEnvironment from './FootballEnvironment';
import FootballFallback from './FootballFallback';

export function FootballScene() {
  const { theme } = useThemeStore();
  const { mouseRef, scrollRef, reducedMotion } = useFootballAnimation();
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <FootballFallback theme={theme} />;
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[450px] md:h-[500px] flex items-center justify-center pointer-events-auto overflow-visible">
      {/* Soft Ambient Background Glow */}
      <div className="absolute inset-0 bg-radial from-sport-500/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <Suspense fallback={<FootballFallback theme={theme} />}>
        <Canvas
          camera={{ position: [0, 0, 6.0], fov: 42 }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          <FootballLighting theme={theme} />
          <FootballModel
            mouseRef={mouseRef}
            scrollRef={scrollRef}
            theme={theme}
            reducedMotion={reducedMotion}
          />
          <FootballParticles theme={theme} reducedMotion={reducedMotion} />
          <FootballEnvironment theme={theme} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default FootballScene;
