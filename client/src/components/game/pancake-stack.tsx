import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { soundEffect } from "@/lib/sound";

interface PancakeStackProps {
  arrangement: number[];
  onFlip: (index: number) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
}

export function PancakeStack({ arrangement, onFlip, isAnimating, setIsAnimating }: PancakeStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const pancakesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>();
  const particlesRef = useRef<THREE.Mesh[]>([]);

  // Setup scene and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a3a);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Position camera
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create main group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a4e,
      roughness: 0.6,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const ambientLight = new THREE.AmbientLight(0x6666ff, 1.0);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x4444ff, 0.8);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, 2, 8);
    scene.add(fillLight);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!cameraRef.current || !rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Add shatter effect
  const createShatterEffect = () => {
    if (!groupRef.current || !sceneRef.current) return;

    setIsAnimating(true);
    const particles: THREE.Mesh[] = [];
    const particlesGroup = new THREE.Group();
    sceneRef.current.add(particlesGroup);

    // Create particles for each pancake
    pancakesRef.current.forEach((pancake, index) => {
      const position = new THREE.Vector3();
      pancake.getWorldPosition(position);

      // Create multiple small cubes as shatter particles
      for (let i = 0; i < 20; i++) {
        const size = Math.random() * 0.2 + 0.1;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
          color: (pancake.material as THREE.MeshStandardMaterial).color,
          roughness: 0.7,
          metalness: 0.2
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.castShadow = true;
        particlesGroup.add(particle);
        particles.push(particle);

        // Animate each particle
        gsap.to(particle.position, {
          x: position.x + (Math.random() - 0.5) * 10,
          y: position.y + Math.random() * 5,
          z: position.z + (Math.random() - 0.5) * 10,
          duration: 1.5,
          ease: "power2.out"
        });

        gsap.to(particle.rotation, {
          x: Math.random() * Math.PI * 4,
          y: Math.random() * Math.PI * 4,
          z: Math.random() * Math.PI * 4,
          duration: 1.5,
          ease: "power2.out"
        });

        gsap.to(particle.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: "power2.in",
          onComplete: () => {
            if (i === 19 && index === pancakesRef.current.length - 1) {
              // Last particle of last pancake
              particlesGroup.removeFromParent();
              particles.forEach(p => {
                p.geometry.dispose();
                (p.material as THREE.Material).dispose();
              });
              setIsAnimating(false);
            }
          }
        });
      }
    });

    // Hide original pancakes during the effect
    groupRef.current.visible = false;

    // After particles fade out, show the new arrangement
    gsap.delayedCall(1.5, () => {
      groupRef.current!.visible = true;
    });
  };

  // Update the pancakes effect to include the shatter transition
  useEffect(() => {
    if (!groupRef.current || !sceneRef.current) return;

    // Remove existing pancakes
    pancakesRef.current.forEach(pancake => {
      groupRef.current!.remove(pancake);
      pancake.geometry.dispose();
      (pancake.material as THREE.Material).dispose();
    });
    pancakesRef.current = [];

    // Create new pancakes with scale animation
    arrangement.forEach((size, index) => {
      const shape = new THREE.Shape();
      const width = size * 2;
      const depth = 2;
      const radius = 0.2;

      shape.moveTo(-width/2 + radius, -depth/2);
      shape.lineTo(width/2 - radius, -depth/2);
      shape.quadraticCurveTo(width/2, -depth/2, width/2, -depth/2 + radius);
      shape.lineTo(width/2, depth/2 - radius);
      shape.quadraticCurveTo(width/2, depth/2, width/2 - radius, depth/2);
      shape.lineTo(-width/2 + radius, depth/2);
      shape.quadraticCurveTo(-width/2, depth/2, -width/2, depth/2 - radius);
      shape.lineTo(-width/2, -depth/2 + radius);
      shape.quadraticCurveTo(-width/2, -depth/2, -width/2 + radius, -depth/2);

      const extrudeSettings = {
        steps: 1,
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 5
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`hsl(${size * 40}, 70%, 50%)`),
        roughness: 0.4,
        metalness: 0.1
      });

      const pancake = new THREE.Mesh(geometry, material);
      pancake.position.y = index * 0.6;
      pancake.castShadow = true;
      pancake.receiveShadow = true;
      pancake.rotation.x = Math.PI / 2;
      pancake.scale.set(0, 0, 0); // Start with zero scale
      groupRef.current!.add(pancake);
      pancakesRef.current.push(pancake);

      // Animate pancake appearance
      gsap.to(pancake.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        delay: index * 0.1,
        ease: "back.out(1.7)"
      });
    });
  }, [arrangement]);

  // Handle click events
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handleClick(event: MouseEvent) {
      if (isAnimating) return;

      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);
      const intersects = raycaster.intersectObjects(pancakesRef.current);

      if (intersects.length > 0) {
        soundEffect.playClick();
        const clickedIndex = pancakesRef.current.indexOf(intersects[0].object as THREE.Mesh);
        flipPancakes(clickedIndex);
        onFlip(clickedIndex);
      }
    }

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [isAnimating]);


  const flipPancakes = (index: number) => {
    if (isAnimating || !groupRef.current) return;
    setIsAnimating(true);

    const stackHeight = 0.6;
    const liftHeight = 3;

    const flipGroup = new THREE.Group();
    const pancakesToFlip = pancakesRef.current.slice(index);

    const pivotY = (index + pancakesToFlip.length) / 2 * stackHeight;
    flipGroup.position.y = pivotY;

    const finalPositions = pancakesToFlip.map((_, i) => ({
      pancake: pancakesToFlip[pancakesToFlip.length - 1 - i],
      finalY: (index + i) * stackHeight
    }));

    pancakesToFlip.forEach((pancake, i) => {
      const relativeY = pancake.position.y - pivotY;
      pancake.position.y = relativeY;
      flipGroup.add(pancake);
    });

    groupRef.current.add(flipGroup);

    const tl = gsap.timeline({
      onComplete: () => {
        flipGroup.rotation.x = 0;

        finalPositions.forEach(({ pancake, finalY }) => {
          pancake.position.y = finalY;
          groupRef.current!.add(pancake);
        });

        pancakesRef.current.sort((a, b) => a.position.y - b.position.y);
        flipGroup.removeFromParent();
        setIsAnimating(false);
      }
    });

    tl.to(flipGroup.rotation, {
      x: Math.PI,
      duration: 0.7,
      ease: "power1.inOut"
    });

    tl.to(flipGroup.position, {
      y: `+=${liftHeight}`,
      duration: 0.35,
      ease: "power2.out"
    }, 0);

    tl.to(flipGroup.position, {
      y: pivotY,
      duration: 0.35,
      ease: "power2.in"
    }, 0.35);
  };

  return <div ref={containerRef} className="w-full h-screen" />;
}