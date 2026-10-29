import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeHeroCanvasProps {
  className?: string;
  onInteract?: () => void;
  onNodeClick?: (nodeId: number, label: string) => void;
}

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    return false;
  }
  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      testCanvas.getContext('webgl2') ||
      testCanvas.getContext('webgl') ||
      testCanvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({
  className = '',
  onInteract,
  onNodeClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(() => isWebGLAvailable());
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeSynapseText, setActiveSynapseText] = useState<string>('');

  useEffect(() => {
    if (!webglSupported) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Three.js Scene
    const scene = new THREE.Scene();

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    } catch {
      setWebglSupported(false);
      return;
    }

    // 2. Primary 3D Neural Matrix Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Glowing Polyhedron (Knowledge Nucleus)
    const innerGeom = new THREE.IcosahedronGeometry(1.4, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      emissive: 0x312e81,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.95
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerCore);

    // 3. Genuine Neural Sphere: Connected Nodes & Synaptic Lattice
    const nodeCount = 54;
    const sphereRadius = 1.85;
    const nodePositions: THREE.Vector3[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    // Generate Fibonacci spherical distribution
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      nodePositions.push(new THREE.Vector3(x * sphereRadius, y * sphereRadius, z * sphereRadius));
    }

    // Build Synaptic Connection Lines between nearby nodes
    const lineCoords: number[] = [];
    const maxLinkDistance = 0.96;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxLinkDistance) {
          lineCoords.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          );
        }
      }
    }

    const synapticLineGeom = new THREE.BufferGeometry();
    synapticLineGeom.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const synapticLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const synapticLines = new THREE.LineSegments(synapticLineGeom, synapticLineMat);
    coreGroup.add(synapticLines);

    // Neural Nodes as Interactive Meshes
    const nodeGeom = new THREE.SphereGeometry(0.065, 12, 12);
    const interactiveNodes: THREE.Mesh[] = [];

    const cyanNodeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    const violetNodeMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    const magentaNodeMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xdb2777,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    for (let i = 0; i < nodeCount; i++) {
      const mat = (i % 4 === 0) ? magentaNodeMat : (i % 2 === 0) ? violetNodeMat : cyanNodeMat;
      const nodeMesh = new THREE.Mesh(nodeGeom, mat.clone());
      nodeMesh.position.copy(nodePositions[i]);
      nodeMesh.userData = {
        id: i,
        label: `Synapse #${i + 1}`,
        pulseProgress: 0,
        baseScale: 1.0
      };
      coreGroup.add(nodeMesh);
      interactiveNodes.push(nodeMesh);
    }

    // 4. Orbital Gyroscopic Rings
    // Ring 1: Primary Cyan Gyro Torus
    const ring1Geom = new THREE.TorusGeometry(2.55, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    coreGroup.add(ring1);

    // Ring 2: Secondary Violet Gyro Torus
    const ring2Geom = new THREE.TorusGeometry(2.85, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4338ca,
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.7
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    coreGroup.add(ring2);

    // Ring 3: Fine Equatorial Orbit
    const ring3Geom = new THREE.TorusGeometry(3.15, 0.018, 12, 120);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.55
    });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    ring3.rotation.x = Math.PI / 2.2;
    coreGroup.add(ring3);

    // Orbiting Satellite Nodes (Data Packets)
    const satelliteGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.25
    });

    const satellites: THREE.Mesh[] = [];
    const numSatellites = 4;
    for (let i = 0; i < numSatellites; i++) {
      const sat = new THREE.Mesh(satelliteGeom, satelliteMat);
      scene.add(sat);
      satellites.push(sat);
    }

    // 5. Active Shockwave Ripple Ring for Click Reactions
    const rippleGeom = new THREE.RingGeometry(0.1, 0.16, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const rippleMesh = new THREE.Mesh(rippleGeom, rippleMat);
    rippleMesh.visible = false;
    scene.add(rippleMesh);

    let rippleActive = false;
    let rippleStartTime = 0;

    // 6. Floating Depth Particle Constellation
    const particleCount = 320;
    const particleCoords = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x38bdf8);
    const cViolet = new THREE.Color(0x818cf8);
    const cMagenta = new THREE.Color(0xec4899);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const u = Math.acos(2 * Math.random() - 1);

      particleCoords[i * 3] = radius * Math.sin(u) * Math.cos(theta);
      particleCoords[i * 3 + 1] = radius * Math.sin(u) * Math.sin(theta);
      particleCoords[i * 3 + 2] = radius * Math.cos(u);

      const colorPick = Math.random();
      const chosenColor = colorPick < 0.5 ? cCyan : colorPick < 0.85 ? cViolet : cMagenta;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleCloud = new THREE.Points(particleGeom, particleMat);
    scene.add(particleCloud);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2.8, 14);
    cyanLight.position.set(4, 3, 3);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x818cf8, 2.5, 12);
    violetLight.position.set(-4, -2, 2);
    scene.add(violetLight);

    const magentaLight = new THREE.PointLight(0xec4899, 2.0, 10);
    magentaLight.position.set(0, 4, -2);
    scene.add(magentaLight);

    // 8. Raycasting & Click Interactions
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const triggerVisualPulse = (pos?: THREE.Vector3, isNode?: boolean) => {
      rippleActive = true;
      rippleStartTime = performance.now();
      rippleMesh.visible = true;
      rippleMesh.scale.set(1, 1, 1);
      (rippleMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
      (rippleMesh.material as THREE.MeshBasicMaterial).color.setHex(isNode ? 0xec4899 : 0x38bdf8);

      if (pos) {
        rippleMesh.position.copy(pos);
        rippleMesh.lookAt(camera.position);
      } else {
        rippleMesh.position.set(0, 0, 0);
        rippleMesh.lookAt(camera.position);
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveNodes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeId = hit.userData.id;
        const nodeLabel = hit.userData.label;

        // Visual reaction: scale pulse & color flash on hit node
        hit.userData.pulseProgress = 1.0;
        triggerVisualPulse(hit.position, true);
        setActiveSynapseText(`${nodeLabel} Activated · Synaptic Path Fired!`);
        onNodeClick?.(nodeId, nodeLabel);
      } else {
        triggerVisualPulse(new THREE.Vector3(0, 0, 0), false);
        setActiveSynapseText('Neural Core Synchronized · 4,096 Active Synapses');
      }

      onInteract?.();
    };

    container.addEventListener('click', handleCanvasClick);

    // 9. Pointer Parallax Tracking with Smooth Lerp
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (prefersReducedMotion) return;

      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      // Range -0.55 to +0.55 rad
      targetRotation.y = (x - 0.5) * 1.1;
      targetRotation.x = (y - 0.5) * 0.85;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 10. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsedTime = (now - startTime) / 1000;
      const speedMultiplier = prefersReducedMotion ? 0.25 : 1.0;

      // Smooth camera / group rotation interpolation (Lerp)
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

      coreGroup.rotation.y = elapsedTime * (0.32 * speedMultiplier) + currentRotation.y;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.12 + currentRotation.x;
      coreGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.14; // Breathing bob

      // Inner Core gentle pulsation
      const innerScale = 1 + Math.sin(elapsedTime * 2.2) * 0.04;
      innerCore.scale.set(innerScale, innerScale, innerScale);

      // Rotate individual gyro rings at unique speeds
      ring1.rotation.z = elapsedTime * (0.55 * speedMultiplier);
      ring2.rotation.y = -elapsedTime * (0.42 * speedMultiplier);
      ring3.rotation.z = elapsedTime * (0.28 * speedMultiplier);

      // Orbit Satellites
      satellites.forEach((sat, idx) => {
        const offset = (idx * Math.PI * 2) / numSatellites;
        const orbitRadius = 2.65;
        const speed = elapsedTime * (0.75 * speedMultiplier) + offset;
        sat.position.x = Math.cos(speed) * orbitRadius;
        sat.position.z = Math.sin(speed) * orbitRadius;
        sat.position.y = Math.sin(speed * 2) * 0.55;
      });

      // Slowly rotate particle field
      particleCloud.rotation.y = elapsedTime * (0.05 * speedMultiplier);

      // Update Node Click Pulses
      interactiveNodes.forEach((node) => {
        if (node.userData.pulseProgress > 0) {
          node.userData.pulseProgress -= 0.035;
          const progress = Math.max(0, node.userData.pulseProgress);
          const s = 1.0 + Math.sin(progress * Math.PI) * 1.4;
          node.scale.set(s, s, s);
          const mat = node.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.9 + progress * 2.5;
        } else {
          node.scale.set(1, 1, 1);
        }
      });

      // Update Shockwave Ripple
      if (rippleActive) {
        const rippleElapsed = (now - rippleStartTime) / 1000;
        const rippleDuration = 0.65;
        if (rippleElapsed < rippleDuration) {
          const progress = rippleElapsed / rippleDuration;
          const scale = 1 + progress * 16;
          rippleMesh.scale.set(scale, scale, 1);
          (rippleMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - progress) * 0.85);
        } else {
          rippleActive = false;
          rippleMesh.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      resizeObserver.disconnect();

      // Dispose Geometries & Materials
      innerGeom.dispose();
      innerMat.dispose();
      synapticLineGeom.dispose();
      synapticLineMat.dispose();
      nodeGeom.dispose();
      interactiveNodes.forEach((n) => (n.material as THREE.Material).dispose());
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      ring3Geom.dispose();
      ring3Mat.dispose();
      satelliteGeom.dispose();
      satelliteMat.dispose();
      rippleGeom.dispose();
      rippleMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();

      renderer.dispose();
    };
  }, [webglSupported, onInteract, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className={`three-hero-viewport ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Interactive 3D Quantum Learning Core"
    >
      {webglSupported ? (
        <>
          <canvas ref={canvasRef} className="three-hero-canvas" />
          {/* Subtle Cyber HUD Floating Metrics */}
          <div className="three-hud-badge">
            <span className="hud-pulse-dot"></span>
            <span className="hud-label">NEURAL MATRIX · 3D WEBGL</span>
            <span className="hud-sub">
              {activeSynapseText ||
                (isHovered
                  ? 'Pointer Synced · Click Node to Fire Synapse'
                  : 'Interactive · Move Cursor')}
            </span>
          </div>
        </>
      ) : (
        /* Polished CSS 3D Fallback for Low-End Devices or Disabled WebGL */
        <div className="css-3d-hologram-fallback" aria-hidden="true">
          <div className="css-3d-rings-wrap">
            <div className="css-ring ring-outer"></div>
            <div className="css-ring ring-mid"></div>
            <div className="css-ring ring-inner"></div>
            <div className="css-core-orb"></div>
          </div>
          <div className="three-hud-badge">
            <span className="hud-pulse-dot"></span>
            <span className="hud-label">NEURAL MATRIX · CSS 3D</span>
          </div>
        </div>
      )}
    </div>
  );
};
