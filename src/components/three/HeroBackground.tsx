import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uCenter;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    // Oscillate center very slightly in the top-left corner (0.05, 0.95)
    vec2 center = uCenter + vec2(
      cos(uTime * 0.08) * 0.03,
      sin(uTime * 0.06) * 0.03
    );

    // Calculate angle from the glow center to create scattering light rays
    float angle = atan(uv.y - center.y, uv.x - center.x);
    
    // Create animated ray waves that rotate/scatter over time
    float rays = sin(angle * 8.0 + uTime * 0.5) * 0.15 + cos(angle * 3.0 - uTime * 0.3) * 0.1;
    
    float dist = distance(uv, center);
    
    // Apply the scattering rays to the gradient field
    float gradient = smoothstep(0.8, 0.0, dist + rays * dist);

    vec3 accentColor = vec3(0.0, 0.831, 1.0); // Vibrant neon cyan
    vec3 whiteColor = vec3(1.0, 1.0, 1.0);

    // Blend accent with white for a premium spark core, and scale up intensity
    vec3 color = mix(accentColor, whiteColor, 0.25) * gradient * 0.15;
    float alpha = gradient * 0.25;

    gl_FragColor = vec4(color, alpha);
  }
`;

function GradientPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.05, 0.95) }, // Anchored at the top-left corner
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ mixBlendMode: 'screen' }}>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        dpr={1}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <GradientPlane />
      </Canvas>
    </div>
  );
}
