import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ModelProps {
  step: number;
  isPlaying: boolean;
  speed: number;
}

interface PlanetSpec {
  name: string;
  size: number;
  distance: number;
  color: number;
  orbitSpeed: number;
  stepFocus: number;
  hasRing?: boolean;
}

const PLANETS_3D: PlanetSpec[] = [
  { name: 'Mercury', size: 0.18, distance: 1.8, color: 0x94a3b8, orbitSpeed: 3.5, stepFocus: 2 },
  { name: 'Venus', size: 0.28, distance: 2.6, color: 0xf59e0b, orbitSpeed: 2.2, stepFocus: 2 },
  { name: 'Earth', size: 0.32, distance: 3.5, color: 0x38bdf8, orbitSpeed: 1.6, stepFocus: 2 },
  { name: 'Mars', size: 0.22, distance: 4.4, color: 0xef4444, orbitSpeed: 1.2, stepFocus: 2 },
  { name: 'Jupiter', size: 0.75, distance: 6.0, color: 0xfb923c, orbitSpeed: 0.7, stepFocus: 3 },
  { name: 'Saturn', size: 0.62, distance: 7.6, color: 0xfde047, orbitSpeed: 0.5, stepFocus: 3, hasRing: true },
  { name: 'Uranus', size: 0.44, distance: 9.0, color: 0x2dd4bf, orbitSpeed: 0.35, stepFocus: 4 },
  { name: 'Neptune', size: 0.42, distance: 10.4, color: 0x60a5fa, orbitSpeed: 0.25, stepFocus: 4 }
];

export const SolarSystemModel: React.FC<ModelProps> = ({ step, isPlaying, speed }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const activePlanetName = PLANETS_3D.find((p) => p.stepFocus === step)?.name || 'Full Solar System';

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || 640;
    const height = 340;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    // 3D Perspective Camera angled slightly downward onto orbital plane
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 12);
    camera.lookAt(0, 0, 0);

    // Ambient & Point Lighting from the Sun
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff7ed, 2.5, 35, 0.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Central Sun 3D Mesh
    const sunGeom = new THREE.SphereGeometry(1.0, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);

    // Planet pivot groups and meshes
    interface PlanetNode {
      group: THREE.Group;
      mesh: THREE.Mesh;
      spec: PlanetSpec;
    }
    const planetNodes: PlanetNode[] = [];

    PLANETS_3D.forEach((spec) => {
      // Orbital line circle
      const orbitCurve = new THREE.EllipseCurve(0, 0, spec.distance, spec.distance, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(64);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const isHighlighted = step === spec.stepFocus;
      const orbitMat = new THREE.LineBasicMaterial({
        color: isHighlighted ? 0x38bdf8 : 0x334155,
        transparent: true,
        opacity: isHighlighted ? 0.8 : 0.35
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      scene.add(orbitLine);

      // Pivot group for orbit rotation
      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      // Planet sphere
      const planetGeom = new THREE.SphereGeometry(spec.size, 24, 24);
      const planetMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.6,
        metalness: 0.2
      });
      const planetMesh = new THREE.Mesh(planetGeom, planetMat);
      planetMesh.position.set(spec.distance, 0, 0);
      pivotGroup.add(planetMesh);

      // Saturn Rings
      if (spec.hasRing) {
        const ringGeom = new THREE.RingGeometry(spec.size * 1.4, spec.size * 2.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        planetMesh.add(ringMesh);
      }

      planetNodes.push({ group: pivotGroup, mesh: planetMesh, spec });
    });

    // Handle mouse drag / tilt
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0;
    let rotX = 0.55;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotY += deltaX * 0.005;
      rotX = Math.max(0.1, Math.min(1.2, rotX + deltaY * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let reqId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlaying) {
        planetNodes.forEach((node) => {
          node.group.rotation.y += delta * 0.6 * node.spec.orbitSpeed * speed;
          node.mesh.rotation.y += delta * 2;
        });
        sunMesh.rotation.y += delta * 0.4;
      }

      // Update camera position based on rotation angles
      const radius = 14;
      camera.position.x = radius * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = radius * Math.sin(rotX);
      camera.position.z = radius * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 640;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [isPlaying, speed, step]);

  if (webglFailed) {
    return (
      <div className="visual-model-canvas-wrapper solar-fallback-root">
        <p style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
          WebGL hardware acceleration unavailable. Heliocentric Orbits: Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.
        </p>
      </div>
    );
  }

  return (
    <div className="visual-model-canvas-wrapper solar-model-root" ref={containerRef} style={{ position: 'relative', width: '100%', height: '340px', background: '#02040d' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }} />

      {/* Floating 3D Navigation Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          background: 'rgba(9, 14, 36, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: '0.8rem',
          color: '#f8fafc',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <span style={{ color: '#c084fc', fontWeight: 700 }}>✦ 3D WebGL Heliocentric View</span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ color: '#94a3b8' }}>Focus: <strong style={{ color: '#38bdf8' }}>{activePlanetName}</strong></span>
      </div>

      {/* Planetary Legend Tray */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        {PLANETS_3D.map((p) => {
          const isFocused = step === p.stepFocus;
          return (
            <span
              key={p.name}
              style={{
                fontSize: '0.72rem',
                fontWeight: isFocused ? 700 : 500,
                color: isFocused ? '#38bdf8' : '#94a3b8',
                background: isFocused ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                border: isFocused ? '1px solid #38bdf8' : '1px solid #1e293b',
                padding: '2px 8px',
                borderRadius: 9999
              }}
            >
              {p.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};
