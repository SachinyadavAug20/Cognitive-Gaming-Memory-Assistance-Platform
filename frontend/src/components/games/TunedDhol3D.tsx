"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface TunedDhol3DProps {
  leftStrike: number;
  rightStrike: number;
  running: boolean;
}

/**
 * A lightweight, hand-built 3D Bihu "Dhol" (barrel drum) rendered with raw
 * Three.js. The drum is a tapered barrel whose two drum heads are struck
 * independently: each strike flashes a colored ring + ripple on the matching
 * side and nudges the drum with a gentle spring so the visual matches the
 * auto-tuned audio.
 */
export function TunedDhol3D({ leftStrike, rightStrike, running }: TunedDhol3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Scene objects we animate from React callbacks.
  const leftFlashRef = useRef<THREE.Mesh | null>(null);
  const rightFlashRef = useRef<THREE.Mesh | null>(null);
  const leftRippleRef = useRef<THREE.Mesh | null>(null);
  const rightRippleRef = useRef<THREE.Mesh | null>(null);
  // Current impulse magnitude (1 -> 0) for the spring-back animation.
  const impulseRef = useRef({ left: 0, right: 0 });
  const drumGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || 320;
    let height = mount.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff6ea);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xdfc9a0, 0.95);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff3d6, 1.25);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xbfc9ff, 0.55);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffd9b0, 0.4);
    fill.position.set(0, -1, 4);
    scene.add(fill);

    // Group holding the drum so we can tilt it on strikes.
    const drumGroup = new THREE.Group();
    drumGroupRef.current = drumGroup;
    scene.add(drumGroup);

    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x8a4b2f, roughness: 0.62, metalness: 0.1 });
    const hoopMaterial = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.35, metalness: 0.75 });
    const headMaterialLeft = new THREE.MeshStandardMaterial({ color: 0xeadbc4, roughness: 0.55 });
    const headMaterialRight = new THREE.MeshStandardMaterial({ color: 0xeadbc4, roughness: 0.55 });
    const laceMaterial = new THREE.MeshStandardMaterial({ color: 0xf7e3a5, roughness: 0.6 });

    function buildDrum() {
      // Tapered barrel body (radius shrinks towards the head edges).
      const bodyGeo = new THREE.CylinderGeometry(1.0, 0.74, 1.7, 32, 1, false);
      const body = new THREE.Mesh(bodyGeo, barrelMaterial);
      body.rotation.x = Math.PI / 2; // axis along Z
      body.castShadow = true;
      // Slight taper illusion: add a convex wrap via scale.
      body.scale.set(1, 1, 1);
      drumGroup.add(body);

      // Left head hoop
      const leftHoop = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 12, 42), hoopMaterial);
      leftHoop.rotation.y = Math.PI / 2;
      leftHoop.position.z = 0.85;
      drumGroup.add(leftHoop);

      // Right head hoop
      const rightHoop = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 12, 42), hoopMaterial);
      rightHoop.rotation.y = Math.PI / 2;
      rightHoop.position.z = -0.85;
      drumGroup.add(rightHoop);

      // Left drum head (slightly inset)
      const leftHead = new THREE.Mesh(new THREE.CircleGeometry(0.93, 40), headMaterialLeft);
      leftHead.position.z = 0.97;
      drumGroup.add(leftHead);

      // Right drum head
      const rightHead = new THREE.Mesh(new THREE.CircleGeometry(0.93, 40), headMaterialRight);
      rightHead.position.z = -0.97;
      rightHead.rotation.y = Math.PI;
      drumGroup.add(rightHead);

      // Flash rings + ripples on each head (strike visual effects).
      const ringGeo = new THREE.RingGeometry(0.4, 0.9, 40);
      const ringMatLeft = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const ringMatRight = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });

      const leftFlash = new THREE.Mesh(ringGeo, ringMatLeft);
      leftFlash.position.z = 1.0;
      leftFlashRef.current = leftFlash;
      drumGroup.add(leftFlash);

      const rightFlash = new THREE.Mesh(ringGeo, ringMatRight);
      rightFlash.rotation.y = Math.PI;
      rightFlash.position.z = -1.0;
      rightFlashRef.current = rightFlash;
      drumGroup.add(rightFlash);

      const rippleMatLeft = new THREE.MeshBasicMaterial({
        color: 0xffd166,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const rippleMatRight = new THREE.MeshBasicMaterial({
        color: 0xff8a80,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });

      const leftRipple = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.35, 40), rippleMatLeft);
      leftRipple.position.z = 1.02;
      leftRippleRef.current = leftRipple;
      drumGroup.add(leftRipple);

      const rightRipple = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.35, 40), rippleMatRight);
      rightRipple.rotation.y = Math.PI;
      rightRipple.position.z = -1.02;
      rightRippleRef.current = rightRipple;
      drumGroup.add(rightRipple);

      // Decorative V-lacing across the barrel (few strands for a folk look).
      const laceCount = 8;
      const laceMat = laceMaterial;
      for (let i = 0; i < laceCount; i++) {
        const theta = (i / laceCount) * Math.PI * 2;
        const x = Math.cos(theta) * 0.74;
        const y = Math.sin(theta) * 0.74;
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.72, 6), laceMat);
        seg.position.set(x * 0.55, y * 0.55, 0);
        seg.rotation.set(0, 0, 0);
        drumGroup.add(seg);
      }

      // Floor shadow disc so the drum sits in a soft pool of light.
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, 48),
        new THREE.MeshStandardMaterial({ color: 0xe9ddc8, roughness: 0.9, transparent: true, opacity: 0.6 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.05;
      floor.receiveShadow = true;
      drumGroup.add(floor);
    }

    buildDrum();

    const spinRequest = { value: true };
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!spinRequest.value) return;
      const dt = clock.getDelta();

      const group = drumGroupRef.current;
      if (group) {
        // Continuous gentle auto-rotation of the whole drum so all sides are seen.
        group.rotation.y += dt * 0.5;

        // Spring-back tilt from strike impulses.
        const imp = impulseRef.current;
        imp.left = Math.max(0, imp.left - dt * 4);
        imp.right = Math.max(0, imp.right - dt * 4);
        const tilt = (imp.right - imp.left) * 0.28;
        group.rotation.x = tilt;
      }

      // Head flash + ripple animation, independent per side.
      const anims: Array<[THREE.Mesh | null, THREE.Mesh | null, number]> = [
        [leftFlashRef.current, leftRippleRef.current, impulseRef.current.left],
        [rightFlashRef.current, rightRippleRef.current, impulseRef.current.right],
      ];
      for (const [flash, ripple, imp] of anims) {
        if (flash) {
          const mat = flash.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, imp * 0.9);
          const s = 1 + imp * 1.9;
          flash.scale.set(s, s, s);
        }
        if (ripple) {
          const mat = ripple.material as THREE.MeshBasicMaterial;
          const growing = Math.max(0, imp - 0.2);
          mat.opacity = Math.max(0, growing * 0.85);
          const rs = 1 + growing * 3.2;
          ripple.scale.set(rs, rs, rs);
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      width = mount.clientWidth || 320;
      height = mount.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      spinRequest.value = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      // Dispose geometries/materials owned by this component.
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = Array.isArray(obj.material) ? obj.material : [obj.material];
          m.forEach((mm) => mm.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Fire strikes from React into the scene.
  const lastLeftRef = useRef(0);
  const lastRightRef = useRef(0);
  useEffect(() => {
    if (leftStrike !== lastLeftRef.current) {
      lastLeftRef.current = leftStrike;
      impulseRef.current.left = Math.min(1, impulseRef.current.left + 1);
    }
  }, [leftStrike]);

  useEffect(() => {
    if (rightStrike !== lastRightRef.current) {
      lastRightRef.current = rightStrike;
      impulseRef.current.right = Math.min(1, impulseRef.current.right + 1);
    }
  }, [rightStrike]);

  // Tap the drum gently when (re)started / stopped so it visibly responds.
  useEffect(() => {
    if (running) {
      impulseRef.current.left = Math.min(1, impulseRef.current.left + 0.6);
      impulseRef.current.right = Math.min(1, impulseRef.current.right + 0.6);
    }
  }, [running]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-56 sm:h-64 rounded-2xl border-3 border-black overflow-hidden shadow-[4px_4px_0px_#000] bg-[#FFF6EA]"
      aria-label="3D Bihu Dhol"
    />
  );
}
