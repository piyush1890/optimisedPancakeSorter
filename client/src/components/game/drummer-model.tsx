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
  const materialRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x000000);
    scene.background = bgColor;
    scene.fog = null; // This will ensure full transparency

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth / 2.5, window.innerHeight / 2.5);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, -5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x4444ff, 0.8);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    // Create drummer group
    const drummer = new THREE.Group();
    scene.add(drummer);
    drummerRef.current = drummer;

    // Drum throne (seat)
    const seatGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 32);
    const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.7, 0);
    drummer.add(seat);
    materialRef.current.push(seatMaterial);

    // Drummer body
    const torsoGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 32);
    const torsoMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.set(0, 1.3, 0);
    drummer.add(torso);
    materialRef.current.push(torsoMaterial);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.9, 0);
    drummer.add(head);
    materialRef.current.push(headMaterial);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
    materialRef.current.push(armMaterial);

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4, 1.5, 0);
    leftArm.rotation.z = Math.PI / 6;
    drummer.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4, 1.5, 0);
    rightArm.rotation.z = -Math.PI / 6;
    drummer.add(rightArm);

    // Drum set
    const drumSet = new THREE.Group();
    drummer.add(drumSet);

    // Bass drum
    const bassGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 32);
    const bassMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const bassDrum = new THREE.Mesh(bassGeometry, bassMaterial);
    bassDrum.rotation.x = Math.PI / 2;
    bassDrum.position.set(0, 0.5, -0.8);
    drumSet.add(bassDrum);
    materialRef.current.push(bassMaterial);

    // Snare drum
    const snareGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32);
    const snareMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const snareDrum = new THREE.Mesh(snareGeometry, snareMaterial);
    snareDrum.position.set(-0.6, 1, -0.4);
    drumSet.add(snareDrum);
    materialRef.current.push(snareMaterial);

    // Cymbal
    const cymbalGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 32);
    const cymbalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      metalness: 0.8,
      roughness: 0.2
    });
    const cymbal = new THREE.Mesh(cymbalGeometry, cymbalMaterial);
    cymbal.position.set(0.8, 1.5, -0.6);
    cymbal.rotation.x = Math.PI / 6;
    drumSet.add(cymbal);
    materialRef.current.push(cymbalMaterial);

    // Position camera to show drums
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 1, 0);

    // Initial opacity
    materialRef.current.forEach(material => {
      material.transparent = true;
      material.opacity = 0;
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      const width = window.innerWidth / 2.5;
      const height = window.innerHeight / 2.5;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Fade in/out and drumming animation
  useEffect(() => {
    if (!drummerRef.current) return;

    if (isPlaying) {
      // Fade in
      gsap.to(materialRef.current.map(m => m), {
        opacity: 1,
        duration: 0.5,
        stagger: 0.1
      });

      // Drumming animation
      const tl = gsap.timeline({
        onComplete: onAnimationComplete,
      });

      // Starting tempo (matches the sound's drumroll)
      let tempo = 0.3;
      const iterations = 10;

      // Create drumming animations that speed up
      for (let i = 0; i < iterations; i++) {
        tempo *= 0.85; // Speed up each iteration

        // Arms movement
        tl.to(drummerRef.current.children[4].rotation, { // Left arm
          x: -Math.PI / 4,
          y: Math.PI / 6,
          duration: tempo / 2,
          ease: 'power2.inOut',
        }, `>-${tempo / 4}`);

        tl.to(drummerRef.current.children[5].rotation, { // Right arm
          x: -Math.PI / 4,
          y: -Math.PI / 6,
          duration: tempo / 2,
          ease: 'power2.inOut',
        }, `>-${tempo}`);

        // Reset arms
        tl.to([
          drummerRef.current.children[4].rotation,
          drummerRef.current.children[5].rotation
        ], {
          x: 0,
          y: 0,
          duration: tempo / 2,
          ease: 'power2.inOut',
        });
      }
    } else {
      // Fade out
      gsap.to(materialRef.current.map(m => m), {
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
      });
    }
  }, [isPlaying, onAnimationComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed bottom-4 right-4 z-10"
      style={{ 
        width: '40vw', 
        height: '40vh',
        pointerEvents: 'none',
        opacity: isPlaying ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
}