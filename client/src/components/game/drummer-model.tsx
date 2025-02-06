import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface DrummerModelProps {
  isPlaying: boolean;
  onAnimationComplete?: () => void;
}

export function DrummerModel({ isPlaying, onAnimationComplete }: DrummerModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drummerRef = useRef<THREE.Group>();
  const drumstickLeftRef = useRef<THREE.Mesh>();
  const drumstickRightRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create drummer
    const drummer = new THREE.Group();
    scene.add(drummer);
    drummerRef.current = drummer;

    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    drummer.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2;
    drummer.add(head);

    // Drumsticks
    const stickGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.8, 8);
    const stickMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    
    const drumstickLeft = new THREE.Mesh(stickGeometry, stickMaterial);
    drumstickLeft.position.set(-0.5, 0.5, 0.5);
    drumstickLeft.rotation.x = Math.PI / 4;
    drummer.add(drumstickLeft);
    drumstickLeftRef.current = drumstickLeft;

    const drumstickRight = new THREE.Mesh(stickGeometry, stickMaterial);
    drumstickRight.position.set(0.5, 0.5, 0.5);
    drumstickRight.rotation.x = Math.PI / 4;
    drummer.add(drumstickRight);
    drumstickRightRef.current = drumstickRight;

    // Position camera
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Drumming animation
  useEffect(() => {
    if (!drumstickLeftRef.current || !drumstickRightRef.current || !isPlaying) return;

    const tl = gsap.timeline({
      onComplete: onAnimationComplete,
    });

    // Starting tempo (matches the sound's drumroll)
    let tempo = 0.3;
    const iterations = 10;

    // Create alternating drumstick animations that speed up
    for (let i = 0; i < iterations; i++) {
      tempo *= 0.85; // Speed up each iteration
      
      // Left drumstick
      tl.to(drumstickLeftRef.current.rotation, {
        x: Math.PI / 2,
        duration: tempo / 2,
        ease: 'power2.inOut',
      }, `>-${tempo / 4}`);
      tl.to(drumstickLeftRef.current.rotation, {
        x: Math.PI / 4,
        duration: tempo / 2,
        ease: 'power2.inOut',
      });

      // Right drumstick
      tl.to(drumstickRightRef.current.rotation, {
        x: Math.PI / 2,
        duration: tempo / 2,
        ease: 'power2.inOut',
      }, `>-${tempo}`);
      tl.to(drumstickRightRef.current.rotation, {
        x: Math.PI / 4,
        duration: tempo / 2,
        ease: 'power2.inOut',
      });
    }

    // Final crash animation
    tl.to([drumstickLeftRef.current.rotation, drumstickRightRef.current.rotation], {
      x: Math.PI * 0.7,
      duration: 0.2,
      ease: 'power4.in',
    });
  }, [isPlaying, onAnimationComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed bottom-0 right-0 z-10"
      style={{ 
        width: '33.333vw', 
        height: '33.333vh',
        pointerEvents: 'none' 
      }}
    />
  );
}
